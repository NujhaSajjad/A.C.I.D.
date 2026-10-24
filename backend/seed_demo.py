"""Seed a demo case so the product works out of the box.
Run:  .venv\\Scripts\\python.exe seed_demo.py
"""
from app.db import get_connection, init_db

DEMO_TITLE = "The Stolen Prototype"

EVIDENCE = [
    ("witness", "Sara (coworker)",
     "I saw John leave the office around 6pm on Friday. He seemed in a hurry and was carrying a large bag."),
    ("log", "Badge access system",
     "John's keycard was used to badge BACK INTO the office at 8:14pm on Friday."),
    ("email", "John to manager",
     "John emailed his manager at 5:40pm Friday saying he would be working from home that evening."),
    ("cctv", "Lobby camera",
     "CCTV shows a person in a dark hoodie exiting the building at 8:47pm Friday. Face not clearly visible."),
    ("document", "IT inventory log",
     "Prototype device serial #P-102 was last checked out to John. It has not been returned."),
    ("chat", "Team chat (Slack)",
     "John asked in the team channel Thursday: 'How secure is the prototype lab after hours?'"),
]


def seed():
    init_db()
    conn = get_connection()
    try:
        existing = conn.execute(
            "SELECT id FROM cases WHERE title = ?", (DEMO_TITLE,)
        ).fetchone()
        if existing:
            print(f"Demo case already exists (id={existing['id']}). Skipping.")
            return existing["id"]

        cur = conn.execute(
            "INSERT INTO cases (title, description) VALUES (?, ?)",
            (DEMO_TITLE,
             "A company prototype device went missing from the office after hours on Friday. "
             "Investigate who took it and how."),
        )
        case_id = cur.lastrowid

        for etype, source, text in EVIDENCE:
            conn.execute(
                "INSERT INTO evidence (case_id, type, source_label, text) VALUES (?, ?, ?, ?)",
                (case_id, etype, source, text),
            )
        conn.commit()
        print(f"Created demo case (id={case_id}) with {len(EVIDENCE)} evidence items.")
        return case_id
    finally:
        conn.close()


if __name__ == "__main__":
    seed()
    print("Open http://localhost:8000 and select 'The Stolen Prototype' to begin.")
