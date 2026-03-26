from app.services.search_service import search_service
from app.clients.bedrock_client import bedrock_client
from app.schemas.chat import Citation, ChatResponse


_SYSTEM_PROMPT = """あなたは提供された文書コンテキストに基づいて質問に回答するアシスタントです。
以下のコンテキストを参考にして、ユーザーの質問に日本語で回答してください。
コンテキストに情報がない場合は、その旨を正直に伝えてください。"""


class ChatService:
    def chat(self, message: str, top_k: int) -> ChatResponse:
        results = search_service.search(message, top_k)

        context_parts = []
        for i, r in enumerate(results, start=1):
            page_info = f" (p.{r.page_number})" if r.page_number else ""
            context_parts.append(
                f"[{i}] {r.file_name}{page_info}\n{r.content}"
            )
        context = "\n\n---\n\n".join(context_parts)

        prompt = (
            f"{_SYSTEM_PROMPT}\n\n"
            f"## コンテキスト\n\n{context}\n\n"
            f"## 質問\n\n{message}"
        )

        answer = bedrock_client.chat(prompt)

        citations = [
            Citation(
                document_id=r.document_id,
                chunk_id=r.chunk_id,
                file_name=r.file_name,
                content=r.content,
                page_number=r.page_number,
                chunk_index=r.chunk_index,
                score=r.score,
            )
            for r in results
        ]

        return ChatResponse(answer=answer, citations=citations)


chat_service = ChatService()
