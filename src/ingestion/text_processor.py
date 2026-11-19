import re
from typing import List


class TextProcessor:
    """
    Cleans extracted document text and divides it into chunks.
    """

    @staticmethod
    def clean_text(text: str) -> str:

        if not isinstance(text, str):
            raise TypeError("Input must be a string.")

        text = text.replace("\r\n", "\n").replace("\r", "\n")
        text = text.replace("\x00", "")
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()

    @staticmethod
    def split_into_chunks(
        text: str,
        chunk_size: int = 1000,
        overlap: int = 150
    ) -> List[str]:

        if not isinstance(text, str):
            raise TypeError("Input must be a string.")

        if chunk_size <= 0:
            raise ValueError("Chunk size must be greater than zero.")

        if overlap < 0 or overlap >= chunk_size:
            raise ValueError(
                "Overlap must be non-negative and smaller than chunk size."
            )

        text = TextProcessor.clean_text(text)

        if not text:
            return []

        words = text.split()
        chunks = []
        current_words = []
        current_length = 0

        for word in words:

            added_length = len(word) + (
                1 if current_words else 0
            )

            if current_length + added_length > chunk_size:

                if current_words:
                    chunks.append(" ".join(current_words))

                # Preserve complete words for the next chunk.
                overlap_words = []
                overlap_length = 0

                for previous_word in reversed(current_words):

                    required_length = len(previous_word) + (
                        1 if overlap_words else 0
                    )

                    if overlap_length + required_length > overlap:
                        break

                    overlap_words.insert(0, previous_word)
                    overlap_length += required_length

                current_words = overlap_words
                current_length = len(" ".join(current_words))

            current_words.append(word)

            current_length = len(" ".join(current_words))

        if current_words:
            chunks.append(" ".join(current_words))

        return chunks
