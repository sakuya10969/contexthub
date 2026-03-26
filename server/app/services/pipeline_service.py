import uuid
from datetime import datetime

from app.models.document import DocumentStatus
from app.services.document_service import document_service
from app.clients.s3_client import s3_client
from app.clients.bedrock_client import bedrock_client
from app.clients.opensearch_client import opensearch_client
from app.utils.text_extractor import extract
from app.utils.chunker import chunk_document


class PipelineService:
    def run(self, document_id: str) -> None:
        doc = document_service.get_document(document_id)
        document_service.update_status(document_id, DocumentStatus.processing)

        try:
            data = s3_client.download(doc.s3_key)
            pages = extract(data, doc.file_type)
            raw_chunks = chunk_document(pages)

            chunks_to_index = []
            for raw in raw_chunks:
                embedding = bedrock_client.embed(raw["content"])
                chunks_to_index.append(
                    {
                        "document_id": document_id,
                        "chunk_id": str(uuid.uuid4()),
                        "file_name": doc.file_name,
                        "content": raw["content"],
                        "embedding": embedding,
                        "page_number": raw["page_number"],
                        "chunk_index": raw["chunk_index"],
                        "created_at": datetime.utcnow().isoformat(),
                    }
                )

            opensearch_client.bulk_index(chunks_to_index)
            document_service.update_status(document_id, DocumentStatus.indexed)

        except Exception as e:
            document_service.update_status(
                document_id, DocumentStatus.failed, error_message=str(e)
            )
            raise

    def reindex(self, document_id: str) -> None:
        doc = document_service.get_document(document_id)
        if doc.status == DocumentStatus.processing:
            from fastapi import HTTPException
            raise HTTPException(status_code=409, detail="Document is currently processing")

        opensearch_client.delete_by_document_id(document_id)
        self.run(document_id)


pipeline_service = PipelineService()
