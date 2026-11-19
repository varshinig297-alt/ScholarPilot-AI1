import pymupdf
import pytest

from src.core import (
    DocumentProcessingError,
    UnsupportedDocumentError,
    EmptyDocumentError,
)
from src.ingestion import DocumentLoader, TextProcessor
from src.services.document_service import DocumentService


def create_pdf(file_path, page_texts):
    """Create a PDF with the supplied page contents."""

    with pymupdf.open() as pdf:
        for text in page_texts:
            page = pdf.new_page()

            if text:
                page.insert_text((72, 72), text)

        pdf.save(str(file_path))


def test_process_valid_txt_document(tmp_path):
    text = (
        "ScholarPilot AI processes academic research documents. "
        "It helps students understand difficult academic concepts."
    )

    file_path = tmp_path / "research.txt"
    file_path.write_text(text, encoding="utf-8")

    result = DocumentService.process_document(str(file_path))

    assert result.metadata.filename == "research.txt"
    assert result.metadata.file_extension == ".txt"
    assert result.metadata.processing_status == "processed"
    assert result.metadata.page_count is None

    assert result.extracted_text == text
    assert result.character_count == len(text)
    assert result.word_count == len(text.split())
    assert result.chunk_count == len(result.chunks)


def test_process_valid_pdf_document(tmp_path):
    file_path = tmp_path / "research.pdf"

    create_pdf(
        file_path,
        [
            "Artificial intelligence is transforming academic education.",
            "Machine learning helps students understand complex concepts.",
        ],
    )

    result = DocumentService.process_document(str(file_path))

    assert result.metadata.filename == "research.pdf"
    assert result.metadata.processing_status == "processed"
    assert result.page_count == 2
    assert result.metadata.page_count == 2

    assert "Artificial intelligence" in result.extracted_text
    assert "Machine learning" in result.extracted_text


def test_process_multiple_chunks(tmp_path):
    text = "academic research learning " * 120

    file_path = tmp_path / "large_document.txt"
    file_path.write_text(text, encoding="utf-8")

    result = DocumentService.process_document(str(file_path))

    assert result.chunk_count > 1
    assert result.chunk_count == len(result.chunks)

    assert [chunk.chunk_id for chunk in result.chunks] == list(
        range(result.chunk_count)
    )

    for chunk in result.chunks:
        assert chunk.text
        assert chunk.character_count == len(chunk.text)


def test_missing_document_raises_processing_error(tmp_path):
    file_path = tmp_path / "missing.pdf"

    with pytest.raises(DocumentProcessingError) as error:
        DocumentService.process_document(str(file_path))

    assert isinstance(error.value.__cause__, FileNotFoundError)


def test_directory_instead_of_file_raises_processing_error(tmp_path):
    with pytest.raises(DocumentProcessingError):
        DocumentService.process_document(str(tmp_path))


def test_unsupported_file_format(tmp_path):
    file_path = tmp_path / "research.docx"
    file_path.write_text("Some academic document content.", encoding="utf-8")

    with pytest.raises(UnsupportedDocumentError):
        DocumentService.process_document(str(file_path))


def test_short_document_raises_empty_document_error(tmp_path):
    file_path = tmp_path / "short.txt"
    file_path.write_text("Too short.", encoding="utf-8")

    with pytest.raises(EmptyDocumentError):
        DocumentService.process_document(str(file_path))


def test_pdf_without_extractable_text_raises_error(tmp_path):
    file_path = tmp_path / "blank.pdf"

    create_pdf(file_path, [""])

    with pytest.raises(EmptyDocumentError):
        DocumentService.process_document(str(file_path))


def test_no_generated_chunks_raises_processing_error(tmp_path, monkeypatch):
    file_path = tmp_path / "research.txt"
    file_path.write_text(
        "This is a sufficiently long academic research document.",
        encoding="utf-8",
    )

    monkeypatch.setattr(
        TextProcessor,
        "split_into_chunks",
        staticmethod(lambda text: []),
    )

    with pytest.raises(
        DocumentProcessingError,
        match="No usable text chunks",
    ):
        DocumentService.process_document(str(file_path))


def test_unexpected_error_is_wrapped(tmp_path, monkeypatch):
    file_path = tmp_path / "research.txt"
    file_path.write_text(
        "This is a sufficiently long academic research document.",
        encoding="utf-8",
    )

    def simulate_failure(path):
        raise RuntimeError("Simulated unexpected failure")

    monkeypatch.setattr(
        DocumentLoader,
        "load",
        staticmethod(simulate_failure),
    )

    with pytest.raises(
        DocumentProcessingError,
        match="Failed to process document",
    ) as error:
        DocumentService.process_document(str(file_path))

    assert isinstance(error.value.__cause__, RuntimeError)
