from opensearchpy import OpenSearch, helpers
from app.core.config import settings

INDEX_NAME = settings.opensearch_index

INDEX_BODY = {
    "settings": {
        "index": {
            "knn": True,
            "number_of_shards": 1,
            "number_of_replicas": 0,
        }
    },
    "mappings": {
        "properties": {
            "document_id": {"type": "keyword"},
            "chunk_id": {"type": "keyword"},
            "file_name": {"type": "keyword"},
            "content": {"type": "text", "analyzer": "standard"},
            "embedding": {
                "type": "knn_vector",
                "dimension": 1024,
                "method": {
                    "name": "hnsw",
                    "space_type": "cosinesimil",
                    "engine": "nmslib",
                },
            },
            "page_number": {"type": "integer"},
            "chunk_index": {"type": "integer"},
            "created_at": {"type": "date"},
        }
    },
}


class OpenSearchClient:
    def __init__(self) -> None:
        self._client = OpenSearch(hosts=[settings.opensearch_url])

    def ensure_index(self) -> None:
        if not self._client.indices.exists(index=INDEX_NAME):
            self._client.indices.create(index=INDEX_NAME, body=INDEX_BODY)

    def bulk_index(self, chunks: list[dict]) -> None:
        self.ensure_index()
        actions = [
            {
                "_index": INDEX_NAME,
                "_id": chunk["chunk_id"],
                "_source": chunk,
            }
            for chunk in chunks
        ]
        helpers.bulk(self._client, actions)

    def search_knn(self, embedding: list[float], top_k: int) -> list[dict]:
        self.ensure_index()
        query = {
            "size": top_k,
            "query": {
                "knn": {
                    "embedding": {
                        "vector": embedding,
                        "k": top_k,
                    }
                }
            },
        }
        response = self._client.search(index=INDEX_NAME, body=query)
        hits = response["hits"]["hits"]
        results = []
        for hit in hits:
            src = hit["_source"]
            results.append({**src, "score": hit["_score"]})
        return results

    def delete_by_document_id(self, document_id: str) -> None:
        self.ensure_index()
        query = {"query": {"term": {"document_id": document_id}}}
        self._client.delete_by_query(index=INDEX_NAME, body=query)


opensearch_client = OpenSearchClient()
