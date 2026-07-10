"""
main.py — Advanced RAG Explorer
FastAPI backend: file upload, ingestion (SSE streaming), query, DB explorer
"""

import os
import sys
import json
import asyncio
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

# Adjust sys.path so imports from same dir work
sys.path.insert(0, os.path.dirname(__file__))

import ingestor
import retriever

# ──────────────────────────────────────────────
# App
# ──────────────────────────────────────────────
app = FastAPI(title="Advanced RAG Explorer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


# ──────────────────────────────────────────────
# Models
# ──────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    top_k: int = 10
    top_n_rerank: int = 5
    api_key: Optional[str] = ""


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Advanced RAG Explorer"}


@app.post("/api/upload-preview")
async def upload_preview(file: UploadFile = File(...)):
    """
    Parse the uploaded file and return a preview of rows + columns.
    Does NOT ingest — just lets the UI show the data before committing.
    """
    file_bytes = await file.read()
    try:
        df, stats = ingestor.parse_file(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Return first 20 rows as preview
    preview_rows = df.head(20).to_dict(orient="records")
    texts_preview = ingestor.rows_to_texts(df.head(5))

    return {
        "filename": file.filename,
        "rows": stats["rows"],
        "columns": stats["columns"],
        "col_count": stats["col_count"],
        "preview_rows": preview_rows,
        "row_texts_preview": texts_preview,
    }


@app.post("/api/ingest")
async def ingest_file(
    file: UploadFile = File(...),
    chunk_size: int = Form(5),
    overlap: int = Form(1),
):
    """
    Full ingestion pipeline streamed as Server-Sent Events (SSE).
    Each event is a JSON line: data: {...}\n\n
    """
    file_bytes = await file.read()
    filename = file.filename

    async def event_generator():
        loop = asyncio.get_event_loop()
        # Run the generator in a thread executor since it's CPU-bound
        pipeline = ingestor.full_ingest_pipeline(
            file_bytes=file_bytes,
            filename=filename,
            chunk_size=chunk_size,
            overlap=overlap,
        )
        for event in pipeline:
            payload = json.dumps(event, ensure_ascii=False)
            yield f"data: {payload}\n\n"
            await asyncio.sleep(0)  # yield control to event loop

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/query")
async def query_rag(req: QueryRequest):
    """
    Advanced RAG query: semantic search → re-rank → Groq LLM.
    Returns all intermediate steps for visualization.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        result = retriever.advanced_rag_query(
            query=req.query,
            top_k=req.top_k,
            top_n_rerank=req.top_n_rerank,
            api_key=req.api_key or None,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/database")
async def get_database():
    """Return all chunks stored in ChromaDB."""
    try:
        stats = ingestor.get_db_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats")
async def get_stats():
    """Return collection stats."""
    try:
        stats = ingestor.get_db_stats()
        return {
            "total_chunks": stats["total_chunks"],
            "collection": stats.get("collection", ""),
            "embedding_model": stats.get("embedding_model", ""),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/reset")
async def reset_database():
    """Clear the vector store."""
    try:
        result = ingestor.reset_db()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────
# Static files (frontend)
# ──────────────────────────────────────────────
@app.get("/")
async def serve_index():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    return FileResponse(index_path)

# Mount frontend dir for any other static assets
if os.path.exists(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
