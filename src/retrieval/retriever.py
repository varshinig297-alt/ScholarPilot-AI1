from dataclasses import dataclass
from typing import List, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from src.core.exceptions import RetrievalError
from src.schemas.processed_document import ProcessedDocument


@dataclass(frozen=True)
class RetrievedChunk:
    """Represents a relevant passage retrieved from an academic document."""

    document_id: str
    filename: str
    chunk_id: int
    text: str
    relevance_score: float
    page_number: Optional[int] = None


class DocumentRetriever:
    """Retrieves relevant academic passages using TF-IDF similarity."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2)
        )
        self.chunks: List[RetrievedChunk] = []
        self.document_matrix = None

    def index_documents(self, documents: List[ProcessedDocument]) -> int:
        """Build a searchable index from processed documents."""

        self.chunks = []
        self.document_matrix = None

        for document in documents:
            for chunk in document.chunks:
                self.chunks.append(
                    RetrievedChunk(
                        document_id=document.metadata.document_id,
                        filename=document.metadata.filename,
                        chunk_id=chunk.chunk_id,
                        text=chunk.text,
                        relevance_score=0.0,
                        page_number=chunk.page_number
                    )
                )

        if not self.chunks:
            return 0

        try:
            texts = [chunk.text for chunk in self.chunks]
            self.document_matrix = self.vectorizer.fit_transform(texts)

        except ValueError as exc:
            self.chunks = []
            self.document_matrix = None
            raise RetrievalError(
                "Unable to create a searchable document index."
            ) from exc

        return len(self.chunks)

    def retrieve(self, query: str, top_k: int = 4) -> List[RetrievedChunk]:
        """Find the most relevant document chunks for a question."""

        if not isinstance(query, str) or not query.strip():
            raise RetrievalError("Search query cannot be empty.")

        if not isinstance(top_k, int) or isinstance(top_k, bool) or top_k < 1:
            raise RetrievalError("top_k must be a positive integer.")

        if self.document_matrix is None or not self.chunks:
            return []

        try:
            query_vector = self.vectorizer.transform([query.strip()])
            scores = cosine_similarity(
                query_vector,
                self.document_matrix
            ).flatten()

            ranked_indices = sorted(
                range(len(scores)),
                key=lambda index: scores[index],
                reverse=True
            )

            results = []

            for index in ranked_indices:
                score = float(scores[index])

                if score <= 0:
                    continue

                chunk = self.chunks[index]

                results.append(
                    RetrievedChunk(
                        document_id=chunk.document_id,
                        filename=chunk.filename,
                        chunk_id=chunk.chunk_id,
                        text=chunk.text,
                        relevance_score=score,
                        page_number=chunk.page_number
                    )
                )

                if len(results) >= top_k:
                    break

            return results

        except Exception as exc:
            raise RetrievalError(
                "Failed to retrieve relevant document passages."
            ) from exc

    def retrieve_multiple(
        self,
        queries: List[str],
        top_k_per_query: int = 3,
        max_results: int = 6
    ) -> List[RetrievedChunk]:
        """Retrieve relevant passages for multiple independent concepts."""

        if not isinstance(queries, list) or not queries:
            raise RetrievalError("At least one search query is required.")

        if any(not isinstance(query, str) or not query.strip() for query in queries):
            raise RetrievalError("Every search query must be a non-empty string.")

        if not isinstance(top_k_per_query, int) or isinstance(top_k_per_query, bool) or top_k_per_query < 1:
            raise RetrievalError("top_k_per_query must be a positive integer.")

        if not isinstance(max_results, int) or isinstance(max_results, bool) or max_results < 1:
            raise RetrievalError("max_results must be a positive integer.")

        if max_results < len(queries):
            raise RetrievalError(
                "max_results must be at least the number of queries."
            )

        collected = {}
        query_results = []

        for query in queries:
            results = self.retrieve(
                query=query,
                top_k=top_k_per_query
            )
            query_results.append(results)

            for chunk in results:
                key = (chunk.document_id, chunk.chunk_id)

                if key not in collected or chunk.relevance_score > collected[key].relevance_score:
                    collected[key] = chunk

        selected = {}

        for results in query_results:
            for chunk in results:
                key = (chunk.document_id, chunk.chunk_id)
                if key not in selected:
                    selected[key] = collected[key]
                    break

        remaining = sorted(
            collected.values(),
            key=lambda chunk: chunk.relevance_score,
            reverse=True
        )

        for chunk in remaining:
            key = (chunk.document_id, chunk.chunk_id)
            selected.setdefault(key, chunk)

        return list(selected.values())[:max_results]
