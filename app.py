
import os
import tempfile
from pathlib import Path

import streamlit as st

from src.core.config import (
    APP_NAME,
    APP_VERSION,
    MAX_UPLOAD_SIZE_MB,
)
from src.core.exceptions import ScholarPilotError
from src.services.document_service import DocumentService
from src.retrieval.retriever import DocumentRetriever
from src.services.academic_tutor import AcademicTutor
from src.services.quiz_service import QuizService

st.set_page_config(
    page_title="ScholarPilot AI",
    page_icon="🎓",
    layout="wide"
)


def initialize_session():
    defaults = {
        "processed_documents": {},
        "retriever": None,
        "chat_history": [],
    }

    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


initialize_session()


def process_uploaded_files(uploaded_files):
    successful = 0

    for uploaded_file in uploaded_files:

        if uploaded_file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            st.error(
                f"{uploaded_file.name} exceeds the "
                f"{MAX_UPLOAD_SIZE_MB} MB upload limit."
            )
            continue

        suffix = Path(uploaded_file.name).suffix.lower()

        if suffix not in [".pdf", ".txt"]:
            st.error(f"Unsupported file: {uploaded_file.name}")
            continue

        temporary_path = None

        try:
            with tempfile.NamedTemporaryFile(
                suffix=suffix,
                delete=False
            ) as temporary_file:

                temporary_file.write(uploaded_file.getvalue())
                temporary_path = temporary_file.name

            document = DocumentService.process_document(
                temporary_path
            )

            document.metadata.filename = uploaded_file.name

            st.session_state.processed_documents[
                uploaded_file.name
            ] = document

            successful += 1

        except ScholarPilotError as exc:
            st.error(f"{uploaded_file.name}: {exc}")

        except Exception as exc:
            st.error(
                f"Unexpected error processing "
                f"{uploaded_file.name}: {exc}"
            )

        finally:
            if temporary_path and os.path.exists(temporary_path):
                os.remove(temporary_path)

    if st.session_state.processed_documents:

        retriever = DocumentRetriever()

        retriever.index_documents(
            list(st.session_state.processed_documents.values())
        )

        st.session_state.retriever = retriever

    return successful


def display_dashboard():

    st.title("🎓 ScholarPilot AI")

    st.caption(
        "Your intelligent academic learning companion"
    )

    documents = st.session_state.processed_documents

    total_chunks = sum(
        document.chunk_count
        for document in documents.values()
    )

    total_words = sum(
        document.word_count
        for document in documents.values()
    )

    col1, col2, col3 = st.columns(3)

    col1.metric("Documents", len(documents))
    col2.metric("Text Chunks", total_chunks)
    col3.metric("Total Words", f"{total_words:,}")

    st.divider()

    st.subheader("📚 Upload Study Materials")

    uploaded_files = st.file_uploader(
        "Choose your academic documents",
        type=["pdf", "txt"],
        accept_multiple_files=True,
        help=(
            "Upload PDF or TXT files. "
            f"Maximum size: {MAX_UPLOAD_SIZE_MB} MB per file."
        )
    )

    if st.button(
        "Process Documents",
        type="primary",
        disabled=not uploaded_files,
        use_container_width=True
    ):

        with st.spinner("Processing your study materials..."):

            successful = process_uploaded_files(uploaded_files)

        if successful:
            st.success(
                f"Successfully processed {successful} document(s)."
            )
            st.rerun()

    if documents:

        st.divider()
        st.subheader("📖 Your Document Library")

        for filename, document in documents.items():

            with st.expander(f"📄 {filename}"):

                st.write(f"**Words:** {document.word_count:,}")
                st.write(f"**Chunks:** {document.chunk_count}")
                st.write(f"**Characters:** {document.character_count:,}")

                if document.page_count is not None:
                    st.write(f"**Pages:** {document.page_count}")


def display_citation_validation(validation):
    """Display citation ID validation results."""

    if not validation:
        st.warning(
            "Citation validation information is unavailable."
        )
        return

    if not validation.get("has_citations", False):

        st.warning(
            "No citations found in this answer. "
            "The answer's claims have not been linked to source IDs."
        )

    elif validation.get("invalid_citations"):

        invalid_ids = ", ".join(
            validation["invalid_citations"]
        )

        st.error(
            f"Invalid source citations detected: {invalid_ids}"
        )

    elif validation.get("valid", False):

        st.success(
            "Citation ID validation passed. "
            "All cited source IDs exist in the retrieved sources."
        )

    else:

        st.warning(
            "Citation validation could not confirm all source IDs."
        )

    cited_sources = validation.get("cited_sources", [])

    if cited_sources:
        st.caption(
            "Cited sources: "
            + ", ".join(
                f"[{source_id}]"
                for source_id in cited_sources
            )
        )

    available_sources = validation.get("available_sources", [])

    if available_sources:
        st.caption(
            "Available sources: "
            + ", ".join(
                f"[{source_id}]"
                for source_id in available_sources
            )
        )


def display_semantic_verification(verification):
    """Display AI-based evidence verification results."""

    st.subheader("🔍 Semantic Citation Verification")

    if not verification:
        st.warning(
            "Semantic verification information is unavailable."
        )
        return

    if not verification.get("verified", False):
        st.warning(
            "Semantic verification could not be completed successfully."
        )

        if verification.get("error"):
            st.caption(verification["error"])

        return

    claims = verification.get("claims", [])
    summary = verification.get("summary", "")

    if summary:
        st.write(summary)

    if not claims:
        st.info(
            "No factual claims were returned for verification."
        )
        return

    # Calculate claim counts
    supported = sum(
        claim.get("status") == "supported"
        for claim in claims
    )

    partially_supported = sum(
        claim.get("status") == "partially_supported"
        for claim in claims
    )

    unsupported = sum(
        claim.get("status") == "unsupported"
        for claim in claims
    )

    unverified = verification.get(
        "unverified_count",
        sum(
            claim.get("status") == "unverified"
            for claim in claims
        )
    )

    recovered = verification.get(
        "recovered_evidence_count",
        sum(
            claim.get("evidence_recovered", False)
            for claim in claims
        )
    )

    # Display six verification metrics
    col1, col2, col3 = st.columns(3)

    col1.metric("Total Claims", len(claims))
    col2.metric("Supported", supported)
    col3.metric("Partially Supported", partially_supported)

    col4, col5, col6 = st.columns(3)

    col4.metric("Unsupported", unsupported)
    col5.metric("Unverified", unverified)
    col6.metric("Evidence Recovered", recovered)

    st.divider()

    # Display individual claim verification
    for index, claim in enumerate(claims, start=1):

        status = claim.get("status", "unknown")
        claim_text = claim.get(
            "claim",
            "Claim text unavailable"
        )
        citations = claim.get("citations", [])

        with st.expander(
            f"Claim {index}: {status.replace('_', ' ').title()}"
        ):

            st.markdown(f"**Claim:** {claim_text}")

            if citations:
                st.write(
                    "**Cited sources:** "
                    + ", ".join(
                        f"[{source}]" for source in citations
                    )
                )
            else:
                st.warning(
                    "No source IDs were provided for this claim."
                )

            if claim.get("evidence_recovered", False):
                st.success(
                    "Supporting evidence was successfully recovered."
                )

            evidence_quote = claim.get("evidence_quote", "")

            if evidence_quote:
                st.markdown("**Exact evidence quotation:**")
                st.info(f"> {evidence_quote}")
            else:
                st.warning(
                    "No exact evidence quotation was provided."
                )

            exact_evidence_found = claim.get(
                "exact_evidence_found",
                False
            )

            if exact_evidence_found:
                st.success(
                    "Exact quotation found in the cited source passage."
                )
            else:
                st.error(
                    "Exact quotation could not be matched "
                    "to the cited source passage."
                )

            explanation = claim.get("explanation", "")

            if explanation:
                st.caption(f"Explanation: {explanation}")

    verification_method = verification.get(
        "verification_method"
    )

    if verification_method:
        st.caption(
            f"Verification method: {verification_method}"
        )

    st.caption(
        "Note: Exact quotation matching confirms that the quoted "
        "text exists in the source passage. It does not independently "
        "prove that the quotation logically supports the entire claim."
    )


def display_sources(sources):
    """Display retrieved passages with source identifiers."""

    if not sources:
        return

    with st.expander("📚 View source documents"):

        for source in sources:

            source_id = source.get(
                "source_id",
                "Source ID unavailable"
            )

            filename = source.get(
                "filename",
                "Unknown document"
            )

            page_number = source.get("page_number")

            page_reference = (
                f"Page {page_number}"
                if page_number is not None
                else "Page not available"
            )

            chunk_id = source.get(
                "chunk_id",
                "Not available"
            )

            relevance_score = source.get(
                "relevance_score",
                "Not available"
            )

            st.markdown(
                f"**[{source_id}] {filename}** | "
                f"{page_reference} | "
                f"Chunk {chunk_id} | "
                f"Relevance: {relevance_score}"
            )

            st.info(
                source.get(
                    "text",
                    "No passage available."
                )
            )

def display_quiz_generator():

    st.title("📝 AI Quiz Generator")

    st.caption(
        "Create personalized practice quizzes from your uploaded study materials."
    )

    if not st.session_state.processed_documents:
        st.info(
            "Upload and process your study materials "
            "from the Dashboard first."
        )
        return

    st.success(
        f"{len(st.session_state.processed_documents)} "
        "study document(s) available."
    )

    if "generated_quiz" not in st.session_state:
        st.session_state.generated_quiz = None

    if "quiz_answers" not in st.session_state:
        st.session_state.quiz_answers = {}

    if "quiz_result" not in st.session_state:
        st.session_state.quiz_result = None

    if "quiz_submitted" not in st.session_state:
        st.session_state.quiz_submitted = False

    st.subheader("Configure your quiz")

    with st.form("quiz_generation_form"):

        topic = st.text_input(
            "Enter your topic",
            placeholder="Example: Database Management Systems"
        )

        num_questions = st.select_slider(
            "Number of questions",
            options=[5, 10, 15, 20],
            value=5
        )

        generate_clicked = st.form_submit_button(
            "✨ Generate Quiz",
            use_container_width=True
        )

    if generate_clicked:

        if not topic.strip():
            st.warning("Please enter a topic.")
        else:

            with st.spinner(
                "Finding relevant study material and generating questions..."
            ):

                try:

                    quiz_service = QuizService(
                        st.session_state.retriever
                    )

                    quiz = quiz_service.generate_quiz(
                        topic=topic,
                        num_questions=num_questions
                    )

                    st.session_state.generated_quiz = quiz
                    st.session_state.quiz_answers = {}
                    st.session_state.quiz_result = None
                    st.session_state.quiz_submitted = False

                    st.success(
                        f"Successfully generated "
                        f"{quiz['total_questions']} questions!"
                    )

                except ScholarPilotError as exc:
                    st.error(str(exc))

                except Exception as exc:
                    st.error(
                        f"Quiz generation failed: {exc}"
                    )

    quiz = st.session_state.generated_quiz

    if not quiz:
        st.info(
            "Enter a topic above to generate your first quiz."
        )
        return

    st.divider()

    st.subheader(f"📚 Quiz: {quiz['topic']}")

    st.write(
        f"Total questions: {quiz['total_questions']}"
    )

    with st.form("quiz_attempt_form"):

        for index, question in enumerate(quiz["questions"]):

            st.markdown(
                f"### Question {index + 1}"
            )

            st.write(question["question"])

            selected = st.radio(
                "Choose your answer:",
                question["options"],
                index=None,
                key=f"quiz_question_{index}",
                disabled=st.session_state.quiz_submitted
            )

            if selected is not None:
                st.session_state.quiz_answers[index] = selected

            st.caption(
                f"Source: {', '.join(question['source_ids'])}"
            )

            st.divider()

        submit_quiz = st.form_submit_button(
            "Submit Quiz",
            use_container_width=True,
            disabled=st.session_state.quiz_submitted
        )

    if submit_quiz:

        result = QuizService.evaluate_answers(
            quiz["questions"],
            st.session_state.quiz_answers
        )

        st.session_state.quiz_result = result
        st.session_state.quiz_submitted = True

        st.rerun()

    if st.session_state.quiz_submitted:

        result = st.session_state.quiz_result

        st.subheader("🏆 Your Quiz Results")

        col1, col2, col3 = st.columns(3)

        col1.metric(
            "Score",
            f"{result['score']}/{result['total_questions']}"
        )

        col2.metric(
            "Percentage",
            f"{result['percentage']}%"
        )

        col3.metric(
            "Correct Answers",
            result["score"]
        )

        if result["percentage"] >= 80:
            st.success("Excellent work! You have understood this topic well.")

        elif result["percentage"] >= 50:
            st.info("Good effort! Review the explanations to improve.")

        else:
            st.warning("Keep practising. Review your study materials and try again.")

        st.divider()

        st.subheader("Answer Review")

        for index, answer in enumerate(result["results"], start=1):

            with st.expander(
                f"Question {index}: "
                f"{'✅ Correct' if answer['is_correct'] else '❌ Incorrect'}"
            ):

                st.write(answer["question"])

                st.write(
                    f"**Your answer:** "
                    f"{answer['selected_answer'] or 'Not answered'}"
                )

                st.write(
                    f"**Correct answer:** "
                    f"{answer['correct_answer']}"
                )

                st.info(
                    f"**Explanation:** {answer['explanation']}"
                )

                st.caption(
                    "Supporting sources: "
                    + ", ".join(answer["source_ids"])
                )

        if st.button(
            "🔄 Generate Another Quiz",
            use_container_width=True
        ):

            st.session_state.generated_quiz = None
            st.session_state.quiz_answers = {}
            st.session_state.quiz_result = None
            st.session_state.quiz_submitted = False

            st.rerun()



def display_academic_tutor():

    st.title("🤖 Academic AI Tutor")

    st.caption(
        "Ask questions and understand concepts using your uploaded materials."
    )

    if not st.session_state.processed_documents:

        st.info(
            "Upload and process your study materials "
            "from the Dashboard first."
        )
        return

    st.success(
        f"{len(st.session_state.processed_documents)} "
        "document(s) available for answering questions."
    )

    # Display previous conversations.

    for message in st.session_state.chat_history:

        with st.chat_message(message["role"]):

            st.markdown(message["content"])

            if message["role"] == "assistant":

                display_citation_validation(
                    message.get("citation_validation")
                )

                display_semantic_verification(
                    message.get("semantic_verification")
                )

                display_sources(
                    message.get("sources", [])
                )

    question = st.chat_input(
        "Ask anything about your uploaded study materials..."
    )

    if question:

        st.session_state.chat_history.append({
            "role": "user",
            "content": question
        })

        with st.chat_message("user"):
            st.markdown(question)

        with st.chat_message("assistant"):

            with st.spinner("ScholarPilot is thinking..."):

                try:

                    tutor = AcademicTutor(
                        st.session_state.retriever
                    )

                    result = tutor.ask(question)

                    st.markdown(result["answer"])

                    display_citation_validation(
                        result.get("citation_validation")
                    )

                    display_semantic_verification(
                        result.get("semantic_verification")
                    )

                    display_sources(
                        result.get("sources", [])
                    )

                    st.session_state.chat_history.append({
                        "role": "assistant",
                        "content": result["answer"],
                        "sources": result.get("sources", []),
                        "citation_validation": result.get(
                            "citation_validation"
                        ),
                        "semantic_verification": result.get(
                            "semantic_verification"
                        )
                    })

                except ScholarPilotError as exc:

                    st.error(str(exc))

                except Exception as exc:

                    st.error(
                        f"Something went wrong: {exc}"
                    )



with st.sidebar:

    st.title("🎓 ScholarPilot")

    st.caption(f"Version {APP_VERSION}")

    page = st.radio(
        "Navigation",
        ["Dashboard", "Academic Tutor", "AI Quiz Generator"],
        label_visibility="collapsed"
    )

    st.divider()

    st.caption("AI-powered academic learning")

    if st.button(
        "Clear Chat",
        use_container_width=True
    ):

        st.session_state.chat_history = []
        st.rerun()


if page == "Dashboard":

    display_dashboard()

elif page == "Academic Tutor":

    display_academic_tutor()

elif page == "AI Quiz Generator":

    display_quiz_generator()


st.divider()

st.caption(
    f"{APP_NAME} | Built for smarter academic learning"
)
