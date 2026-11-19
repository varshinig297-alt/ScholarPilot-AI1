from src.services.academic_tutor import AcademicTutor


SOURCES = [
    {"source_id": "S1"},
    {"source_id": "S2"},
]


def test_valid_citations():
    result = AcademicTutor._validate_citations(
        answer="Structured data uses fixed fields [S1].",
        sources=SOURCES
    )

    assert result["valid"] is True
    assert result["has_citations"] is True
    assert result["cited_sources"] == ["S1"]
    assert result["invalid_citations"] == []


def test_invalid_citation():
    result = AcademicTutor._validate_citations(
        answer="Quantum computing uses qubits [S9].",
        sources=SOURCES
    )

    assert result["valid"] is False
    assert result["invalid_citations"] == ["S9"]


def test_missing_citations():
    result = AcademicTutor._validate_citations(
        answer="Structured data uses rows and columns.",
        sources=SOURCES
    )

    assert result["valid"] is False
    assert result["has_citations"] is False
    assert result["cited_sources"] == []


def test_multiple_valid_citations():
    result = AcademicTutor._validate_citations(
        answer="Data has different forms [S1] [S2].",
        sources=SOURCES
    )

    assert result["valid"] is True
    assert result["cited_sources"] == ["S1", "S2"]
