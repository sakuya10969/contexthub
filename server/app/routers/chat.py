from fastapi import APIRouter, HTTPException

from app.services.chat_service import chat_service
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message must not be empty")
    return chat_service.chat(request.message, request.top_k)
