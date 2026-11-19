from typing import List, Optional

from pydantic import BaseModel, Field

from src.schemas.document import DocumentMetadata


class DocumentChunk(BaseModel):
    """Represents one processed section of document text."""

    chunk_id: int = Field(ge=0)
    text: str = Field(min_length=1)
    character_count: int = Field(ge=1)
    page_number: Optional[int] = Field(default=None, ge=1)


class ProcessedDocument(BaseModel):
    """Stores the complete result of document processing."""

    metadata: DocumentMetadata
    extracted_text: str = Field(min_length=1)
    chunks: List[DocumentChunk]
    character_count: int = Field(ge=1)
    word_count: int = Field(ge=1)
    chunk_count: int = Field(ge=1)
    page_count: Optional[int] = Field(default=None, ge=1)
