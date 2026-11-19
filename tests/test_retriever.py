from types import SimpleNamespace

from src.retrieval.retriever import DocumentRetriever


def make_document():
    passages = [
        (5, 4, "Structured data resides in fixed fields within records. It follows a particular data model and is arranged in rows and columns. Examples include relational databases and spreadsheets."),
        (8, 6, "Unstructured data cannot readily be classified into a neat structure. It does not conform to a data model. Examples include photographs, graphic images, videos, webpages, PDF files and PowerPoint presentations."),
        (12, 8, "Semi-structured data is self-describing and contains metadata. It does not have a rigid structure and is not fully governed by a fixed data model."),
        (13, 9, "XML and markup languages manage semi-structured data. Tags separate semantic elements and establish hierarchy. Examples include emails and web pages."),
        (35, 21, "Traditional business intelligence uses structured data while big data environments handle distributed data and real-time analysis."),
    ]

    chunks = [
        SimpleNamespace(
            chunk_id=chunk_id,
            page_number=page_number,
            text=text,
            character_count=len(text),
        )
        for chunk_id, page_number, text in passages
    ]

    metadata = SimpleNamespace(
        document_id="test-document",
        filename="BIS701-module-1-pdf.pdf",
    )

    return SimpleNamespace(metadata=metadata, chunks=chunks)


def test_individual_unstructured_query_finds_page_6():
    retriever = DocumentRetriever()
    retriever.index_documents([make_document()])

    results = retriever.retrieve("Explain unstructured data.", top_k=4)

    assert results
    assert results[0].page_number == 6


def test_combined_query_can_retrieve_all_three_data_types():
    retriever = DocumentRetriever()
    retriever.index_documents([make_document()])

    results = retriever.retrieve(
        "Explain structured, unstructured, and semi-structured data.",
        top_k=5,
    )

    retrieved_pages = {result.page_number for result in results}

    assert 4 in retrieved_pages
    assert 6 in retrieved_pages
    assert 8 in retrieved_pages
    assert 9 in retrieved_pages
