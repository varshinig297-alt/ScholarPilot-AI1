
from threading import Lock
from typing import Any, Dict

from backend.app.services.document_store import document_store
from src.services.academic_tutor import AcademicTutor


class TutorService:
    """Connects the shared document retriever to AcademicTutor."""

    def __init__(self):
        self._tutor = None
        self._initialization_lock = Lock()
        self._question_lock = Lock()

    def _get_tutor(self) -> AcademicTutor:
        """Initialize AcademicTutor only when it is first needed."""

        if self._tutor is None:
            with self._initialization_lock:
                if self._tutor is None:
                    self._tutor = AcademicTutor(
                        document_store.get_retriever()
                    )

        return self._tutor

    def ask(
        self,
        question: str,
        top_k: int = 4,
    ) -> Dict[str, Any]:
        """Answer a question using uploaded academic documents."""

        if document_store.document_count() == 0:
            raise ValueError(
                "Please upload at least one study document before "
                "asking the AI Tutor a question."
            )

        tutor = self._get_tutor()

        # Prevent simultaneous questions from interfering with
        # shared retriever operations.
        with self._question_lock:
            return tutor.ask(
                question=question,
                top_k=top_k,
            )


tutor_service = TutorService()
