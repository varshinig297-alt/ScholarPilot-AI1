class ScholarPilotError(Exception):
    """Base exception for all ScholarPilot AI errors."""


class ConfigurationError(ScholarPilotError):
    """Raised when application configuration is invalid."""


class DocumentProcessingError(ScholarPilotError):
    """Raised when a document cannot be processed."""


class UnsupportedDocumentError(DocumentProcessingError):
    """Raised when an uploaded document format is unsupported."""


class EmptyDocumentError(DocumentProcessingError):
    """Raised when a document contains no extractable text."""


class AgentExecutionError(ScholarPilotError):
    """Raised when an AI agent fails during execution."""


class RetrievalError(ScholarPilotError):
    """Raised when document retrieval fails."""


class EvaluationError(ScholarPilotError):
    """Raised when an answer or assessment cannot be evaluated."""
