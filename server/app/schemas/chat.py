from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    top_k: int = Field(default=5, ge=1, le=20)


class Citation(BaseModel):
    document_id: str
    chunk_id: str
    file_name: str
    content: str
    page_number: int | None
    chunk_index: int
    score: float


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]
