from pathlib import Path

from src.services.document_service import DocumentService
from src.retrieval.retriever import DocumentRetriever

pdf_path = Path("data/BIS701-module-1-pdf.pdf")

document = DocumentService().process_document(str(pdf_path))

retriever = DocumentRetriever()
indexed_count = retriever.index_documents([document])

print(f"\nIndexed chunks: {indexed_count}")

questions = [
    "Explain structured data.",
    "Explain unstructured data.",
    "Explain semi-structured data.",
    "Explain structured, unstructured, and semi-structured data."
]

for question in questions:
    print("\n" + "=" * 80)
    print(f"QUESTION: {question}")
    print("=" * 80)

    results = retriever.retrieve(question, top_k=30)

    for result in results:
        print(
            f"Page: {result.page_number} | "
            f"Chunk: {result.chunk_id} | "
            f"Score: {result.relevance_score:.4f}"
        )
        print(result.text[:500].replace("\n", " "))
        print("-" * 60)
