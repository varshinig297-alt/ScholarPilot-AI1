
import sqlite3
from threading import Lock
from uuid import uuid4
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from src.core.exceptions import AgentExecutionError, ConfigurationError
from src.services.quiz_service import QuizService

from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.services.document_store import document_store
from backend.app.services.quiz_history_store import quiz_history_store


router = APIRouter(
    prefix="/api/v1/quiz",
    tags=["AI Quiz Generator"],
)

_quiz_service = None
_service_lock = Lock()

_active_quizzes: Dict[str, dict] = {}
_quiz_lock = Lock()


def get_quiz_service() -> QuizService:
    """Initialize the quiz service only when needed."""

    global _quiz_service

    if _quiz_service is None:
        with _service_lock:
            if _quiz_service is None:
                _quiz_service = QuizService(
                    document_store.get_retriever()
                )

    return _quiz_service


class QuizGenerateRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=300)
    num_questions: int = Field(default=5, ge=1, le=20)


class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: Dict[int, str]


@router.post("/generate")
def generate_quiz(
    request: QuizGenerateRequest,
    current_user: User = Depends(get_current_user),
):
    """Generate a source-grounded quiz for an authenticated student."""

    if document_store.document_count() == 0:
        raise HTTPException(
            status_code=400,
            detail="Please upload a study document before generating a quiz.",
        )

    topic = request.topic.strip()

    if not topic:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid quiz topic.",
        )

    try:
        result = get_quiz_service().generate_quiz(
            topic=topic,
            num_questions=request.num_questions,
        )

        quiz_id = str(uuid4())

        with _quiz_lock:
            _active_quizzes[quiz_id] = {
                "user_id": str(current_user.id),
                "topic": result["topic"],
                "questions": result["questions"],
            }

        # Never expose correct answers before submission.
        public_questions = [
            {
                "question": question["question"],
                "options": question["options"],
                "source_ids": question["source_ids"],
            }
            for question in result["questions"]
        ]

        return {
            "success": True,
            "quiz_id": quiz_id,
            "topic": result["topic"],
            "total_questions": result["total_questions"],
            "questions": public_questions,
            "sources": result["sources"],
        }

    except ConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except AgentExecutionError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="The quiz could not be generated.",
        ) from exc


@router.post("/submit")
def submit_quiz(
    request: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
):
    """Evaluate and save a quiz attempt for its authenticated owner."""

    with _quiz_lock:
        quiz_data = _active_quizzes.get(request.quiz_id)

        if quiz_data is None:
            raise HTTPException(
                status_code=404,
                detail="Quiz not found or already submitted.",
            )

        # Prevent one student from submitting another student's quiz.
        if quiz_data["user_id"] != str(current_user.id):
            raise HTTPException(
                status_code=404,
                detail="Quiz not found or already submitted.",
            )

        questions = quiz_data["questions"]
        topic = quiz_data["topic"]

        try:
            expected_indexes = set(range(len(questions)))
            submitted_indexes = set(request.answers.keys())

            if submitted_indexes != expected_indexes:
                raise HTTPException(
                    status_code=400,
                    detail="Please answer every question before submitting.",
                )

            for index, answer in request.answers.items():
                valid_options = questions[index]["options"]

                if answer not in valid_options:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid answer for question {index + 1}.",
                    )

            result = QuizService.evaluate_answers(
                questions=questions,
                answers=request.answers,
            )

            quiz_history_store.save_attempt(
                quiz_id=request.quiz_id,
                user_id=str(current_user.id),
                topic=topic,
                result=result,
            )

            _active_quizzes.pop(request.quiz_id, None)

            return {
                "success": True,
                "message": "Quiz evaluated and saved successfully.",
                **result,
            }

        except HTTPException:
            raise

        except AgentExecutionError as exc:
            raise HTTPException(
                status_code=400,
                detail=str(exc),
            ) from exc

        except sqlite3.Error as exc:
            raise HTTPException(
                status_code=500,
                detail="Quiz history could not be saved. Please try again.",
            ) from exc


@router.get("/history")
def get_quiz_history(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
):
    """Retrieve only the authenticated student's quiz history."""

    try:
        attempts = quiz_history_store.get_attempts(
            user_id=str(current_user.id),
            limit=limit,
        )

        return {
            "success": True,
            "total": len(attempts),
            "attempts": attempts,
        }

    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve quiz history.",
        ) from exc


@router.get("/analytics")
def get_quiz_analytics(
    current_user: User = Depends(get_current_user),
):
    """Retrieve only the authenticated student's quiz analytics."""

    try:
        summary = quiz_history_store.get_summary(
            user_id=str(current_user.id),
        )

        return {
            "success": True,
            "analytics": summary,
        }

    except sqlite3.Error as exc:
        raise HTTPException(
            status_code=500,
            detail="Could not retrieve quiz analytics.",
        ) from exc
