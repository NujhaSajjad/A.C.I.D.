from fastapi import APIRouter
from ..analyzer import run_investigation

router = APIRouter(tags=["investigation"])


@router.post("/api/cases/{case_id}/investigate")
def investigate(case_id: int):
    """Run (or re-run) the AI investigation and save it as a new version."""
    return run_investigation(case_id)
