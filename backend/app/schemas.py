from pydantic import BaseModel, Field
from typing import Literal, Optional

# ---- Cases ----

class CaseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""

class CaseOut(BaseModel):
    id: int
    title: str
    description: str
    created_at: str

# ---- Evidence ----

EVIDENCE_TYPES = {"witness", "chat", "email", "log", "cctv", "document", "timestamp"}

class EvidenceCreate(BaseModel):
    type: str
    text: str = Field(min_length=1)
    source_label: str = ""

    def model_post_init(self, __context):
        if self.type not in EVIDENCE_TYPES:
            raise ValueError(f"type must be one of {sorted(EVIDENCE_TYPES)}")

class EvidenceOut(BaseModel):
    id: int
    case_id: int
    type: str
    source_label: str
    text: str
    created_at: str

# ---- Structured analysis output (what the LLM returns) ----

class FactOut(BaseModel):
    statement: str
    status: Literal["verified", "claim", "disputed"] = "claim"
    source_evidence_ids: list[int] = []

class TimelineEventOut(BaseModel):
    timestamp_label: str
    event_description: str
    source_evidence_ids: list[int] = []

class ContradictionOut(BaseModel):
    evidence_a_id: int
    evidence_b_id: int
    description: str
    severity: Literal["low", "medium", "high"] = "medium"

class HypothesisOut(BaseModel):
    statement: str
    status: Literal["supported", "contradicted", "uncertain"] = "uncertain"
    supporting_evidence_ids: list[int] = []
    contradicting_evidence_ids: list[int] = []
    confidence: Literal["low", "medium", "high"] = "medium"

class UnknownOut(BaseModel):
    question: str
    why_it_matters: str = ""
    missing_evidence_needed: str = ""

class AnalysisOutput(BaseModel):
    summary: str
    facts: list[FactOut] = []
    timeline_events: list[TimelineEventOut] = []
    contradictions: list[ContradictionOut] = []
    hypotheses: list[HypothesisOut] = []
    unknowns: list[UnknownOut] = []
