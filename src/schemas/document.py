from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class DocumentMetadata(BaseModel):
    """
    Stores information about an uploaded academic document.
    """

    document_id: str = Field(
        default_factory=lambda: str(uuid4())
    )

    filename: str

    file_extension: str

    file_size_bytes: int = Field(ge=0)

    uploaded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    page_count: Optional[int] = Field(default=None, ge=1)

    extracted_character_count: int = Field(
        default=0,
        ge=0
    )

    processing_status: str = "uploaded"

    @classmethod
    def from_file(cls, file_path: str) -> "DocumentMetadata":

        path = Path(file_path)

        if not path.exists() or not path.is_file():
            raise FileNotFoundError(
                f"Document not found: {file_path}"
            )

        return cls(
            filename=path.name,
            file_extension=path.suffix.lower(),
            file_size_bytes=path.stat().st_size
        )
