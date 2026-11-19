
import pytest

from src.services.quiz_service import QuizService
from src.core.exceptions import AgentExecutionError


VALID_QUESTION = {
    "question": "What is structured data?",
    "options": [
        "Data organized in a fixed format",
        "Data without any organization",
        "Random unprocessed information",
        "Data stored only as images"
    ],
    "correct_answer": "Data organized in a fixed format",
    "explanation": "Structured data follows a predefined format.",
    "source_ids": ["S1"]
}


def test_valid_question():
    result = QuizService.validate_questions(
        [VALID_QUESTION],
        ["S1", "S2"]
    )

    assert len(result) == 1
    assert result[0]["question"] == "What is structured data?"


def test_rejects_missing_question_text():
    question = VALID_QUESTION.copy()
    question["question"] = ""

    with pytest.raises(AgentExecutionError):
        QuizService.validate_questions([question], ["S1"])


def test_rejects_wrong_number_of_options():
    question = VALID_QUESTION.copy()
    question["options"] = ["Option A", "Option B"]

    with pytest.raises(AgentExecutionError):
        QuizService.validate_questions([question], ["S1"])


def test_rejects_duplicate_options():
    question = VALID_QUESTION.copy()
    question["options"] = [
        "Option A",
        "Option A",
        "Option C",
        "Option D"
    ]

    with pytest.raises(AgentExecutionError):
        QuizService.validate_questions([question], ["S1"])


def test_rejects_invalid_correct_answer():
    question = VALID_QUESTION.copy()
    question["correct_answer"] = "Option Z"

    with pytest.raises(AgentExecutionError):
        QuizService.validate_questions([question], ["S1"])


def test_rejects_invalid_source_reference():
    question = VALID_QUESTION.copy()
    question["source_ids"] = ["S9"]

    with pytest.raises(AgentExecutionError):
        QuizService.validate_questions([question], ["S1"])


def test_extracts_json_response():
    content = '{"questions": []}'

    result = QuizService._extract_json(content)

    assert result == {"questions": []}


def test_extracts_json_from_markdown():
    content = '''```json
{"questions": []}
```'''

    result = QuizService._extract_json(content)

    assert result == {"questions": []}


def test_rejects_invalid_json():
    with pytest.raises(AgentExecutionError):
        QuizService._extract_json("This is not JSON")


def test_evaluates_correct_answers():
    questions = [
        VALID_QUESTION,
        {
            **VALID_QUESTION,
            "question": "Second question?"
        }
    ]

    answers = {
        0: "Data organized in a fixed format",
        1: "Wrong answer"
    }

    result = QuizService.evaluate_answers(
        questions,
        answers
    )

    assert result["score"] == 1
    assert result["total_questions"] == 2
    assert result["percentage"] == 50.0
    assert result["results"][0]["is_correct"] is True
    assert result["results"][1]["is_correct"] is False


def test_evaluates_all_correct_answers():
    questions = [VALID_QUESTION]

    answers = {
        0: "Data organized in a fixed format"
    }

    result = QuizService.evaluate_answers(
        questions,
        answers
    )

    assert result["score"] == 1
    assert result["percentage"] == 100.0


def test_evaluates_unanswered_question():
    result = QuizService.evaluate_answers(
        [VALID_QUESTION],
        {}
    )

    assert result["score"] == 0
    assert result["percentage"] == 0.0
    assert result["results"][0]["selected_answer"] is None


def test_rejects_empty_question_list():
    with pytest.raises(AgentExecutionError):
        QuizService.evaluate_answers([], {})
