from app.clients.bedrock_client import bedrock_client
from app.clients.opensearch_client import opensearch_client
from app.schemas.search import SearchResult


class SearchService:
    def search(self, query: str, top_k: int) -> list[SearchResult]:
        embedding = bedrock_client.embed(query)
        hits = opensearch_client.search_knn(embedding, top_k)
        return [
            SearchResult(
                document_id=h["document_id"],
                chunk_id=h["chunk_id"],
                file_name=h["file_name"],
                content=h["content"],
                page_number=h.get("page_number"),
                chunk_index=h["chunk_index"],
                score=h["score"],
            )
            for h in hits
        ]


search_service = SearchService()
