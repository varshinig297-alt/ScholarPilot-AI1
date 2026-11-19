
import json
import sqlite3

from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterator, List


PROJECT_ROOT = Path(__file__).resolve().parents[3]
DATABASE_PATH = PROJECT_ROOT / "data" / "quiz_history.db"


class QuizHistoryStore:
    """Persistent SQLite storage for student-specific quiz attempts."""

    def __init__(self, database_path: Path = DATABASE_PATH):
        self.database_path = Path(database_path)
        self.database_path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )
        self.initialize_database()

    @contextmanager
    def _connection(self) -> Iterator[sqlite3.Connection]:
        """Open a database connection and always close it safely."""

        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row

        try:
            yield connection
            connection.commit()

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    def initialize_database(self):
        """Create the table and safely migrate existing databases."""

        with self._connection() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS quiz_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    quiz_id TEXT NOT NULL UNIQUE,
                    user_id TEXT,
                    topic TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    percentage REAL NOT NULL,
                    results_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )

            columns = {
                row["name"]
                for row in connection.execute(
                    "PRAGMA table_info(quiz_attempts)"
                ).fetchall()
            }

            if "user_id" not in columns:
                connection.execute(
                    "ALTER TABLE quiz_attempts ADD COLUMN user_id TEXT"
                )

            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic
                ON quiz_attempts(topic)
                """
            )

            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created
                ON quiz_attempts(created_at)
                """
            )

            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user
                ON quiz_attempts(user_id)
                """
            )

    def save_attempt(
        self,
        quiz_id: str,
        user_id: str,
        topic: str,
        result: Dict[str, Any],
    ) -> int:
        """Save a completed quiz attempt for its owner."""

        created_at = datetime.now(timezone.utc).isoformat()

        with self._connection() as connection:
            cursor = connection.execute(
                """
                INSERT INTO quiz_attempts (
                    quiz_id,
                    user_id,
                    topic,
                    score,
                    total_questions,
                    percentage,
                    results_json,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    quiz_id,
                    user_id,
                    topic,
                    result["score"],
                    result["total_questions"],
                    result["percentage"],
                    json.dumps(result["results"]),
                    created_at,
                ),
            )

            return cursor.lastrowid

    def get_attempts(
        self,
        user_id: str,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Return only the specified student's quiz attempts."""

        with self._connection() as connection:
            rows = connection.execute(
                """
                SELECT *
                FROM quiz_attempts
                WHERE user_id = ?
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """,
                (user_id, limit),
            ).fetchall()

        attempts = []

        for row in rows:
            attempt = dict(row)
            attempt["results"] = json.loads(
                attempt.pop("results_json")
            )
            attempts.append(attempt)

        return attempts

    def get_summary(self, user_id: str) -> Dict[str, Any]:
        """Calculate analytics only for the specified student."""

        with self._connection() as connection:
            row = connection.execute(
                """
                SELECT
                    COUNT(*) AS total_attempts,
                    COALESCE(SUM(score), 0) AS total_correct,
                    COALESCE(SUM(total_questions), 0) AS total_questions,
                    COALESCE(AVG(percentage), 0) AS average_percentage
                FROM quiz_attempts
                WHERE user_id = ?
                """,
                (user_id,),
            ).fetchone()

        return dict(row)


quiz_history_store = QuizHistoryStore()
