import pytest
from datetime import timezone

from pydantic import ValidationError

from src.schemas.document import DocumentMetadata
from src.schemas.processed_document import DocumentChunk, ProcessedDocument


def create_metadata(**overrides):
    data = {
        "filename": "research.pdf",
        "file_extension": ".pdf",
        "file_size_bytes": 1024,
    }
    data.update(overrides)
    return DocumentMetadata(**data)


def create_processed_document(**overrides):
    extracted_text = "Artificial intelligence supports learning."

    data = {
        "metadata": create_metadata(),
        "extracted_text": extracted_text,
        "chunks": [
            {
                "chunk_id": 0,
                "text": extracted_text,
                "character_count": len(extracted_text),
            }
        ],
        "character_count": len(extracted_text),
        "word_count": len(extracted_text.split()),
        "chunk_count": 1,
    }
    data.update(overrides)
    return ProcessedDocument(**data)


# DocumentMetadata tests

def test_document_metadata_creation_with_defaults():
    metadata = create_metadata()

    assert metadata.filename == "research.pdf"
    assert metadata.file_extension == ".pdf"
    assert metadata.file_size_bytes == 1024
    assert metadata.document_id
    assert metadata.page_count is None
    assert metadata.extracted_character_count == 0
    assert metadata.processing_status == "uploaded"


def test_document_metadata_generates_unique_ids():
    metadata1 = create_metadata()
    metadata2 = create_metadata()

    assert metadata1.document_id != metadata2.document_id


def test_document_metadata_upload_timestamp_is_utc():
    metadata = create_metadata()

    assert metadata.uploaded_at.tzinfo == timezone.utc


def test_document_metadata_rejects_negative_file_size():
    with pytest.raises(ValidationError):
        create_metadata(file_size_bytes=-1)


def test_document_metadata_rejects_invalid_page_count():
    with pytest.raises(ValidationError):
        create_metadata(page_count=0)


def test_document_metadata_rejects_negative_character_count():
    with pytest.raises(ValidationError):
        create_metadata(extracted_character_count=-1)


def test_document_metadata_from_file(tmp_path):
    file_path = tmp_path / "Research.PDF"
    file_path.write_text("Sample academic document.", encoding="utf-8")

    metadata = DocumentMetadata.from_file(str(file_path))

    assert metadata.filename == "Research.PDF"
    assert metadata.file_extension == ".pdf"
    assert metadata.file_size_bytes == file_path.stat().st_size


@pytest.mark.parametrize("path_type", ["missing", "directory"])
def test_document_metadata_from_file_rejects_invalid_path(tmp_path, path_type):
    if path_type == "missing":
        file_path = tmp_path / "missing.pdf"
    else:
        file_path = tmp_path

    with pytest.raises(FileNotFoundError):
        DocumentMetadata.from_file(str(file_path))


# DocumentChunk tests

def test_document_chunk_creation():
    chunk = DocumentChunk(
        chunk_id=0,
        text="Introduction to artificial intelligence",
        character_count=42
    )

    assert chunk.chunk_id == 0
    assert chunk.text == "Introduction to artificial intelligence"
    assert chunk.character_count == 42


@pytest.mark.parametrize(
    "data",
    [
        {"chunk_id": -1, "text": "Valid text", "character_count": 10},
        {"chunk_id": 0, "text": "", "character_count": 1},
        {"chunk_id": 0, "text": "Valid text", "character_count": 0},
    ],
)
def test_document_chunk_rejects_invalid_values(data):
    with pytest.raises(ValidationError):
        DocumentChunk(**data)


# ProcessedDocument tests

def test_processed_document_creation():
    document = create_processed_document()

    assert document.metadata.filename == "research.pdf"
    assert document.extracted_text
    assert len(document.chunks) == 1
    assert document.character_count > 0
    assert document.word_count > 0
    assert document.chunk_count == 1


def test_processed_document_rejects_empty_extracted_text():
    with pytest.raises(ValidationError):
        create_processed_document(extracted_text="")


@pytest.mark.parametrize(
    "field,value",
    [
        ("character_count", 0),
        ("word_count", 0),
        ("chunk_count", 0),
        ("page_count", 0),
    ],
)
def test_processed_document_rejects_invalid_counts(field, value):
    with pytest.raises(ValidationError):
        create_processed_document(**{field: value})


def test_processed_document_rejects_invalid_nested_chunk():
    with pytest.raises(ValidationError):
        create_processed_document(
            chunks=[
                {
                    "chunk_id": 0,
                    "text": "",
                    "character_count": 1,
                }
            ]
        )
