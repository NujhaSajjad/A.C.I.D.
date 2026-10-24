import json
from fastapi import HTTPException
from .db import get_connection
from .llm import generate_json
from .schemas import AnalysisOutput

SYSTEM_PROMPT = """You are the DEDUCE investigation engine. You analyze evidence in an investigation and produce a structured, evidence-grounded analysis.

HARD RULES — violating these makes the analysis useless:
1. FACTS: Mark something "verified" ONLY when it is directly and unambiguously supported by the evidence. If a fact rests on a single uncorroborated source, mark it "claim". If evidence conflicts about it, mark it "disputed".
2. NEVER declare anyone guilty, responsible, or definitively the culprit. You weigh evidence; you do not convict. Hypotheses are possibilities, not verdicts.
3. EVERY fact, timeline event, and hypothesis MUST cite the evidence IDs it is based on, using only the IDs provided in the evidence list. Do not invent IDs.
4. CONTRADICTIONS: Identify direct conflicts between two specific pieces of evidence (e.g. a statement vs. a log). Cite both evidence IDs.
5. HYPOTHESES: Propose explanations consistent with the evidence. Mark each as supported / contradicted / uncertain, list the evidence supporting AND contradicting it, and assign a confidence (low/medium/high).
6. UNKNOWNS: List open questions the evidence cannot answer, why each matters, and what specific evidence would resolve it.
7. Be concise. No filler, no restating the evidence. If the evidence is thin, say so via unknowns rather than inventing detail.
8. If there is very little evidence, produce few facts and many unknowns. It is better to admit uncertainty than to fabricate certainty."""


def _format_evidence(evidence_rows) -> str:
    lines = []
    for e in evidence_rows:
        source = f" | SOURCE: {e['source_label']}" if e["source_label"] else ""
        lines.append(f"[ID {e['id']}] TYPE: {e['type']}{source} | TEXT: {e['text']}")
    return "\n".join(lines)


def _filter_ids(ids, valid_ids: set) -> list[int]:
    return [i for i in ids if i in valid_ids]


def run_investigation(case_id: int) -> dict:
    conn = get_connection()
    try:
        case = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if not case:
            raise HTTPException(404, "case not found")

        evidence = conn.execute(
            "SELECT * FROM evidence WHERE case_id = ? ORDER BY id", (case_id,)
        ).fetchall()
        if not evidence:
            raise HTTPException(400, "no evidence to analyze — add evidence first")

        valid_ids = {e["id"] for e in evidence}
        prior = conn.execute(
            "SELECT COUNT(*) AS n FROM investigation_versions WHERE case_id = ?", (case_id,)
        ).fetchone()["n"]
        trigger = "initial" if prior == 0 else "new_evidence"

        user_prompt = (
            f"CASE: {case['title']}\n"
            f"DESCRIPTION: {case['description'] or '(none)'}\n\n"
            f"EVIDENCE:\n{_format_evidence(evidence)}\n\n"
            "Produce the analysis as JSON matching the schema."
        )

        try:
            analysis = generate_json(user_prompt, AnalysisOutput)
        except Exception as e:
            msg = str(e)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower():
                raise HTTPException(
                    429,
                    "All LLM providers are rate-limited / exhausted. "
                    "Wait for quotas to reset, or add keys for more providers in .env.",
                )
            # One retry in case the LLM returned an out-of-enum value.
            try:
                analysis = generate_json(user_prompt, AnalysisOutput)
            except Exception as e:
                raise HTTPException(502, f"LLM analysis failed: {e}")

        # --- persist as a new version ---
        cur = conn.execute(
            "INSERT INTO investigation_versions (case_id, version_number, trigger, summary) VALUES (?, ?, ?, ?)",
            (case_id, prior + 1, trigger, analysis.summary),
        )
        version_id = cur.lastrowid

        for f in analysis.facts:
            conn.execute(
                "INSERT INTO facts (version_id, statement, status, source_evidence_ids) VALUES (?, ?, ?, ?)",
                (version_id, f.statement, f.status, json.dumps(_filter_ids(f.source_evidence_ids, valid_ids))),
            )

        for i, t in enumerate(analysis.timeline_events):
            conn.execute(
                "INSERT INTO timeline_events (version_id, timestamp_label, event_description, source_evidence_ids, sort_order) VALUES (?, ?, ?, ?, ?)",
                (version_id, t.timestamp_label, t.event_description,
                 json.dumps(_filter_ids(t.source_evidence_ids, valid_ids)), i),
            )

        for c in analysis.contradictions:
            if c.evidence_a_id in valid_ids and c.evidence_b_id in valid_ids:
                conn.execute(
                    "INSERT INTO contradictions (version_id, evidence_a_id, evidence_b_id, description, severity) VALUES (?, ?, ?, ?, ?)",
                    (version_id, c.evidence_a_id, c.evidence_b_id, c.description, c.severity),
                )

        for h in analysis.hypotheses:
            conn.execute(
                "INSERT INTO hypotheses (version_id, statement, status, supporting_evidence_ids, contradicting_evidence_ids, confidence) VALUES (?, ?, ?, ?, ?, ?)",
                (version_id, h.statement, h.status,
                 json.dumps(_filter_ids(h.supporting_evidence_ids, valid_ids)),
                 json.dumps(_filter_ids(h.contradicting_evidence_ids, valid_ids)),
                 h.confidence),
            )

        for u in analysis.unknowns:
            conn.execute(
                "INSERT INTO unknowns (version_id, question, why_it_matters, missing_evidence_needed) VALUES (?, ?, ?, ?)",
                (version_id, u.question, u.why_it_matters, u.missing_evidence_needed),
            )

        conn.commit()

        return {
            "version_id": version_id,
            "version_number": prior + 1,
            "trigger": trigger,
            "summary": analysis.summary,
            "facts": [f.model_dump() for f in analysis.facts],
            "timeline_events": [t.model_dump() for t in analysis.timeline_events],
            "contradictions": [c.model_dump() for c in analysis.contradictions],
            "hypotheses": [h.model_dump() for h in analysis.hypotheses],
            "unknowns": [u.model_dump() for u in analysis.unknowns],
        }
    finally:
        conn.close()
