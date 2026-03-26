from fastapi import APIRouter, HTTPException

from app.services.search_service import search_service
from app.schemas.search import SearchRequest, SearchResponse

router = APIRouter(prefix="/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query must not be empty")
    results = search_service.search(request.query, request.top_k)
    return SearchResponse(query=request.query, results=results)
