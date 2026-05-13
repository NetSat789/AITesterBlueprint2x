import os
import glob
from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from fastapi.responses import FileResponse

# Langchain and Chroma
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

app = FastAPI(title="Chroma RAG Demo")

# Create data directory if it doesn't exist
os.makedirs("data", exist_ok=True)
os.makedirs("chroma_db", exist_ok=True)

embeddings = None
vectorstore = None

def get_vectorstore():
    global embeddings, vectorstore
    if embeddings is None:
        print("Initializing embeddings model (this may take a moment to download)...")
        embeddings = HuggingFaceEmbeddings(
            model_name="nomic-ai/nomic-embed-text-v1.5",
            model_kwargs={'device': 'cpu', 'trust_remote_code': True}
        )
    if vectorstore is None:
        vectorstore = Chroma(
            collection_name="pdf_rag_collection",
            embedding_function=embeddings,
            persist_directory="./chroma_db"
        )
    return vectorstore

class QueryRequest(BaseModel):
    query: str
    api_key: str = ""

@app.post("/api/ingest")
async def ingest_pdfs():
    pdf_files = glob.glob("data/*.pdf")
    docx_files = glob.glob("data/*.docx")
    all_files = pdf_files + docx_files
    if not all_files:
        raise HTTPException(status_code=404, detail="No PDF or DOCX files found in data/ directory")

    all_docs = []
    for file_path in all_files:
        try:
            if file_path.lower().endswith('.pdf'):
                loader = PyPDFLoader(file_path)
            elif file_path.lower().endswith('.docx'):
                loader = Docx2txtLoader(file_path)
            else:
                continue
            docs = loader.load()
            all_docs.extend(docs)
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Error reading {file_path}: {e}")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    chunks = text_splitter.split_documents(all_docs)
    
    if not chunks:
        raise HTTPException(status_code=400, detail="No text could be extracted from the PDFs")

    vs = get_vectorstore()
    vs.delete_collection()
    global vectorstore, embeddings
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        collection_name="pdf_rag_collection",
        persist_directory="./chroma_db"
    )

    return {
        "status": "success", 
        "message": f"Successfully ingested {len(pdf_files)} PDFs and created {len(chunks)} chunks.",
        "chunks_count": len(chunks)
    }

@app.post("/api/query")
async def query_rag(req: QueryRequest):
    if not req.query:
        raise HTTPException(status_code=400, detail="Query is required")
        
    groq_api_key = req.api_key or os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise HTTPException(status_code=400, detail="Groq API key is required")

    try:
        # Retrieve chunks
        vs = get_vectorstore()
        docs = vs.similarity_search(req.query, k=3)
        context = "\n\n".join([d.page_content for d in docs])

        # Prepare LLM
        llm = ChatGroq(
            api_key=groq_api_key, 
            model_name="llama-3.1-8b-instant"
        )
        
        prompt_template = PromptTemplate(
            template="Answer the user's question based only on the following context:\n\n{context}\n\nQuestion: {question}",
            input_variables=["context", "question"]
        )
        
        chain = prompt_template | llm
        
        response = chain.invoke({"context": context, "question": req.query})
        
        # Format the retrieved chunks for the visualization
        retrieved_chunks = [
            {
                "content": doc.page_content, 
                "metadata": doc.metadata
            } for doc in docs
        ]

        return {
            "answer": response.content,
            "chunks": retrieved_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database")
async def get_database():
    try:
        # Get all documents from Chroma
        vs = get_vectorstore()
        result = vs.get()
        if not result or not result.get("documents"):
            return {"chunks": []}
            
        chunks = []
        for i in range(len(result["ids"])):
            chunks.append({
                "id": result["ids"][i],
                "content": result["documents"][i],
                "metadata": result["metadatas"][i] if result["metadatas"] else {}
            })
        return {"chunks": chunks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files")
async def get_files():
    pdf_files = glob.glob("data/*.pdf")
    docx_files = glob.glob("data/*.docx")
    all_files = pdf_files + docx_files
    return {"files": [os.path.basename(f) for f in all_files]}

# Serve the static files
app.mount("/", StaticFiles(directory="static", html=True), name="static")
# To serve the actual PDFs so the UI can embed them
app.mount("/data", StaticFiles(directory="data"), name="data")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
