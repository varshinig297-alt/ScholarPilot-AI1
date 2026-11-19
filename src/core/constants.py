# --------------------------------------------------
# APPLICATION CONSTANTS
# --------------------------------------------------

APP_NAME = "ScholarPilot AI"

DEFAULT_LANGUAGE = "English"


# --------------------------------------------------
# DOCUMENT CONSTANTS
# --------------------------------------------------

SUPPORTED_FILE_EXTENSIONS = {
    ".pdf",
    ".txt"
}

MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

MIN_DOCUMENT_TEXT_LENGTH = 20


# --------------------------------------------------
# ACADEMIC DIFFICULTY LEVELS
# --------------------------------------------------

DIFFICULTY_LEVELS = [
    "Beginner",
    "Intermediate",
    "Advanced"
]


# --------------------------------------------------
# QUESTION TYPES
# --------------------------------------------------

QUESTION_TYPES = [
    "MCQ",
    "Short Answer",
    "Application Based"
]


# --------------------------------------------------
# AGENT IDENTIFIERS
# --------------------------------------------------

AGENT_NAMES = {
    "orchestrator": "Master Orchestrator",
    "document_analyst": "Document Analyst",
    "academic_planner": "Academic Planner",
    "quiz_designer": "Quiz Designer",
    "quality_reviewer": "Quality Reviewer",
    "evaluation": "Evaluation Agent",
    "learning_coach": "Learning Coach"
}
