import json
from .db import get_connection


def _parse_ids(raw) -> list[int]:
    try:
        return json.loads(raw or "[]")
    except (json.JSONDecodeError, TypeError):
        return []


def _get_latest_version_id(conn, case_id: int):
    row = conn.execute(
        "SELECT id FROM investigation_versions WHERE case_id = ? ORDER BY version_number DESC LIMIT 1",
        (case_id,),
    ).fetchone()
    return row["id"] if row else None


def get_latest_analysis(case_id: int) -> dict | None:
    conn = get_connection()
    try:
        vid = _get_latest_version_id(conn, case_id)
        if not vid:
            return None
        return _load_analysis(conn, vid)
    finally:
        conn.close()


def _load_analysis(conn, version_id: int) -> dict:
    v = conn.execute("SELECT * FROM investigation_versions WHERE id = ?", (version_id,)).fetchone()
    facts = [dict(r) for r in conn.execute(
        "SELECT * FROM facts WHERE version_id = ? ORDER BY id", (version_id,))]
    timeline = [dict(r) for r in conn.execute(
        "SELECT * FROM timeline_events WHERE version_id = ? ORDER BY sort_order", (version_id,))]
    contradictions = [dict(r) for r in conn.execute(
        "SELECT * FROM contradictions WHERE version_id = ? ORDER BY id", (version_id,))]
    hypotheses = [dict(r) for r in conn.execute(
        "SELECT * FROM hypotheses WHERE version_id = ? ORDER BY id", (version_id,))]
    unknowns = [dict(r) for r in conn.execute(
        "SELECT * FROM unknowns WHERE version_id = ? ORDER BY id", (version_id,))]

    for f in facts:
        f["source_evidence_ids"] = _parse_ids(f["source_evidence_ids"])
    for t in timeline:
        t["source_evidence_ids"] = _parse_ids(t["source_evidence_ids"])
    for h in hypotheses:
        h["supporting_evidence_ids"] = _parse_ids(h["supporting_evidence_ids"])
        h["contradicting_evidence_ids"] = _parse_ids(h["contradicting_evidence_ids"])

    return {
        "version_id": v["id"],
        "version_number": v["version_number"],
        "trigger": v["trigger"],
        "summary": v["summary"],
        "created_at": v["created_at"],
        "facts": facts,
        "timeline_events": timeline,
        "contradictions": contradictions,
        "hypotheses": hypotheses,
        "unknowns": unknowns,
    }


def list_versions(case_id: int) -> list[dict]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM investigation_versions WHERE case_id = ? ORDER BY version_number",
            (case_id,),
        ).fetchall()
        versions = []
        for r in rows:
            d = dict(r)
            d["counts"] = {
                "facts": conn.execute("SELECT COUNT(*) n FROM facts WHERE version_id=?", (d["id"],)).fetchone()["n"],
                "timeline_events": conn.execute("SELECT COUNT(*) n FROM timeline_events WHERE version_id=?", (d["id"],)).fetchone()["n"],
                "contradictions": conn.execute("SELECT COUNT(*) n FROM contradictions WHERE version_id=?", (d["id"],)).fetchone()["n"],
                "hypotheses": conn.execute("SELECT COUNT(*) n FROM hypotheses WHERE version_id=?", (d["id"],)).fetchone()["n"],
                "unknowns": conn.execute("SELECT COUNT(*) n FROM unknowns WHERE version_id=?", (d["id"],)).fetchone()["n"],
            }
            versions.append(d)
        return versions
    finally:
        conn.close()


def _index_by(items, key):
    return {item[key]: item for item in items}


def diff_versions(case_id: int, from_v: int, to_v: int) -> dict:
    """Compare two versions by matching items on their text key."""
    conn = get_connection()
    try:
        a = _load_analysis(conn, from_v)
        b = _load_analysis(conn, to_v)
        return {
            "from_version": a["version_number"],
            "to_version": b["version_number"],
            "summary_changed": a["summary"] != b["summary"],
            "facts": _diff_items(a["facts"], b["facts"], "statement", ["status"]),
            "timeline_events": _diff_items(a["timeline_events"], b["timeline_events"], "event_description", []),
            "contradictions": _diff_items(a["contradictions"], b["contradictions"], "description", ["severity"]),
            "hypotheses": _diff_items(a["hypotheses"], b["hypotheses"], "statement", ["status", "confidence"]),
            "unknowns": _diff_items(a["unknowns"], b["unknowns"], "question", []),
        }
    finally:
        conn.close()


def _diff_items(a_items, b_items, key, fields):
    a = _index_by(a_items, key)
    b = _index_by(b_items, key)
    added, removed, changed = [], [], []
    for k, item in b.items():
        if k not in a:
            added.append(item)
        else:
            diffs = {f: {"from": a[k].get(f), "to": item.get(f)} for f in fields if a[k].get(f) != item.get(f)}
            if diffs:
                changed.append({"item": item, "changes": diffs})
    for k, item in a.items():
        if k not in b:
            removed.append(item)
    return {"added": added, "removed": removed, "changed": changed}
