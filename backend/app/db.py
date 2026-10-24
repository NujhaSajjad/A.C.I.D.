import sqlite3
from pathlib import Path
from .config import DATABASE_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    type TEXT NOT NULL,               -- witness | chat | email | log | cctv | document | timestamp
    source_label TEXT DEFAULT '',     -- e.g. "Sara (witness)", "Email from John"
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS investigation_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    trigger TEXT NOT NULL,            -- initial | new_evidence
    summary TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS facts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL REFERENCES investigation_versions(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    status TEXT NOT NULL,             -- verified | claim | disputed
    source_evidence_ids TEXT DEFAULT '[]',  -- JSON array of evidence ids
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timeline_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL REFERENCES investigation_versions(id) ON DELETE CASCADE,
    timestamp_label TEXT NOT NULL,    -- e.g. "2024-03-12 14:30" or "Day 1, morning"
    event_description TEXT NOT NULL,
    source_evidence_ids TEXT DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contradictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL REFERENCES investigation_versions(id) ON DELETE CASCADE,
    evidence_a_id INTEGER REFERENCES evidence(id) ON DELETE SET NULL,
    evidence_b_id INTEGER REFERENCES evidence(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    severity TEXT DEFAULT 'medium',    -- low | medium | high
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hypotheses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL REFERENCES investigation_versions(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    status TEXT NOT NULL,             -- supported | contradicted | uncertain
    supporting_evidence_ids TEXT DEFAULT '[]',
    contradicting_evidence_ids TEXT DEFAULT '[]',
    confidence TEXT DEFAULT 'medium',  -- low | medium | high
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS unknowns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_id INTEGER NOT NULL REFERENCES investigation_versions(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    why_it_matters TEXT DEFAULT '',
    missing_evidence_needed TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    role TEXT NOT NULL,               -- user | detective
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_versions_case ON investigation_versions(case_id);
CREATE INDEX IF NOT EXISTS idx_facts_version ON facts(version_id);
CREATE INDEX IF NOT EXISTS idx_timeline_version ON timeline_events(version_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_version ON contradictions(version_id);
CREATE INDEX IF NOT EXISTS idx_hypotheses_version ON hypotheses(version_id);
CREATE INDEX IF NOT EXISTS idx_unknowns_version ON unknowns(version_id);
CREATE INDEX IF NOT EXISTS idx_chat_case ON chat_messages(case_id);
"""


def get_connection() -> sqlite3.Connection:
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
