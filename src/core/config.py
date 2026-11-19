import os
from pathlib import Path

from dotenv import load_dotenv


# --------------------------------------------------
# PROJECT ROOT
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ENV_FILE = PROJECT_ROOT / ".env"

load_dotenv(ENV_FILE)


# --------------------------------------------------
# APPLICATION CONFIGURATION
# --------------------------------------------------

APP_NAME = "ScholarPilot AI"

APP_VERSION = "1.0.0"

APP_ENV = os.getenv("APP_ENV", "development")

DEBUG = APP_ENV == "development"


# --------------------------------------------------
# GOOGLE GEMINI CONFIGURATION
# --------------------------------------------------

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.5-flash-lite"
)


# --------------------------------------------------
# DOCUMENT CONFIGURATION
# --------------------------------------------------

MAX_UPLOAD_SIZE_MB = 25

SUPPORTED_DOCUMENT_TYPES = [
    "pdf",
    "txt"
]


# --------------------------------------------------
# VALIDATION
# --------------------------------------------------

def validate_configuration():

    if not GOOGLE_API_KEY:
        raise ValueError(
            "GOOGLE_API_KEY is missing. "
            "Please configure it in the .env file."
        )

    if not GEMINI_MODEL:
        raise ValueError(
            "GEMINI_MODEL is not configured."
        )
