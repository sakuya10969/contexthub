from datetime import datetime
from pydantic import BaseModel
from app.models.document import DocumentStatus


class DocumentResponse(BaseModel):
    document_id: str
    file_name: str
    s3_key: str
    file_type: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]


class DeleteDocumentResponse(BaseModel):
    message: str
    document_id: str


class ReindexResponse(BaseModel):
    document_id: str
    file_name: str
    status: DocumentStatus
    message: str
