
import json
import re
import time
import traceback
from typing import Any, Dict, List

from src.core.exceptions import AgentExecutionError


class CitationVerifier:
    """Verify academic claims against cited textbook passages."""

    VALID_STATUSES = {
        "supported",
        "partially_supported",
        "unsupported",
        "unverified",
    }

    def __init__(self, llm):
        self.llm = llm

    # --------------------------------------------------
    # JSON EXTRACTION
    # --------------------------------------------------

    @staticmethod
    def _extract_json(content: Any) -> Dict[str, Any]:
        """Extract a JSON object from the model response."""

        if isinstance(content, str):
            raw_result = content

        elif isinstance(content, list):
            raw_result = "\n".join(
                item["text"]
                for item in content
                if isinstance(item, dict)
                and item.get("type") == "text"
                and isinstance(item.get("text"), str)
            )

        else:
            raise ValueError(
                "Unsupported verification response format."
            )

        raw_result = raw_result.strip()

        if raw_result.startswith("```"):
            raw_result = re.sub(
                r"^```(?:json)?\s*|\s*```$",
                "",
                raw_result,
                flags=re.IGNORECASE,
            ).strip()

        result = json.loads(raw_result)

        if not isinstance(result, dict):
            raise ValueError(
                "Verification response must be a JSON object."
            )

        return result

    # --------------------------------------------------
    # EVIDENCE VALIDATION
    # --------------------------------------------------

    @staticmethod
    def _normalize_text(text: str) -> str:
        return " ".join(text.split())

    @classmethod
    def _find_exact_evidence(
        cls,
        evidence_quote: str,
        source_text: str,
    ) -> bool:
        """Check whether the exact quotation exists in the source."""

        if not evidence_quote or not source_text:
            return False

        quote = cls._normalize_text(evidence_quote)
        passage = cls._normalize_text(source_text)

        return quote in passage

    # --------------------------------------------------
    # SOURCE MAPPING
    # --------------------------------------------------

    @staticmethod
    def _build_source_map(
        sources: List[Dict[str, Any]],
    ) -> Dict[str, str]:

        source_map = {}

        for source in sources:

            if not isinstance(source, dict):
                continue

            source_id = source.get("source_id")
            source_text = source.get("text")

            if (
                isinstance(source_id, str)
                and isinstance(source_text, str)
                and source_text.strip()
            ):
                source_map[source_id] = source_text

        return source_map

    # --------------------------------------------------
    # CITATION EXTRACTION
    # --------------------------------------------------

    @staticmethod
    def _extract_cited_ids(answer: str) -> set:

        return set(
            re.findall(r"\[(S\d+)\]", answer)
        )

    # --------------------------------------------------
    # INITIAL VERIFICATION PROMPT
    # --------------------------------------------------

    @staticmethod
    def _build_verification_prompt(
        answer: str,
        source_map: Dict[str, str],
    ) -> str:

        return f"""
You are a strict academic evidence verification system.

Evaluate every meaningful factual claim in the student's answer
against the exact textbook passages cited beside it.

STUDENT ANSWER:
{answer}

AVAILABLE TEXTBOOK PASSAGES:
{json.dumps(source_map, ensure_ascii=False)}

RULES:

1. Examine each factual claim separately.

2. Use only the source IDs cited beside each claim.

3. A citation existing does not prove that a claim is supported.

4. Provide an exact word-for-word evidence quotation whenever possible.

5. Never invent or paraphrase an evidence quotation.

6. Use supported only when the source establishes the complete claim.

7. Use partially_supported when the source establishes only part.

8. Use unsupported when the cited source does not establish the claim.

9. If the quotation cannot be identified, return an empty
   evidence_quote. Do not automatically classify a claim as
   unsupported solely because the quotation is missing.

10. Do not use general knowledge.

11. Do not invent examples, definitions, statistics or facts.

12. Do not combine separate claims.

13. Pay attention to incorrect classification of concepts.

14. Ignore greetings and non-factual conversational text.

15. Never invent source IDs.

RETURN ONLY VALID JSON:

{{
    "claims": [
        {{
            "claim": "Factual claim from the answer",
            "citations": ["S1"],
            "status": "supported",
            "evidence_quote": "Exact quotation from the passage",
            "explanation": "Why the evidence supports the claim"
        }}
    ],
    "summary": "Overall verification summary"
}}

Allowed statuses:
supported
partially_supported
unsupported
"""

    # --------------------------------------------------
    # EVIDENCE RECOVERY PROMPT
    # --------------------------------------------------

    @staticmethod
    def _build_recovery_prompt(
        missing_claims: List[Dict[str, Any]],
        source_map: Dict[str, str],
    ) -> str:

        return f"""
You are an academic evidence recovery system.

Find exact supporting quotations for the claims below.

CLAIMS:
{json.dumps(missing_claims, ensure_ascii=False)}

TEXTBOOK PASSAGES:
{json.dumps(source_map, ensure_ascii=False)}

RULES:

1. Examine each claim independently.
2. Use only the cited passages supplied for that claim.
3. Copy quotations word-for-word.
4. Do not invent evidence.
5. A quotation must support the complete claim for supported status.
6. Use partially_supported for evidence supporting only part.
7. Use unsupported when evidence does not establish the claim.
8. Do not use general knowledge.
9. Pay attention to incorrect classifications.
10. Preserve the original claim_index.
11. Return an empty quotation if no evidence exists.

RETURN ONLY VALID JSON:

{{
    "recoveries": [
        {{
            "claim_index": 0,
            "status": "supported",
            "evidence_quote": "Exact quotation from the source",
            "explanation": "Why this evidence supports the claim"
        }}
    ]
}}

Allowed statuses:
supported
partially_supported
unsupported
"""

    # --------------------------------------------------
    # RECOVER MISSING EVIDENCE
    # --------------------------------------------------

    def _recover_missing_evidence(
        self,
        missing_claims: List[Dict[str, Any]],
        source_map: Dict[str, str],
    ) -> Dict[int, Dict[str, Any]]:

        if not missing_claims:
            return {}

        response = self._invoke_with_retry(
            self._build_recovery_prompt(
                missing_claims,
                source_map,
            )
        )

        result = self._extract_json(response.content)

        recoveries = result.get("recoveries")

        if not isinstance(recoveries, list):
            raise ValueError(
                "Evidence recovery must return a recoveries list."
            )

        validated = {}

        for recovery in recoveries:

            if not isinstance(recovery, dict):
                continue

            claim_index = recovery.get("claim_index")
            status = recovery.get("status")
            evidence_quote = recovery.get("evidence_quote")
            explanation = recovery.get("explanation", "")

            if (
                not isinstance(claim_index, int)
                or isinstance(claim_index, bool)
            ):
                continue

            if status not in self.VALID_STATUSES:
                continue

            if not isinstance(evidence_quote, str):
                continue

            if not isinstance(explanation, str):
                explanation = ""

            validated[claim_index] = {
                "status": status,
                "evidence_quote": evidence_quote,
                "explanation": explanation,
            }

        return validated
    
    def _invoke_with_retry(self, prompt: str, max_attempts: int = 2):
        """Retry Gemini requests once when its server returns HTTP 503."""

        for attempt in range(max_attempts):
            try:
                return self.llm.invoke(prompt)

            except Exception as exc:
                error_text = str(exc).upper()

                is_temporary_server_error = (
                    "503" in error_text
                    or "UNAVAILABLE" in error_text
                )

                if not is_temporary_server_error:
                    raise

                if attempt == max_attempts - 1:
                    raise

                print(
                    "[GEMINI RETRY] Temporary server error. "
                    "Retrying in 2 seconds..."
                )

                time.sleep(2)

        raise RuntimeError("Gemini request failed after retry attempts.")


    # --------------------------------------------------
    # MAIN VERIFICATION
    # --------------------------------------------------

    
    def verify(
        self,
        answer: str,
        sources: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Verify claims, recover missing evidence, and validate quotations."""

        if not isinstance(answer, str) or not answer.strip():
            raise AgentExecutionError("Answer cannot be empty.")

        if not isinstance(sources, list) or not sources:
            return {
                "verified": False,
                "claims": [],
                "summary": "No sources are available for verification.",
                "verification_method": "llm_recovery_with_exact_quote_validation",
                "recovered_evidence_count": 0,
            }

        source_map = self._build_source_map(sources)

        if not source_map:
            return {
                "verified": False,
                "claims": [],
                "summary": "No valid source passages are available.",
                "verification_method": "llm_recovery_with_exact_quote_validation",
                "recovered_evidence_count": 0,
            }

        cited_ids = self._extract_cited_ids(answer)

        if not cited_ids:
            return {
                "verified": False,
                "claims": [],
                "summary": "The answer contains no citations to verify.",
                "verification_method": "llm_recovery_with_exact_quote_validation",
                "recovered_evidence_count": 0,
            }

        invalid_ids = sorted(cited_ids - set(source_map))

        if invalid_ids:
            return {
                "verified": False,
                "claims": [],
                "invalid_citations": invalid_ids,
                "summary": "The answer contains citations that do not exist.",
                "verification_method": "llm_recovery_with_exact_quote_validation",
                "recovered_evidence_count": 0,
            }

        try:
            # STAGE 1: INITIAL CLAIM VERIFICATION

            response = self._invoke_with_retry(                
                self._build_verification_prompt(answer, source_map)
            )

            result = self._extract_json(response.content)

            claims = result.get("claims")
            summary = result.get("summary")

            if not isinstance(claims, list):
                raise ValueError("The claims field must be a list.")

            if not isinstance(summary, str):
                raise ValueError("The summary field must be text.")

            validated_claims = []
            missing_claims = []
            recovery_source_map = {}

            for claim_index, claim in enumerate(claims):
                if not isinstance(claim, dict):
                    raise ValueError("Each claim must be an object.")

                claim_text = claim.get("claim")
                citations = claim.get("citations")
                status = claim.get("status")
                evidence_quote = claim.get("evidence_quote")
                explanation = claim.get("explanation")

                if not isinstance(claim_text, str) or not claim_text.strip():
                    raise ValueError("A claim is missing its text.")

                if not isinstance(citations, list) or not citations:
                    raise ValueError("A claim must have at least one citation.")

                if not all(
                    isinstance(source_id, str)
                    and source_id in source_map
                    and source_id in cited_ids
                    for source_id in citations
                ):
                    raise ValueError(
                        "A claim contains an invalid or uncited source ID."
                    )

                if status not in self.VALID_STATUSES:
                    raise ValueError("A claim has an invalid verification status.")

                if not isinstance(evidence_quote, str):
                    evidence_quote = ""

                if not isinstance(explanation, str):
                    explanation = ""

                exact_evidence_found = any(
                    self._find_exact_evidence(
                        evidence_quote,
                        source_map[source_id],
                    )
                    for source_id in citations
                )

                validated_claim = {
                    "claim": claim_text,
                    "citations": citations,
                    "status": status,
                    "evidence_quote": (
                        evidence_quote if exact_evidence_found else ""
                    ),
                    "exact_evidence_found": exact_evidence_found,
                    "explanation": explanation,
                    "evidence_recovered": False,
                }

                # Claims already supported by an exact quotation
                # do not need another Gemini call.
                if exact_evidence_found:
                    pass

                # Claims Gemini considers potentially supported
                # but cannot prove with an exact quotation need recovery.
                elif status in {"supported", "partially_supported"}:
                    validated_claim["status"] = "unverified"
                    validated_claim["explanation"] = (
                        "Exact evidence was not initially identified. "
                        "Evidence recovery is required."
                    )

                    missing_claims.append({
                        "claim_index": claim_index,
                        "claim": claim_text,
                        "citations": citations,
                        "original_status": status,
                    })

                    for source_id in citations:
                        recovery_source_map[source_id] = source_map[source_id]

                else:
                    validated_claim["status"] = "unsupported"
                    validated_claim["explanation"] = (
                        explanation or
                        "The cited passage does not establish this claim."
                    )

                validated_claims.append(validated_claim)

            # STAGE 2: RECOVER MISSING EVIDENCE

            if missing_claims:
                try:
                    recoveries = self._recover_missing_evidence(
                        missing_claims,
                        recovery_source_map,
                    )

                    for claim_index, recovery in recoveries.items():
                        if not isinstance(claim_index, int):
                            continue

                        if not 0 <= claim_index < len(claims):
                            continue

                        original_claim = claims[claim_index]
                        original_citations = original_claim["citations"]

                        recovered_status = recovery["status"]
                        recovered_quote = recovery["evidence_quote"]
                        recovered_explanation = recovery["explanation"]

                        target_claim = validated_claims[claim_index]

                        # An unsupported recovery does not require
                        # a supporting quotation.
                        if recovered_status == "unsupported":
                            target_claim["status"] = "unsupported"
                            target_claim["explanation"] = (
                                recovered_explanation or
                                "Evidence recovery found no support "
                                "for this claim."
                            )
                            continue

                        # Accept recovered evidence only if the exact
                        # quotation exists in one of this claim's sources.
                        exact_recovered_evidence = any(
                            self._find_exact_evidence(
                                recovered_quote,
                                source_map[source_id],
                            )
                            for source_id in original_citations
                        )

                        if exact_recovered_evidence:
                            target_claim["status"] = recovered_status
                            target_claim["evidence_quote"] = recovered_quote
                            target_claim["exact_evidence_found"] = True
                            target_claim["evidence_recovered"] = True
                            target_claim["explanation"] = (
                                recovered_explanation or
                                "Supporting evidence was recovered "
                                "and matched the cited source."
                            )

                except Exception as recovery_error:
                    # Recovery is an additional verification stage.
                    # If it fails, preserve the original verification
                    # results and leave unresolved claims unverified.
                    print("\n[EVIDENCE RECOVERY WARNING]")
                    print(
                        f"Error type: {type(recovery_error).__name__}"
                    )
                    print(f"Error details: {recovery_error}")

            # STAGE 3: FINAL COUNTS

            supported_count = sum(
                claim["status"] == "supported"
                for claim in validated_claims
            )

            partial_count = sum(
                claim["status"] == "partially_supported"
                for claim in validated_claims
            )

            unsupported_count = sum(
                claim["status"] == "unsupported"
                for claim in validated_claims
            )

            unverified_count = sum(
                claim["status"] == "unverified"
                for claim in validated_claims
            )

            recovered_count = sum(
                claim["evidence_recovered"]
                for claim in validated_claims
            )

            final_summary = (
                f"Verification completed for {len(validated_claims)} "
                f"claims: {supported_count} supported, "
                f"{partial_count} partially supported, "
                f"{unsupported_count} unsupported, and "
                f"{unverified_count} unverified."
            )

            return {
                "verified": True,
                "claims": validated_claims,
                "summary": final_summary,
                "verification_method": (
                    "llm_recovery_with_exact_quote_validation"
                ),
                "recovered_evidence_count": recovered_count,
                "supported_count": supported_count,
                "partially_supported_count": partial_count,
                "unsupported_count": unsupported_count,
                "unverified_count": unverified_count,
            }

        except AgentExecutionError:
            raise

        except Exception as exc:
            print("\n[VERIFICATION ERROR]")
            print(f"Error type: {type(exc).__name__}")
            print(f"Error details: {exc}")
            traceback.print_exc()

            raise AgentExecutionError(
                "Citation evidence verification failed."
            ) from exc

