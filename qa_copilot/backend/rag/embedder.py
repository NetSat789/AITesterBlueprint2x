from sentence_transformers import SentenceTransformer
from backend.config import settings

class Embedder:
    def __init__(self):
        # We will use sentence-transformers. 
        # nomic-embed-text or a standard miniLM model.
        # Fallback to all-MiniLM-L6-v2 if nomic model is large or needs specific trust_remote_code
        model_name = settings.EMBED_MODEL if "nomic" not in settings.EMBED_MODEL else "all-MiniLM-L6-v2"
        try:
            self.model = SentenceTransformer(model_name, trust_remote_code=True)
        except Exception:
            # Fallback to a highly reliable small model
            self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def embed_text(self, text: str) -> list[float]:
        """Embeds a single string into a vector."""
        return self.model.encode(text).tolist()

    def embed_texts(self, texts: list[str]) -> list[list[float]]:
        """Embeds a list of strings into a list of vectors."""
        return self.model.encode(texts).tolist()

embedder = Embedder()
