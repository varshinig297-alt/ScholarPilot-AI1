
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.core.exceptions import AgentExecutionError, ConfigurationError
from backend.app.services.tutor_service import tutor_service


router = APIRouter(
    prefix="/api/v1/tutor",
    tags=["AI Tutor"],
)


class TutorQuestionRequest(BaseModel):
    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The student's academic question.",
    )
    top_k: int = Field(
        default=4,
        ge=1,
        le=10,
        description="Number of relevant document chunks to retrieve.",
    )


@router.post("/ask")
def ask_tutor(request: TutorQuestionRequest):
    """Answer a student question using uploaded study documents."""

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid question.",
        )

    try:
        result = tutor_service.ask(
            question=question,
            top_k=request.top_k,
        )

        return {
            "success": True,
            "message": "Academic answer generated successfully.",
            **result,
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except ConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except AgentExecutionError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="The AI Tutor could not process your question.",
        ) from exc
