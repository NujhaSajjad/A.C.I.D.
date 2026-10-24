from fastapi import HTTPException
from .db import get_connection
from .llm import generate_text
from .analysis import get_latest_analysis

DETECTIVE_SYSTEM_PROMPT = """You are the DEDUCE detective — an AI investigation assistant. The user is investigating a case and will ask you questions.

RULES:
1. Answer using ONLY the evidence and analysis provided in the context. Do not use outside knowledge.
2. When you reference a fact, cite its evidence ID like [ev 3]. Cite the specific evidence you rely on.
3. If the evidence does not contain the answer, say clearly that it is unknown / not in the evidence — do NOT speculate or invent.
4. Never declare anyone guilty or definitively responsible. You weigh evidence; you do not convict.
5. Distinguish facts (verified), claims (uncorroborated), hypotheses (uncertain), and unknowns.
6. Be concise and direct. Lead with the answer, then the reasoning and evidence.
7. If asked what to investigate next, base it on the unknowns and missing evidence in the analysis."""


def _format_evidence(evidence_rows) -> str:
    lines = []
    for e in evidence_rows:
        source = f" | SOURCE: {e['source_label']}" if e["source_label"] else ""
        lines.append(f"[ID {e['id']}] TYPE: {e['type']}{source} | TEXT: {e['text']}")
    return "\n".join(lines)


def _format_analysis(analysis: dict) -> str:
    if not analysis:
        return "(No investigation has been run yet.)"
    parts = [f"SUMMARY: {analysis['summary']}", ""]
    parts.append("FACTS:")
    for f in analysis["facts"]:
        parts.append(f"  [{f['status']}] {f['statement']} (ev {f['source_evidence_ids']})")
    parts.append("\nTIMELINE:")
    for t in analysis["timeline_events"]:
        parts.append(f"  {t['timestamp_label']}: {t['event_description']}")
    parts.append("\nCONTRADICTIONS:")
    for c in analysis["contradictions"]:
        parts.append(f"  [{c['severity']}] {c['description']} (ev {c['evidence_a_id']} vs {c['evidence_b_id']})")
    parts.append("\nHYPOTHESES:")
    for h in analysis["hypotheses"]:
        parts.append(f"  [{h['status']}|{h['confidence']}] {h['statement']}")
    parts.append("\nUNKNOWNS:")
    for u in analysis["unknowns"]:
        parts.append(f"  ? {u['question']}")
    return "\n".join(parts)


def ask_detective(case_id: int, user_message: str) -> str:
    conn = get_connection()
    try:
        case = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if not case:
            raise HTTPException(404, "case not found")

        evidence = conn.execute(
            "SELECT * FROM evidence WHERE case_id = ? ORDER BY id", (case_id,)
        ).fetchall()
        analysis = get_latest_analysis(case_id)
        history = conn.execute(
            "SELECT role, content FROM chat_messages WHERE case_id = ? ORDER BY id", (case_id,)
        ).fetchall()

        evidence_block = _format_evidence(evidence) if evidence else "(No evidence yet.)"
        analysis_block = _format_analysis(analysis)

        history_block = "\n".join(f"{'USER' if h['role']=='user' else 'DETECTIVE'}: {h['content']}" for h in history) or "(no prior messages)"

        context = (
            f"CASE: {case['title']}\n"
            f"DESCRIPTION: {case['description'] or '(none)'}\n\n"
            f"EVIDENCE:\n{evidence_block}\n\n"
            f"LATEST ANALYSIS:\n{analysis_block}\n\n"
            f"CONVERSATION HISTORY:\n{history_block}\n\n"
            f"USER QUESTION: {user_message}"
        )

        try:
            answer = generate_text(DETECTIVE_SYSTEM_PROMPT, context)
        except Exception as e:
            raise HTTPException(502, f"detective failed to respond: {e}")

        conn.execute(
            "INSERT INTO chat_messages (case_id, role, content) VALUES (?, 'user', ?)",
            (case_id, user_message),
        )
        conn.execute(
            "INSERT INTO chat_messages (case_id, role, content) VALUES (?, 'detective', ?)",
            (case_id, answer),
        )
        conn.commit()
        return answer
    finally:
        conn.close()


def get_history(case_id: int) -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, role, content, created_at FROM chat_messages WHERE case_id = ? ORDER BY id",
            (case_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
