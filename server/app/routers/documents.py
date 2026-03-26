from fastapi import APIRouter, UploadFile, File, BackgroundTasks

from app.services.document_service import document_service
from app.services.pipeline_service import pipeline_service
from app.clients.opensearch_client import opensearch_client
from app.schemas.document import (
    DocumentResponse,
    DocumentListResponse,
    DeleteDocumentResponse,
    ReindexResponse,
)
from app.models.document import DocumentStatus

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    doc = document_service.upload(file)
    background_tasks.add_task(pipeline_service.run, doc.document_id)
    return DocumentResponse(
        document_id=doc.document_id,
        file_name=doc.file_name,
        s3_key=doc.s3_key,
        file_type=doc.file_type,
        status=doc.status,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )


@router.get("", response_model=DocumentListResponse)
async def list_documents():
    docs = document_service.list_documents()
    return DocumentListResponse(
        documents=[
            DocumentResponse(
                document_id=d.document_id,
                file_name=d.file_name,
                s3_key=d.s3_key,
                file_type=d.file_type,
                status=d.status,
                created_at=d.created_at,
                updated_at=d.updated_at,
            )
            for d in docs
        ]
    )


@router.delete("/{document_id}", response_model=DeleteDocumentResponse)
async def delete_document(document_id: str):
    document_service.get_document(document_id)
    opensearch_client.delete_by_document_id(document_id)
    document_service.delete_document(document_id)
    return DeleteDocumentResponse(
        message="Document deleted successfully",
        document_id=document_id,
    )


@router.post("/{document_id}/reindex", response_model=ReindexResponse)
async def reindex_document(document_id: str, background_tasks: BackgroundTasks):
    doc = document_service.get_document(document_id)
    if doc.status == DocumentStatus.processing:
        from fastapi import HTTPException
        raise HTTPException(status_code=409, detail="Document is currently processing")
    background_tasks.add_task(pipeline_service.reindex, document_id)
    doc = document_service.update_status(document_id, DocumentStatus.processing)
    return ReindexResponse(
        document_id=doc.document_id,
        file_name=doc.file_name,
        status=doc.status,
        message="Reindex started",
    )
