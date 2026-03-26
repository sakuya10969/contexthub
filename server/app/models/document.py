from datetime import datetime
from enum import Enum
from dataclasses import dataclass, field


class DocumentStatus(str, Enum):
    uploaded = "uploaded"
    processing = "processing"
    indexed = "indexed"
    failed = "failed"


@dataclass
class Document:
    document_id: str
    file_name: str
    s3_key: str
    file_type: str
    status: DocumentStatus
    created_at: datetime
    updated_at: datetime
    error_message: str | None = None


@dataclass
class Chunk:
    document_id: str
    chunk_id: str
    file_name: str
    content: str
    embedding: list[float]
    page_number: int | None
    chunk_index: int
    created_at: datetime = field(default_factory=datetime.utcnow)
