import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434")
    EMBED_MODEL: str = os.getenv("EMBED_MODEL", "nomic-embed-text")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "cross-encoder/ms-marco-MiniLM-L-6-v2")

    class Config:
        env_file = ".env"

settings = Settings()
