from fastapi import APIRouter
from pydantic import BaseModel, Field
from ..chat import ask_detective, get_history

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


@router.post("/api/cases/{case_id}/chat")
def chat(case_id: int, payload: ChatRequest):
    answer = ask_detective(case_id, payload.message)
    return {"answer": answer}


@router.get("/api/cases/{case_id}/chat")
def history(case_id: int):
    return get_history(case_id)
