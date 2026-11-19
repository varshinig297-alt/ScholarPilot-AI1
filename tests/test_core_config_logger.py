import logging
from uuid import uuid4

import pytest

import src.core.config as config
from src.core.logger import get_logger


def test_validate_configuration_rejects_missing_google_api_key(monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_API_KEY", "")
    monkeypatch.setattr(config, "GEMINI_MODEL", "gemini-3-flash-preview")

    with pytest.raises(ValueError, match="GOOGLE_API_KEY is missing"):
        config.validate_configuration()


def test_validate_configuration_rejects_missing_gemini_model(monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_API_KEY", "test-api-key")
    monkeypatch.setattr(config, "GEMINI_MODEL", "")

    with pytest.raises(
        ValueError,
        match="GEMINI_MODEL is not configured",
    ):
        config.validate_configuration()


def test_validate_configuration_accepts_valid_settings(monkeypatch):
    monkeypatch.setattr(config, "GOOGLE_API_KEY", "test-api-key")
    monkeypatch.setattr(config, "GEMINI_MODEL", "gemini-3-flash-preview")

    assert config.validate_configuration() is None


def test_get_logger_reuses_existing_handlers():
    logger_name = f"tests.logger.reuse.{uuid4()}"

    logger = logging.getLogger(logger_name)
    existing_handler = logging.NullHandler()

    logger.addHandler(existing_handler)

    try:
        original_handlers = tuple(logger.handlers)

        result = get_logger(logger_name)

        assert result is logger
        assert tuple(logger.handlers) == original_handlers

    finally:
        logger.removeHandler(existing_handler)
        existing_handler.close()
