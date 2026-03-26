from app.models.document import Document


class DocumentRepository:
    def __init__(self) -> None:
        self._store: dict[str, Document] = {}

    def save(self, document: Document) -> Document:
        self._store[document.document_id] = document
        return document

    def find_by_id(self, document_id: str) -> Document | None:
        return self._store.get(document_id)

    def find_all(self) -> list[Document]:
        return list(self._store.values())

    def delete(self, document_id: str) -> None:
        self._store.pop(document_id, None)


document_repository = DocumentRepository()
