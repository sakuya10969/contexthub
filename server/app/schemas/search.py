from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)


class SearchResult(BaseModel):
    document_id: str
    chunk_id: str
    file_name: str
    content: str
    page_number: int | None
    chunk_index: int
    score: float


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
