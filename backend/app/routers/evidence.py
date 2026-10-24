from fastapi import APIRouter, HTTPException
from ..db import get_connection
from ..schemas import EvidenceCreate, EvidenceOut

router = APIRouter(tags=["evidence"])


@router.post("/api/cases/{case_id}/evidence", response_model=EvidenceOut, status_code=201)
def add_evidence(case_id: int, payload: EvidenceCreate):
    conn = get_connection()
    try:
        case = conn.execute("SELECT id FROM cases WHERE id = ?", (case_id,)).fetchone()
        if not case:
            raise HTTPException(404, "case not found")
        cur = conn.execute(
            "INSERT INTO evidence (case_id, type, source_label, text) VALUES (?, ?, ?, ?)",
            (case_id, payload.type, payload.source_label, payload.text),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM evidence WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.get("/api/cases/{case_id}/evidence", response_model=list[EvidenceOut])
def list_evidence(case_id: int):
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT * FROM evidence WHERE case_id = ? ORDER BY id", (case_id,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.delete("/api/evidence/{evidence_id}", status_code=204)
def delete_evidence(evidence_id: int):
    conn = get_connection()
    try:
        cur = conn.execute("DELETE FROM evidence WHERE id = ?", (evidence_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(404, "evidence not found")
    finally:
        conn.close()
