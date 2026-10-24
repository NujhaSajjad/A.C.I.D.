from fastapi import APIRouter, HTTPException, Query
from ..analysis import get_latest_analysis, list_versions, diff_versions

router = APIRouter(tags=["analysis"])


@router.get("/api/cases/{case_id}/analysis")
def latest_analysis(case_id: int):
    result = get_latest_analysis(case_id)
    if not result:
        raise HTTPException(404, "no investigation has been run for this case yet")
    return result


@router.get("/api/cases/{case_id}/versions")
def versions(case_id: int):
    return list_versions(case_id)


@router.get("/api/cases/{case_id}/versions/diff")
def version_diff(
    case_id: int,
    from_v: int = Query(..., description="version number to diff from"),
    to_v: int = Query(..., description="version number to diff to"),
):
    return diff_versions(case_id, from_v, to_v)
