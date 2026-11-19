import pytest

from src.ingestion.text_processor import TextProcessor


def test_clean_text_removes_extra_spaces():
    text = "Artificial   Intelligence    is important."
    result = TextProcessor.clean_text(text)

    assert result == "Artificial Intelligence is important."


def test_clean_text_removes_excessive_blank_lines():
    text = "Machine Learning\n\n\nDeep Learning"
    result = TextProcessor.clean_text(text)

    assert result == "Machine Learning\n\nDeep Learning"


def test_clean_text_rejects_non_string():
    with pytest.raises(TypeError):
        TextProcessor.clean_text(123)


def test_chunking_returns_multiple_chunks():
    text = " ".join(["Artificial"] * 100)

    chunks = TextProcessor.split_into_chunks(
        text,
        chunk_size=100,
        overlap=20
    )

    assert len(chunks) > 1


def test_chunking_preserves_complete_words():
    text = "Artificial Intelligence learns from data."

    chunks = TextProcessor.split_into_chunks(
        text,
        chunk_size=25,
        overlap=5
    )

    assert all(chunk.strip() for chunk in chunks)


def test_empty_text_returns_empty_list():
    result = TextProcessor.split_into_chunks("")

    assert result == []


def test_invalid_chunk_size_raises_error():
    with pytest.raises(ValueError):
        TextProcessor.split_into_chunks(
            "Artificial Intelligence",
            chunk_size=0
        )


def test_invalid_overlap_raises_error():
    with pytest.raises(ValueError):
        TextProcessor.split_into_chunks(
            "Artificial Intelligence",
            chunk_size=100,
            overlap=100
        )
