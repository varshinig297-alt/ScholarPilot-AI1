import pytest

from src.core import DocumentProcessingError
from src.ingestion import DocumentLoader, TextProcessor


def test_loader_wraps_unexpected_extraction_error(tmp_path, monkeypatch):
    file_path = tmp_path / "broken.txt"
    file_path.write_text(
        "This is a sufficiently long academic document.",
        encoding="utf-8",
    )

    def simulate_extraction_failure(path):
        raise RuntimeError("Simulated extraction failure")

    monkeypatch.setattr(
        DocumentLoader,
        "_extract_txt",
        staticmethod(simulate_extraction_failure),
    )

    with pytest.raises(
        DocumentProcessingError,
        match="Could not process document",
    ) as error:
        DocumentLoader.load(file_path)

    assert isinstance(error.value.__cause__, RuntimeError)


def test_password_protected_pdf_is_rejected(tmp_path, monkeypatch):
    class FakeEncryptedPDF:
        is_encrypted = True

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

    monkeypatch.setattr(
        "src.ingestion.document_loader.pymupdf.open",
        lambda path: FakeEncryptedPDF(),
    )

    with pytest.raises(
        DocumentProcessingError,
        match="Password-protected PDFs are not supported",
    ):
        DocumentLoader._extract_pdf(tmp_path / "encrypted.pdf")


def test_split_into_chunks_rejects_non_string_input():
    with pytest.raises(TypeError, match="Input must be a string"):
        TextProcessor.split_into_chunks(None)
