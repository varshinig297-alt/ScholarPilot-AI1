from pathlib import Path

import pymupdf

from src.core import get_logger, DocumentProcessingError
from src.ingestion import DocumentLoader, TextProcessor
from src.schemas import (
    DocumentMetadata,
    DocumentChunk,
    ProcessedDocument,
)


logger = get_logger(__name__)


class DocumentService:
    """Coordinates the complete academic document-processing workflow."""

    @staticmethod
    def process_document(file_path: str) -> ProcessedDocument:
        path = Path(file_path)

        logger.info("Starting document processing: %s", path.name)

        try:
            metadata = DocumentMetadata.from_file(str(path))

            page_count = None
            chunks = []

            if path.suffix.lower() == ".pdf":
                # Extract individual PDF pages with their original page numbers.
                extracted_pages = DocumentLoader.load_pdf_pages(path)

                with pymupdf.open(path) as pdf:
                    page_count = len(pdf)

                # Preserve page markers in the complete extracted document text.
                cleaned_text = "\n".join(
                    f"--- Page {page_number} ---\n{page_text}"
                    for page_number, page_text in extracted_pages
                )

                # Generate chunks separately for each page.
                for page_number, page_text in extracted_pages:
                    page_chunks = TextProcessor.split_into_chunks(page_text)

                    for chunk_text in page_chunks:
                        chunks.append(
                            DocumentChunk(
                                chunk_id=len(chunks),
                                text=chunk_text,
                                character_count=len(chunk_text),
                                page_number=page_number
                            )
                        )

            else:
                # Preserve the original TXT processing pipeline.
                extracted_text = DocumentLoader.load(path)
                cleaned_text = TextProcessor.clean_text(extracted_text)

                raw_chunks = TextProcessor.split_into_chunks(cleaned_text)

                for chunk_text in raw_chunks:
                    chunks.append(
                        DocumentChunk(
                            chunk_id=len(chunks),
                            text=chunk_text,
                            character_count=len(chunk_text)
                        )
                    )

            if not chunks:
                raise DocumentProcessingError(
                    "No usable text chunks were generated."
                )

            metadata.extracted_character_count = len(cleaned_text)
            metadata.page_count = page_count
            metadata.processing_status = "processed"

            word_count = len(cleaned_text.split())
            chunk_count = len(chunks)

            processed_document = ProcessedDocument(
                metadata=metadata,
                extracted_text=cleaned_text,
                chunks=chunks,
                character_count=len(cleaned_text),
                word_count=word_count,
                chunk_count=chunk_count,
                page_count=page_count
            )

            logger.info(
                "Document processed successfully: %s | %s chunks",
                path.name,
                chunk_count
            )

            return processed_document

        except DocumentProcessingError:
            logger.exception(
                "Document processing failed: %s",
                path.name
            )
            raise

        except Exception as exc:
            logger.exception(
                "Unexpected document processing error: %s",
                path.name
            )

            raise DocumentProcessingError(
                f"Failed to process document: {path.name}"
            ) from exc
