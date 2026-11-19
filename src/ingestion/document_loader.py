from pathlib import Path
from typing import Union

import pymupdf

from src.core import (
    get_logger,
    DocumentProcessingError,
    UnsupportedDocumentError,
    EmptyDocumentError,
)


logger = get_logger(__name__)


class DocumentLoader:
    """
    Loads PDF and TXT documents and extracts their text.
    """

    SUPPORTED_EXTENSIONS = {".pdf", ".txt"}

    MIN_TEXT_LENGTH = 20

    @classmethod
    def load(cls, file_path: Union[str, Path]) -> str:
        """
        Load a document and return its extracted text.

        Args:
            file_path: Path to the PDF or TXT document.

        Returns:
            Extracted document text.

        Raises:
            UnsupportedDocumentError: If the format is unsupported.
            EmptyDocumentError: If no meaningful text is extracted.
            DocumentProcessingError: If document processing fails.
        """

        path = Path(file_path)

        if not path.exists():
            raise DocumentProcessingError(
                f"Document not found: {path}"
            )

        if not path.is_file():
            raise DocumentProcessingError(
                f"Path is not a file: {path}"
            )

        extension = path.suffix.lower()

        if extension not in cls.SUPPORTED_EXTENSIONS:
            raise UnsupportedDocumentError(
                f"Unsupported document format: {extension}"
            )

        logger.info("Starting document extraction: %s", path.name)

        try:
            if extension == ".pdf":
                text = cls._extract_pdf(path)
            else:
                text = cls._extract_txt(path)

            text = cls._clean_text(text)

            if len(text) < cls.MIN_TEXT_LENGTH:
                raise EmptyDocumentError(
                    "Document contains insufficient extractable text."
                )

            logger.info(
                "Document extraction successful: %s characters",
                len(text)
            )

            return text

        except DocumentProcessingError:
            raise

        except Exception as exc:
            logger.exception(
                "Failed to process document: %s",
                path.name
            )

            raise DocumentProcessingError(
                f"Could not process document: {path.name}"
            ) from exc

    @classmethod
    def load_pdf_pages(cls, file_path: Union[str, Path]):
        """
        Extract PDF text while preserving individual page numbers.

        Returns:
            A list of (page_number, page_text) tuples.
        """

        path = Path(file_path)

        if not path.exists():
            raise DocumentProcessingError(
                f"Document not found: {path}"
            )

        if not path.is_file():
            raise DocumentProcessingError(
                f"Path is not a file: {path}"
            )

        if path.suffix.lower() != ".pdf":
            raise UnsupportedDocumentError(
                "Page-aware extraction supports PDF files only."
            )

        logger.info("Starting page-aware PDF extraction: %s", path.name)

        try:
            extracted_pages = []

            with pymupdf.open(path) as document:

                if document.is_encrypted:
                    raise DocumentProcessingError(
                        "Password-protected PDFs are not supported."
                    )

                for page_number, page in enumerate(document, start=1):
                    page_text = cls._clean_text(
                        page.get_text("text")
                    )

                    if page_text:
                        extracted_pages.append(
                            (page_number, page_text)
                        )

            total_text = " ".join(
                text for _, text in extracted_pages
            )

            if len(total_text) < cls.MIN_TEXT_LENGTH:
                raise EmptyDocumentError(
                    "Document contains insufficient extractable text."
                )

            logger.info(
                "Page-aware extraction successful: %s pages with text",
                len(extracted_pages)
            )

            return extracted_pages

        except DocumentProcessingError:
            raise

        except Exception as exc:
            logger.exception(
                "Page-aware PDF extraction failed: %s",
                path.name
            )

            raise DocumentProcessingError(
                f"Could not process PDF: {path.name}"
            ) from exc

    @staticmethod
    def _extract_pdf(path: Path) -> str:
        """
        Extract text from every page of a PDF.
        """

        extracted_pages = []

        with pymupdf.open(path) as document:

            if document.is_encrypted:
                raise DocumentProcessingError(
                    "Password-protected PDFs are not supported."
                )

            for page_number, page in enumerate(document, start=1):

                page_text = page.get_text("text")

                if page_text.strip():
                    extracted_pages.append(
                        f"\n--- Page {page_number} ---\n{page_text}"
                    )

        return "\n".join(extracted_pages)

    @staticmethod
    def _extract_txt(path: Path) -> str:
        """
        Read text from a UTF-8 text file.
        """

        try:
            return path.read_text(encoding="utf-8-sig")

        except UnicodeDecodeError as exc:
            raise DocumentProcessingError(
                "The text file is not encoded in UTF-8."
            ) from exc

    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Normalize whitespace without removing meaningful content.
        """

        lines = [
            line.strip()
            for line in text.splitlines()
        ]

        cleaned_lines = [
            line
            for line in lines
            if line
        ]

        return "\n".join(cleaned_lines)
