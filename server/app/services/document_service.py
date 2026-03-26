import uuid
from datetime import datetime

from fastapi import UploadFile, HTTPException

from app.models.document import Document, DocumentStatus
from app.repositories.document_repository import document_repository
from app.clients.s3_client import s3_client

ALLOWED_TYPES = {"pdf", "txt", "md"}
CONTENT_TYPES = {
    "pdf": "application/pdf",
    "txt": "text/plain",
    "md": "text/markdown",
}


def _file_type(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: .{ext}")
    return ext


class DocumentService:
    def upload(self, file: UploadFile) -> Document:
        file_type = _file_type(file.filename or "")
        document_id = str(uuid.uuid4())
        s3_key = f"documents/{document_id}/{file.filename}"
        data = file.file.read()

        try:
            s3_client.upload(s3_key, data, CONTENT_TYPES[file_type])
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {e}")

        now = datetime.utcnow()
        doc = Document(
            document_id=document_id,
            file_name=file.filename or "",
            s3_key=s3_key,
            file_type=file_type,
            status=DocumentStatus.uploaded,
            created_at=now,
            updated_at=now,
        )
        document_repository.save(doc)
        return doc

    def list_documents(self) -> list[Document]:
        return document_repository.find_all()

    def get_document(self, document_id: str) -> Document:
        doc = document_repository.find_by_id(document_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc

    def update_status(
        self, document_id: str, status: DocumentStatus, error_message: str | None = None
    ) -> Document:
        doc = self.get_document(document_id)
        doc.status = status
        doc.updated_at = datetime.utcnow()
        doc.error_message = error_message
        document_repository.save(doc)
        return doc

    def delete_document(self, document_id: str) -> None:
        doc = self.get_document(document_id)
        try:
            s3_client.delete(doc.s3_key)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 delete failed: {e}")
        document_repository.delete(document_id)


document_service = DocumentService()
