from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import torch

app = FastAPI(title="NLP Health Keyword Service")

# Load model globally so it stays in memory
# AITeamVN/Vietnamese_Embedding is fine-tuned from BGE-M3 for Vietnamese
model = SentenceTransformer("AITeamVN/Vietnamese_Embedding")
model.max_seq_length = 2048

class SimilarityRequest(BaseModel):
    query: str
    keywords: list[str]

class SimilarityResponse(BaseModel):
    best_match: str
    max_score: float

@app.post("/similarity", response_model=SimilarityResponse)
def compute_similarity(req: SimilarityRequest):
    if not req.query or not req.keywords:
        return SimilarityResponse(best_match="", max_score=0.0)

    # Encode query and keywords
    query_embedding = model.encode([req.query])
    doc_embeddings = model.encode(req.keywords)
    
    # Calculate dot product similarity
    similarity = query_embedding @ doc_embeddings.T
    
    # Find the best match
    # similarity is a 2D numpy array: [[score1, score2, ...]]
    scores = similarity[0]
    max_idx = scores.argmax()
    max_score = float(scores[max_idx])
    best_match = req.keywords[max_idx]

    return SimilarityResponse(
        best_match=best_match,
        max_score=max_score
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
