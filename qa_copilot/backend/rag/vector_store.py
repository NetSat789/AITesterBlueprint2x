from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct
from backend.config import settings
import uuid

class VectorStore:
    def __init__(self):
        # Initialize Qdrant Client in local file mode (No Docker required!)
        self.client = QdrantClient(path="qdrant_local_db")
        self.collection_name = "qa_copilot"
        self._ensure_collection()

    def _ensure_collection(self):
        """Ensures the collection exists, creates it if not."""
        collections = self.client.get_collections().collections
        exists = any(c.name == self.collection_name for c in collections)
        
        if not exists:
            # We assume a dimension of 384 for all-MiniLM-L6-v2. 
            # If using nomic, it might be 768. 
            # We'll use 384 for now as default.
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE),
            )

    def add_texts(self, texts: list[str], vectors: list[list[float]], metadata: list[dict] = None):
        """Adds texts and their embeddings to Qdrant."""
        if metadata is None:
            metadata = [{} for _ in texts]

        points = []
        for i, (text, vector, meta) in enumerate(zip(texts, vectors, metadata)):
            payload = {"text": text, **meta}
            points.append(
                PointStruct(id=str(uuid.uuid4()), vector=vector, payload=payload)
            )
            
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(self, query_vector: list[float], limit: int = 5) -> list[dict]:
        """Searches for the closest vectors."""
        response = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=limit
        )
        
        # Return formatted results
        return [
            {
                "score": point.score,
                "text": point.payload.get("text", ""),
                "metadata": {k: v for k, v in point.payload.items() if k != "text"}
            }
            for point in response.points
        ]

vector_store = VectorStore()
