"""
ingestor.py — Advanced RAG Explorer
Handles: CSV/Excel parsing → row serialisation → semantic chunking → embedding → ChromaDB storage
"""

import os
import json
import time
import uuid
from typing import Generator

import pandas as pd
import numpy as np
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# ──────────────────────────────────────────────
# Paths
# ──────────────────────────────────────────────
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
COLLECTION_NAME = "advanced_rag_testcases"
EMBED_MODEL_NAME = "nomic-ai/nomic-embed-text-v1.5"

# Singletons
_embed_model: SentenceTransformer | None = None
_chroma_client: chromadb.PersistentClient | None = None
_collection = None


# ──────────────────────────────────────────────
# Singletons
# ──────────────────────────────────────────────
def get_embed_model() -> SentenceTransformer:
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(
            EMBED_MODEL_NAME,
            trust_remote_code=True,
            device="cpu"
        )
    return _embed_model


def get_chroma() -> tuple:
    global _chroma_client, _collection
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
    if _collection is None:
        _collection = _chroma_client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
    return _chroma_client, _collection


# ──────────────────────────────────────────────
# Step 1 – Parse File
# ──────────────────────────────────────────────
def _paragraphs_to_df(paragraphs: list[str]) -> pd.DataFrame:
    """Convert a list of text paragraphs into a single-column DataFrame."""
    rows = [p.strip() for p in paragraphs if p.strip()]
    if not rows:
        rows = ["(empty document)"]
    return pd.DataFrame({"content": rows})


def parse_file(file_bytes: bytes, filename: str) -> tuple[pd.DataFrame, dict]:
    """Parse CSV, Excel, DOCX, PDF, or TXT bytes into a DataFrame."""
    from io import BytesIO
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext == "csv":
        df = pd.read_csv(BytesIO(file_bytes))
    elif ext in ("xlsx", "xls"):
        df = pd.read_excel(BytesIO(file_bytes))
    elif ext == "txt":
        text = file_bytes.decode("utf-8", errors="replace")
        paragraphs = [p for p in text.split("\n\n") if p.strip()]
        df = _paragraphs_to_df(paragraphs)
    elif ext == "docx":
        try:
            import docx2txt
            text = docx2txt.process(BytesIO(file_bytes))
        except ImportError:
            from docx import Document as DocxDocument
            doc = DocxDocument(BytesIO(file_bytes))
            text = "\n\n".join(p.text for p in doc.paragraphs)
        paragraphs = [p for p in text.split("\n\n") if p.strip()]
        df = _paragraphs_to_df(paragraphs)
    elif ext == "pdf":
        try:
            from pypdf import PdfReader
        except ImportError:
            from PyPDF2 import PdfReader
        reader = PdfReader(BytesIO(file_bytes))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n\n".join(pages)
        paragraphs = [p for p in text.split("\n\n") if p.strip()]
        df = _paragraphs_to_df(paragraphs)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Supported: csv, xlsx, xls, docx, pdf, txt")

    df = df.fillna("").astype(str)
    stats = {
        "filename": filename,
        "rows": len(df),
        "columns": list(df.columns),
        "col_count": len(df.columns),
    }
    return df, stats


# ──────────────────────────────────────────────
# Step 2 – Serialise Rows to Text
# ──────────────────────────────────────────────
def rows_to_texts(df: pd.DataFrame) -> list[str]:
    """Convert each DataFrame row to a pipe-delimited text string."""
    texts = []
    for _, row in df.iterrows():
        parts = [f"{col}: {val}" for col, val in row.items() if val.strip()]
        texts.append(" | ".join(parts))
    return texts


# ──────────────────────────────────────────────
# Step 3 – Chunk Texts (sliding-window over rows)
# ──────────────────────────────────────────────
def chunk_texts(
    texts: list[str],
    df: pd.DataFrame,
    chunk_size: int = 5,
    overlap: int = 1,
) -> list[dict]:
    """
    Group `chunk_size` row-texts per chunk with `overlap` rows shared between
    adjacent chunks. Each chunk dict contains full metadata.
    """
    chunks = []
    total = len(texts)
    step = max(1, chunk_size - overlap)
    chunk_idx = 0
    start = 0

    while start < total:
        end = min(start + chunk_size, total)
        chunk_texts_slice = texts[start:end]
        combined = "\n".join(chunk_texts_slice)

        # Row-level metadata for the chunk
        row_data = df.iloc[start:end].to_dict(orient="records")

        chunks.append({
            "chunk_id": str(uuid.uuid4()),
            "chunk_index": chunk_idx,
            "start_row": start,
            "end_row": end - 1,
            "row_count": end - start,
            "overlap_rows": overlap if start > 0 else 0,
            "text": combined,
            "char_count": len(combined),
            "word_count": len(combined.split()),
            "row_data": row_data,
            "embedding": None,
            "embedding_dims": 0,
            "embedding_preview": [],
        })
        chunk_idx += 1
        start += step

    return chunks


# ──────────────────────────────────────────────
# Step 4 – Embed Chunks
# ──────────────────────────────────────────────
def embed_chunks(chunks: list[dict]) -> list[dict]:
    """Generate embeddings for all chunks using Nomic Embed."""
    model = get_embed_model()
    texts = [c["text"] for c in chunks]
    # Batch embed all at once for speed
    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    for chunk, emb in zip(chunks, embeddings):
        emb_list = emb.tolist()
        chunk["embedding"] = emb_list
        chunk["embedding_dims"] = len(emb_list)
        chunk["embedding_preview"] = [round(v, 6) for v in emb_list[:20]]
    return chunks


# ──────────────────────────────────────────────
# Step 5 – Store in ChromaDB
# ──────────────────────────────────────────────
def store_chunks(chunks: list[dict]) -> dict:
    """Upsert all embedded chunks into ChromaDB. Returns storage stats."""
    _, collection = get_chroma()

    ids = []
    documents = []
    embeddings = []
    metadatas = []

    for chunk in chunks:
        ids.append(chunk["chunk_id"])
        documents.append(chunk["text"])
        embeddings.append(chunk["embedding"])
        metadatas.append({
            "chunk_index": chunk["chunk_index"],
            "start_row": chunk["start_row"],
            "end_row": chunk["end_row"],
            "row_count": chunk["row_count"],
            "overlap_rows": chunk["overlap_rows"],
            "word_count": chunk["word_count"],
            "char_count": chunk["char_count"],
            "embedding_dims": chunk["embedding_dims"],
        })

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )

    total_stored = collection.count()
    return {
        "chunks_added": len(chunks),
        "total_in_db": total_stored,
        "collection": COLLECTION_NAME,
        "embedding_model": EMBED_MODEL_NAME,
        "embedding_dims": chunks[0]["embedding_dims"] if chunks else 0,
    }


# ──────────────────────────────────────────────
# Full Ingestion Pipeline (returns stages for SSE)
# ──────────────────────────────────────────────
def full_ingest_pipeline(
    file_bytes: bytes,
    filename: str,
    chunk_size: int = 5,
    overlap: int = 1,
) -> Generator[dict, None, None]:
    """
    Generator that yields progress events as dicts.
    Each event: {"stage": str, "progress": 0-100, "data": any}
    """
    # Stage 1: Parse
    yield {"stage": "parse", "progress": 5, "message": "Parsing file…", "data": None}
    df, file_stats = parse_file(file_bytes, filename)
    yield {"stage": "parse_done", "progress": 15, "message": f"Parsed {file_stats['rows']} rows, {file_stats['col_count']} columns", "data": file_stats}

    # Stage 2: Serialise rows
    yield {"stage": "serialize", "progress": 20, "message": "Serialising rows to text…", "data": None}
    texts = rows_to_texts(df)
    # Return a preview of first 5 row texts
    preview_texts = texts[:5]
    yield {"stage": "serialize_done", "progress": 30, "message": f"Serialised {len(texts)} rows", "data": {"preview": preview_texts, "total": len(texts)}}

    # Stage 3: Chunk
    yield {"stage": "chunk", "progress": 35, "message": f"Chunking (size={chunk_size}, overlap={overlap})…", "data": None}
    chunks = chunk_texts(texts, df, chunk_size=chunk_size, overlap=overlap)
    chunk_stats = {
        "total_chunks": len(chunks),
        "chunk_size": chunk_size,
        "overlap": overlap,
        "chunks_preview": [
            {
                "chunk_index": c["chunk_index"],
                "start_row": c["start_row"],
                "end_row": c["end_row"],
                "row_count": c["row_count"],
                "overlap_rows": c["overlap_rows"],
                "word_count": c["word_count"],
                "char_count": c["char_count"],
                "text_preview": c["text"][:300],
            }
            for c in chunks
        ],
    }
    yield {"stage": "chunk_done", "progress": 50, "message": f"Created {len(chunks)} chunks", "data": chunk_stats}

    # Stage 4: Embed
    yield {"stage": "embed", "progress": 55, "message": f"Generating embeddings ({EMBED_MODEL_NAME})…", "data": None}
    chunks = embed_chunks(chunks)
    embed_stats = {
        "embedding_model": EMBED_MODEL_NAME,
        "embedding_dims": chunks[0]["embedding_dims"] if chunks else 0,
        "sample_preview": chunks[0]["embedding_preview"] if chunks else [],
    }
    yield {"stage": "embed_done", "progress": 80, "message": f"Embeddings ready ({embed_stats['embedding_dims']} dims)", "data": embed_stats}

    # Stage 5: Store
    yield {"stage": "store", "progress": 85, "message": "Storing in ChromaDB…", "data": None}
    storage_stats = store_chunks(chunks)
    yield {"stage": "store_done", "progress": 95, "message": f"Stored {storage_stats['chunks_added']} chunks (total in DB: {storage_stats['total_in_db']})", "data": storage_stats}

    # Final
    yield {"stage": "complete", "progress": 100, "message": "Ingestion complete!", "data": {
        "file_stats": file_stats,
        "chunk_stats": chunk_stats,
        "embed_stats": embed_stats,
        "storage_stats": storage_stats,
        "chunks_detail": [
            {
                "chunk_id": c["chunk_id"],
                "chunk_index": c["chunk_index"],
                "start_row": c["start_row"],
                "end_row": c["end_row"],
                "row_count": c["row_count"],
                "overlap_rows": c["overlap_rows"],
                "word_count": c["word_count"],
                "char_count": c["char_count"],
                "embedding_dims": c["embedding_dims"],
                "embedding_preview": c["embedding_preview"],
                "text_preview": c["text"][:400],
            }
            for c in chunks
        ],
    }}


# ──────────────────────────────────────────────
# DB Stats
# ──────────────────────────────────────────────
def get_db_stats() -> dict:
    """Return collection statistics."""
    _, collection = get_chroma()
    count = collection.count()
    if count == 0:
        return {"total_chunks": 0, "collection": COLLECTION_NAME, "chunks": []}

    result = collection.get(include=["documents", "metadatas"])
    chunks = []
    for i in range(len(result["ids"])):
        chunks.append({
            "id": result["ids"][i],
            "text_preview": result["documents"][i][:300] if result["documents"] else "",
            "metadata": result["metadatas"][i] if result["metadatas"] else {},
        })
    return {
        "total_chunks": count,
        "collection": COLLECTION_NAME,
        "embedding_model": EMBED_MODEL_NAME,
        "chunks": chunks,
    }


# ──────────────────────────────────────────────
# Reset DB
# ──────────────────────────────────────────────
def reset_db() -> dict:
    """Delete and recreate the collection."""
    global _collection
    client, _ = get_chroma()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
    _collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    return {"status": "reset", "collection": COLLECTION_NAME}
