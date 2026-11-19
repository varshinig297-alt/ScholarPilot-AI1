
from threading import RLock
from typing import Dict, List

from src.schemas.processed_document import ProcessedDocument
from src.retrieval.retriever import DocumentRetriever


class DocumentStore:
    """
    In-memory store for processed academic documents.

    Documents remain available while the backend process is running.
    """

    def __init__(self):
        self._documents: Dict[str, ProcessedDocument] = {}
        self._retriever = DocumentRetriever()
        self._lock = RLock()

    def add_document(self, document: ProcessedDocument) -> int:
        """Add or replace a document and rebuild the shared index."""

        document_id = document.metadata.document_id

        with self._lock:
            previous_document = self._documents.get(document_id)

            self._documents[document_id] = document

            try:
                chunk_count = self._retriever.index_documents(
                    list(self._documents.values())
                )
            except Exception:
                if previous_document is None:
                    self._documents.pop(document_id, None)
                else:
                    self._documents[document_id] = previous_document

                self._retriever.index_documents(
                    list(self._documents.values())
                )
                raise

            return chunk_count

    def get_document(self, document_id: str):
        """Return a stored document by its ID."""

        with self._lock:
            return self._documents.get(document_id)

    def get_all_documents(self) -> List[ProcessedDocument]:
        """Return all currently stored documents."""

        with self._lock:
            return list(self._documents.values())

    def get_retriever(self) -> DocumentRetriever:
        """Return the shared document retriever."""

        return self._retriever

    def document_count(self) -> int:
        """Return the number of stored documents."""

        with self._lock:
            return len(self._documents)


document_store = DocumentStore()
