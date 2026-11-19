
import json
from unittest.mock import Mock

import pytest

from src.services.citation_verifier import CitationVerifier
from src.core.exceptions import AgentExecutionError


@pytest.fixture
def sources():
    return [
        {
            "source_id": "S1",
            "text": (
                "Structured data is organized into rows and columns "
                "and follows a predefined data model."
            )
        },
        {
            "source_id": "S2",
            "text": (
                "Unstructured data does not follow a predefined "
                "data model. Examples include images and videos."
            )
        }
    ]


def create_mock_llm(response_data):
    """Create a mock Gemini model response."""

    mock_llm = Mock()

    mock_response = Mock()
    mock_response.content = json.dumps(response_data)

    mock_llm.invoke.return_value = mock_response

    return mock_llm


def test_supported_claim(sources):
    response_data = {
        "claims": [
            {
                "claim": "Structured data uses rows and columns.",
                "citations": ["S1"],
                "status": "supported",
                "evidence_quote": (
                    "Structured data is organized into rows and columns"
                ),
                "explanation": (
                    "The source explicitly states that structured "
                    "data is organized into rows and columns."
                )
            }
        ],
        "summary": "The claim is supported."
    }

    verifier = CitationVerifier(
        create_mock_llm(response_data)
    )

    result = verifier.verify(
        answer="Structured data uses rows and columns [S1].",
        sources=sources
    )

    assert result["verified"] is True
    assert len(result["claims"]) == 1
    assert result["claims"][0]["status"] == "supported"
    assert result["claims"][0]["exact_evidence_found"] is True
    assert result["verification_method"] == (
    "llm_recovery_with_exact_quote_validation"
)


def test_partially_supported_claim(sources):
    response_data = {
        "claims": [
            {
                "claim": (
                    "Structured data uses rows and columns "
                    "and is always stored in cloud databases."
                ),
                "citations": ["S1"],
                "status": "partially_supported",
                "evidence_quote": (
                    "Structured data is organized into rows and columns"
                ),
                "explanation": (
                    "The source supports the rows and columns "
                    "part but does not mention cloud databases."
                )
            }
        ],
        "summary": "The claim is partially supported."
    }

    verifier = CitationVerifier(
        create_mock_llm(response_data)
    )

    result = verifier.verify(
        answer=(
            "Structured data uses rows and columns and is always "
            "stored in cloud databases [S1]."
        ),
        sources=sources
    )

    assert result["verified"] is True
    assert result["claims"][0]["status"] == "partially_supported"
    assert result["claims"][0]["exact_evidence_found"] is True


def test_unsupported_claim(sources):
    response_data = {
        "claims": [
            {
                "claim": "Structured data is always stored in videos.",
                "citations": ["S1"],
                "status": "unsupported",
                "evidence_quote": "",
                "explanation": (
                    "The source does not state that structured "
                    "data is stored in videos."
                )
            }
        ],
        "summary": "The claim is unsupported."
    }

    verifier = CitationVerifier(
        create_mock_llm(response_data)
    )

    result = verifier.verify(
        answer="Structured data is always stored in videos [S1].",
        sources=sources
    )

    assert result["verified"] is True
    assert result["claims"][0]["status"] == "unsupported"
    assert result["claims"][0]["exact_evidence_found"] is False
    assert result["claims"][0]["evidence_quote"] == ""



def test_invented_evidence_is_rejected(sources):
    initial_response = {
        "claims": [
            {
                "claim": "Structured data is stored in cloud databases.",
                "citations": ["S1"],
                "status": "supported",
                "evidence_quote": (
                    "Structured data is always stored in cloud databases."
                ),
                "explanation": "The source supposedly supports this."
            }
        ],
        "summary": "The claim is supported."
    }

    recovery_response = {
        "recoveries": [
            {
                "claim_index": 0,
                "status": "unsupported",
                "evidence_quote": "",
                "explanation": (
                    "The cited textbook passage does not state "
                    "that structured data is stored in cloud databases."
                )
            }
        ]
    }

    mock_llm = Mock()
    mock_llm.invoke.side_effect = [
        Mock(content=json.dumps(initial_response)),
        Mock(content=json.dumps(recovery_response)),
    ]

    verifier = CitationVerifier(mock_llm)

    result = verifier.verify(
        answer="Structured data is stored in cloud databases [S1].",
        sources=sources
    )

    assert result["verified"] is True
    assert result["claims"][0]["status"] == "unsupported"
    assert result["claims"][0]["exact_evidence_found"] is False
    assert result["claims"][0]["evidence_quote"] == ""
    assert result["claims"][0]["evidence_recovered"] is False
    assert mock_llm.invoke.call_count == 2

def test_invalid_citation(sources):
    mock_llm = Mock()

    verifier = CitationVerifier(mock_llm)

    result = verifier.verify(
        answer="This claim uses an unknown source [S9].",
        sources=sources
    )

    assert result["verified"] is False
    assert result["invalid_citations"] == ["S9"]

    mock_llm.invoke.assert_not_called()


def test_missing_citations(sources):
    mock_llm = Mock()

    verifier = CitationVerifier(mock_llm)

    result = verifier.verify(
        answer="Structured data uses rows and columns.",
        sources=sources
    )

    assert result["verified"] is False
    assert result["claims"] == []

    mock_llm.invoke.assert_not_called()


def test_no_sources():
    mock_llm = Mock()

    verifier = CitationVerifier(mock_llm)

    result = verifier.verify(
        answer="Structured data uses rows and columns [S1].",
        sources=[]
    )

    assert result["verified"] is False
    assert result["claims"] == []

    mock_llm.invoke.assert_not_called()


def test_invalid_status_is_rejected(sources):
    response_data = {
        "claims": [
            {
                "claim": "Structured data uses rows and columns.",
                "citations": ["S1"],
                "status": "probably_correct",
                "evidence_quote": (
                    "Structured data is organized into rows and columns"
                ),
                "explanation": "Invalid status."
            }
        ],
        "summary": "Test response."
    }

    verifier = CitationVerifier(
        create_mock_llm(response_data)
    )

    with pytest.raises(AgentExecutionError):
        verifier.verify(
            answer="Structured data uses rows and columns [S1].",
            sources=sources
        )


def test_invalid_json_is_rejected(sources):
    mock_llm = Mock()

    mock_response = Mock()
    mock_response.content = "This is not valid JSON."

    mock_llm.invoke.return_value = mock_response

    verifier = CitationVerifier(mock_llm)

    with pytest.raises(AgentExecutionError):
        verifier.verify(
            answer="Structured data uses rows and columns [S1].",
            sources=sources
        )

def test_verifier_recovers_missing_evidence(sources):
    initial_response = {
        "claims": [
            {
                "claim": "Structured data uses rows and columns.",
                "citations": ["S1"],
                "status": "supported",
                "evidence_quote": (
                    "Structured data is organized into rows and columns"
                ),
                "explanation": "The textbook supports this claim."
            },
            {
                "claim": "Structured data is stored in cloud databases.",
                "citations": ["S1"],
                "status": "supported",
                "evidence_quote": "",
                "explanation": "No exact quotation was supplied."
            }
        ],
        "summary": "Verification completed."
    }

    recovery_response = {
        "recoveries": [
            {
                "claim_index": 1,
                "status": "unsupported",
                "evidence_quote": "",
                "explanation": (
                    "The textbook does not establish that "
                    "structured data is stored in cloud databases."
                )
            }
        ]
    }

    mock_llm = Mock()
    mock_llm.invoke.side_effect = [
        Mock(content=json.dumps(initial_response)),
        Mock(content=json.dumps(recovery_response)),
    ]

    verifier = CitationVerifier(mock_llm)

    result = verifier.verify(
        answer=(
            "Structured data uses rows and columns [S1]. "
            "Structured data is stored in cloud databases [S1]."
        ),
        sources=sources
    )

    assert mock_llm.invoke.call_count == 2
    assert result["verified"] is True
    assert result["claims"][0]["status"] == "supported"
    assert result["claims"][1]["status"] == "unsupported"
    assert result["unverified_count"] == 0
    assert result["unsupported_count"] == 1


def test_gemini_503_error_retries_successfully():
    mock_llm = Mock()

    mock_llm.invoke.side_effect = [
        Exception("503 UNAVAILABLE"),
        Mock(content='{"status": "success"}'),
    ]

    verifier = CitationVerifier(mock_llm)

    from unittest.mock import patch

    with patch("src.services.citation_verifier.time.sleep") as mock_sleep:
        response = verifier._invoke_with_retry("Test prompt")

    assert response.content == '{"status": "success"}'
    assert mock_llm.invoke.call_count == 2
    mock_sleep.assert_called_once_with(2)


