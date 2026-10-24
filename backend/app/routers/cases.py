from fastapi import APIRouter, HTTPException
from ..db import get_connection
from ..schemas import CaseCreate, CaseOut

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.post("", response_model=CaseOut, status_code=201)
def create_case(payload: CaseCreate):
    conn = get_connection()
    try:
        cur = conn.execute(
            "INSERT INTO cases (title, description) VALUES (?, ?)",
            (payload.title, payload.description),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (cur.lastrowid,)).fetchone()
        return dict(row)
    finally:
        conn.close()


@router.get("", response_model=list[CaseOut])
def list_cases():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM cases ORDER BY id DESC").fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


@router.get("/{case_id}", response_model=CaseOut)
def get_case(case_id: int):
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        if not row:
            raise HTTPException(404, "case not found")
        return dict(row)
    finally:
        conn.close()


@router.delete("/{case_id}", status_code=204)
def delete_case(case_id: int):
    conn = get_connection()
    try:
        cur = conn.execute("DELETE FROM cases WHERE id = ?", (case_id,))
        conn.commit()
        if cur.rowcount == 0:
            raise HTTPException(404, "case not found")
    finally:
        conn.close()
