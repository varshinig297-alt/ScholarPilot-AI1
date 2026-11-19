import pytest
import pymupdf

from src.ingestion.document_loader import DocumentLoader
from src.core import (
    DocumentProcessingError,
    UnsupportedDocumentError,
    EmptyDocumentError,
)


def test_load_valid_txt_file(tmp_path):
    file_path = tmp_path / "sample.txt"

    content = (
        "Artificial Intelligence is transforming education. "
        "Machine Learning helps computers learn from data."
    )

    file_path.write_text(content, encoding="utf-8")

    result = DocumentLoader.load(file_path)

    assert "Artificial Intelligence" in result
    assert "Machine Learning" in result


def test_load_valid_pdf_file(tmp_path):
    file_path = tmp_path / "sample.pdf"

    with pymupdf.open() as document:
        page = document.new_page()
        page.insert_text(
            (50, 50),
            "Artificial Intelligence is transforming modern education."
        )
        document.save(file_path)

    result = DocumentLoader.load(file_path)

    assert "Artificial Intelligence" in result
    assert "Page 1" in result


def test_load_unsupported_file_format(tmp_path):
    file_path = tmp_path / "sample.docx"
    file_path.write_text("Sample document", encoding="utf-8")

    with pytest.raises(UnsupportedDocumentError):
        DocumentLoader.load(file_path)


def test_load_missing_file():
    with pytest.raises(DocumentProcessingError):
        DocumentLoader.load("missing_document.txt")


def test_load_directory_instead_of_file(tmp_path):
    with pytest.raises(DocumentProcessingError):
        DocumentLoader.load(tmp_path)


def test_load_empty_txt_file(tmp_path):
    file_path = tmp_path / "empty.txt"
    file_path.write_text("", encoding="utf-8")

    with pytest.raises(EmptyDocumentError):
        DocumentLoader.load(file_path)


def test_load_txt_with_insufficient_text(tmp_path):
    file_path = tmp_path / "short.txt"
    file_path.write_text("Too short", encoding="utf-8")

    with pytest.raises(EmptyDocumentError):
        DocumentLoader.load(file_path)


def test_load_txt_with_utf8_bom(tmp_path):
    file_path = tmp_path / "bom.txt"

    content = (
        "\ufeffArtificial Intelligence supports "
        "modern academic learning."
    )

    file_path.write_text(content, encoding="utf-8")

    result = DocumentLoader.load(file_path)

    assert not result.startswith("\ufeff")
    assert "Artificial Intelligence" in result


def test_load_txt_with_invalid_encoding(tmp_path):
    file_path = tmp_path / "invalid.txt"
    file_path.write_bytes(b"\xff\xfe\xfa\xfb")

    with pytest.raises(DocumentProcessingError):
        DocumentLoader.load(file_path)


def test_clean_text_removes_empty_lines():
    text = "Artificial Intelligence\n\n\nMachine Learning"

    result = DocumentLoader._clean_text(text)

    assert result == "Artificial Intelligence\nMachine Learning"


def test_clean_text_removes_extra_spaces():
    text = "  Artificial Intelligence  \n  Machine Learning  "

    result = DocumentLoader._clean_text(text)

    assert result == "Artificial Intelligence\nMachine Learning"


def test_pdf_with_no_extractable_text(tmp_path):
    file_path = tmp_path / "image_only.pdf"

    with pymupdf.open() as document:
        document.new_page()
        document.save(file_path)

    with pytest.raises(EmptyDocumentError):
        DocumentLoader.load(file_path)


