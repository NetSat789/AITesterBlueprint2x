from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from backend.rag.vector_store import vector_store
from backend.rag.embedder import embedder
from backend.rag.generator import generate_response
from backend.ingestion.pdf_parser import parse_pdf
from backend.ingestion.test_parser import parse_test_cases
from backend.ingestion.jira_parser import parse_jira_export

app = FastAPI(title="QA Co-Pilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    top_k: int = 5

@app.get("/")
def read_root():
    return {"status": "QA Co-Pilot API is running"}

@app.post("/api/query")
def query_rag(request: QueryRequest):
    try:
        # 1. Embed query
        query_vector = embedder.embed_text(request.query)
        
        # 2. Retrieve contexts
        results = vector_store.search(query_vector, limit=request.top_k)
        
        # 3. Format contexts
        context_str = "\n\n---\n\n".join([f"Source ({res['metadata']}):\n{res['text']}" for res in results])
        
        # 4. Generate response
        answer = generate_response(request.query, context_str)
        
        return {
            "answer": answer,
            "sources": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest/text")
def ingest_text(text: str, source_type: str = "general", source_name: str = "unknown"):
    """Simple endpoint to ingest text chunks directly."""
    try:
        vector = embedder.embed_text(text)
        vector_store.add_texts(
            texts=[text], 
            vectors=[vector], 
            metadata=[{"type": source_type, "source": source_name}]
        )
        return {"status": "success", "message": f"Ingested text from {source_name}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest/file")
async def ingest_file(file: UploadFile = File(...), source_type: str = Form("general")):
    """Endpoint to upload and ingest a file."""
    try:
        # Save file temporarily
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        chunks = []
        
        # Route to appropriate parser based on filename/extension
        filename_lower = file.filename.lower()
        if filename_lower.endswith(".pdf"):
            texts = parse_pdf(file_path)
            # Create standard chunk format
            chunks = [{"text": t, "metadata": {"source": file.filename, "type": "pdf"}} for t in texts]
            
        elif filename_lower.endswith((".csv", ".xls", ".xlsx")):
            if source_type == "jira":
                chunks = parse_jira_export(file_path)
            else:
                chunks = parse_test_cases(file_path)
                
        elif filename_lower.endswith(".json"):
            chunks = parse_jira_export(file_path)
            
        else:
            # Fallback to plain text
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
                chunks = [{"text": content, "metadata": {"source": file.filename, "type": "text"}}]

        if not chunks:
            raise ValueError(f"Could not extract text from {file.filename}")

        # Embed and store
        texts_to_embed = [c["text"] for c in chunks]
        vectors = embedder.embed_texts(texts_to_embed)
        metadata = [c.get("metadata", {"source": file.filename}) for c in chunks]
        
        vector_store.add_texts(texts=texts_to_embed, vectors=vectors, metadata=metadata)
        
        # Cleanup
        os.remove(file_path)
        
        return {"status": "success", "message": f"Ingested {len(chunks)} chunks from {file.filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
