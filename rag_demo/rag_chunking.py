"""
=============================================================
  RAG Demo: Document Chunking + Nomic Embed Embeddings
  Story: PQRS - The Software Tester
=============================================================

  This script demonstrates:
  1. Loading a plain-text document
  2. Chunking it into overlapping passages
  3. Generating embeddings using Nomic Embed (via Ollama)
  4. Printing each chunk with its metadata
  5. Saving everything to chunks_output.json for the HTML viewer

  Prerequisites:
    pip install requests numpy
    ollama pull nomic-embed-text    ← run this once in your terminal

  Run:
    python rag_chunking.py
=============================================================
"""

import os
import sys
import json
import time
import textwrap
import requests
import numpy as np

# Fix Windows console encoding so the script runs without PYTHONIOENCODING env var
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────
DOCUMENT_PATH   = "story_pqrs.txt"      # The source story
CHUNK_SIZE      = 300                   # Words per chunk
CHUNK_OVERLAP   = 50                    # Overlap words between chunks
OLLAMA_API      = "http://localhost:11434/api/embeddings"
EMBED_MODEL     = "nomic-embed-text"    # The Nomic embedding model
OUTPUT_JSON     = "chunks_output.json"  # Saved for HTML viewer

SEPARATOR = "=" * 70


# ─────────────────────────────────────────────────────────────
# STEP 1 — LOAD DOCUMENT
# ─────────────────────────────────────────────────────────────
def load_document(path: str) -> str:
    """Read the raw text file."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    return text


# ─────────────────────────────────────────────────────────────
# STEP 2 — CHUNK BY WORD COUNT WITH OVERLAP
# ─────────────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[dict]:
    """
    Sliding-window word-level chunking.

    chunk_size : number of words per chunk
    overlap    : how many words from the previous chunk to repeat
                 so that context is not lost at boundaries
    """
    words = text.split()
    chunks = []
    start  = 0
    index  = 0

    while start < len(words):
        end        = start + chunk_size
        chunk_words = words[start:end]
        chunk_text  = " ".join(chunk_words)

        chunks.append({
            "chunk_index" : index,
            "start_word"  : start,
            "end_word"    : min(end, len(words)),
            "word_count"  : len(chunk_words),
            "text"        : chunk_text,
            "embedding"   : None,   # filled in Step 3
        })

        index += 1
        # slide forward by (chunk_size - overlap)
        start += chunk_size - overlap

    return chunks


# ─────────────────────────────────────────────────────────────
# STEP 3 — GENERATE EMBEDDINGS WITH NOMIC EMBED
# ─────────────────────────────────────────────────────────────
def get_embedding(text: str) -> list[float] | None:
    """
    Call Ollama's local REST API to embed a single text with
    the nomic-embed-text model.  Returns None on failure.
    """
    payload = {"model": EMBED_MODEL, "prompt": text}
    try:
        resp = requests.post(OLLAMA_API, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()["embedding"]
    except requests.exceptions.ConnectionError:
        return None          # Ollama not running — handled gracefully
    except Exception as exc:
        print(f"  [WARN] Embedding error: {exc}")
        return None


def embed_chunks(chunks: list[dict]) -> list[dict]:
    """Attach embeddings to every chunk dict."""
    total = len(chunks)
    for i, chunk in enumerate(chunks):
        print(f"  Embedding chunk {i+1}/{total} …", end="\r")
        chunk["embedding"] = get_embedding(chunk["text"])
        time.sleep(0.05)   # small pause to avoid hammering the API
    print()  # newline after the progress line
    return chunks


# ─────────────────────────────────────────────────────────────
# STEP 4 — COSINE SIMILARITY (simple demo query)
# ─────────────────────────────────────────────────────────────
def cosine_similarity(a: list[float], b: list[float]) -> float:
    a, b = np.array(a), np.array(b)
    if np.linalg.norm(a) == 0 or np.linalg.norm(b) == 0:
        return 0.0
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def query_chunks(query: str, chunks: list[dict], top_k: int = 3) -> list[dict]:
    """Find the top-k most similar chunks to a query."""
    q_emb = get_embedding(query)
    if q_emb is None:
        return []

    scored = []
    for chunk in chunks:
        if chunk["embedding"] is not None:
            sim = cosine_similarity(q_emb, chunk["embedding"])
            scored.append((sim, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [(sim, ch) for sim, ch in scored[:top_k]]


# ─────────────────────────────────────────────────────────────
# PRETTY PRINTER
# ─────────────────────────────────────────────────────────────
def print_chunk(chunk: dict):
    wrap_width = 68
    print(SEPARATOR)
    print(f"  CHUNK #{chunk['chunk_index'] + 1:02d}  |  "
          f"Words: {chunk['word_count']}  |  "
          f"Word range: [{chunk['start_word']} → {chunk['end_word']}]")
    print(SEPARATOR)

    # Wrap and indent the chunk text
    wrapped = textwrap.fill(chunk["text"], width=wrap_width)
    for line in wrapped.splitlines():
        print(f"  {line}")

    print()
    emb = chunk["embedding"]
    if emb:
        preview = [round(v, 6) for v in emb[:6]]
        print(f"  Embedding dims : {len(emb)}")
        print(f"  Embedding[0:6] : {preview} …")
    else:
        print("  Embedding      : ⚠  Not available (Ollama not running?)")
    print()


# ─────────────────────────────────────────────────────────────
# SAVE TO JSON (for the HTML viewer)
# ─────────────────────────────────────────────────────────────
def save_json(chunks: list[dict], path: str):
    """Truncate embeddings to first 20 dims to keep JSON small."""
    export = []
    for ch in chunks:
        emb = ch["embedding"]
        export.append({
            "chunk_index"   : ch["chunk_index"],
            "start_word"    : ch["start_word"],
            "end_word"      : ch["end_word"],
            "word_count"    : ch["word_count"],
            "text"          : ch["text"],
            "embedding_dims": len(emb) if emb else 0,
            "embedding_preview": [round(v, 6) for v in (emb[:20] if emb else [])],
            "has_embedding" : emb is not None,
        })
    with open(path, "w", encoding="utf-8") as f:
        json.dump(export, f, indent=2, ensure_ascii=False)
    print(f"\n  ✔  Saved {len(export)} chunks → {path}")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("\n" + SEPARATOR)
    print("  RAG DEMO — Document Chunking with Nomic Embed")
    print(SEPARATOR + "\n")

    # ── 1. Load ──────────────────────────────────────────────
    print("[*] Loading document ...")
    raw_text = load_document(DOCUMENT_PATH)
    word_count = len(raw_text.split())
    print(f"   File       : {DOCUMENT_PATH}")
    print(f"   Total words: {word_count}\n")

    # ── 2. Chunk ──────────────────────────────────────────────
    print(f"[*] Chunking  (size={CHUNK_SIZE} words, overlap={CHUNK_OVERLAP} words) ...")
    chunks = chunk_text(raw_text, CHUNK_SIZE, CHUNK_OVERLAP)
    print(f"   Total chunks created: {len(chunks)}\n")

    # ── 3. Embed ──────────────────────────────────────────────
    print("[*] Generating embeddings via Nomic Embed (Ollama) ...")
    print(f"   Model  : {EMBED_MODEL}")
    print(f"   API URL: {OLLAMA_API}\n")
    chunks = embed_chunks(chunks)

    # ── 4. Print all chunks ───────────────────────────────────
    print("\n" + SEPARATOR)
    print("  ALL CHUNKS - FULL DETAIL VIEW")
    print(SEPARATOR)
    for chunk in chunks:
        print_chunk(chunk)

    # ── 5. Simple query demo ──────────────────────────────────
    demo_query = "What is the RAG system that PQRS built?"
    print("\n" + SEPARATOR)
    print(f"  QUERY DEMO: \"{demo_query}\"")
    print(SEPARATOR)
    results = query_chunks(demo_query, chunks, top_k=3)

    if results:
        for rank, (score, ch) in enumerate(results, 1):
            print(f"\n  Rank #{rank}  |  Chunk #{ch['chunk_index']+1}  |  "
                  f"Cosine similarity: {score:.4f}")
            print(f"  " + "-" * 60)
            preview = textwrap.fill(ch["text"][:300] + " ...", width=66)
            for line in preview.splitlines():
                print(f"  {line}")
    else:
        print("  (Skipped - embeddings not available)")

    # ── 6. Save JSON ──────────────────────────────────────────
    print("\n" + SEPARATOR)
    print("  SAVING OUTPUT")
    print(SEPARATOR)
    save_json(chunks, OUTPUT_JSON)
    print("\n  Open  chunks_viewer.html  in your browser to see the visual view.")
    print("\n" + SEPARATOR + "\n")
    print("  NOTE: To enable Nomic Embed embeddings, install Ollama and run:")
    print("        ollama pull nomic-embed-text")
    print("        Then re-run this script.\n")


if __name__ == "__main__":
    main()
