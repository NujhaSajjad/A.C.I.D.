<<<<<<< HEAD
# DEDUCE — AI Investigation Engine

DEDUCE is an AI detective that investigates fictional cases using **evidence**, not roleplay. You feed it witness statements, chat logs, emails, access logs, CCTV descriptions, and documents — and it produces a structured, evidence-grounded investigation: verified facts, a timeline, contradictions, hypotheses, and honest unknowns.

The one rule that makes it a product instead of a chatbot: **it distinguishes facts from claims from hypotheses from unknowns, cites evidence for everything, and never declares anyone guilty without proof.**

---

## Table of Contents

- [How It Works (the core loop)](#how-it-works-the-core-loop)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [The LLM Layer & Failover](#the-llm-layer--failover)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Using the App](#using-the-app)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Tech Stack](#tech-stack)

---

## How It Works (the core loop)

```
Create case → Add evidence → AI investigates → See timeline/facts/contradictions/hypotheses
     ↑                                                                    ↓
     └────────── Add new evidence → Re-investigate → NEW VERSION ←────────┘
```

1. **Create a case** — give it a title and description.
2. **Add evidence** — each piece has a type (witness / chat / email / log / cctv / document / timestamp), an optional source label, and free text.
3. **Investigate** — the backend sends all evidence to the LLM with a strict JSON schema and a system prompt enforcing epistemic discipline. The result is saved as a **version**.
4. **Read the analysis** — facts (verified/claim/disputed), a chronological timeline, contradictions between evidence, hypotheses (supported/contradicted/uncertain + confidence), and unknowns (what's missing).
5. **Chat with the detective** — ask "Why is Sara suspicious?" or "What should I investigate next?" The detective answers only from the case's evidence and latest analysis, citing evidence IDs.
6. **Add new evidence → re-investigate** — a new version is created. The **Versions** tab lets you diff any two versions to see how conclusions evolved.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (frontend/)                                    │
│  index.html + style.css + app.js  (vanilla JS, no build) │
└──────────────────────────┬──────────────────────────────┘
                           │  REST / JSON
┌──────────────────────────▼──────────────────────────────┐
│  FastAPI backend (backend/app/)                         │
│                                                         │
│  routers/        cases · evidence · investigation       │
│                  analysis · chat                        │
│                                                         │
│  Service layer                                          │
│    analyzer.py   → runs the investigation, saves version│
│    analysis.py   → read latest + diff versions          │
│    chat.py       → grounded detective Q&A               │
│    llm.py        → multi-provider LLM client + failover │
│    db.py         → SQLite connection + schema           │
│    schemas.py    → Pydantic models (structured output)  │
│    config.py     → env config                           │
└──────────────────────────┬──────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
          Gemini        Groq        DeepSeek
        (google-genai) (OpenAI-compat REST)
```

**Key design principle:** the backend owns the data; the LLM only interprets it. The LLM never sees a "case" as a blob — it receives evidence with IDs and must cite those IDs back. The backend validates every cited ID against real evidence before saving.

---

## Project Structure

```
detectiveAI/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app: routers, static mount, startup
│   │   ├── config.py            # loads .env (keys, model, DB path, provider order)
│   │   ├── db.py                # SQLite schema + get_connection()/init_db()
│   │   ├── llm.py               # multi-provider LLM client with failover
│   │   ├── analyzer.py          # builds prompt, runs investigation, saves version
│   │   ├── analysis.py          # read latest analysis, list versions, diff
│   │   ├── chat.py              # builds grounded context, detective Q&A
│   │   ├── schemas.py           # Pydantic models for structured LLM output
│   │   └── routers/
│   │       ├── cases.py         # case CRUD
│   │       ├── evidence.py      # evidence CRUD
│   │       ├── investigation.py # POST /investigate
│   │       ├── analysis.py      # GET analysis, versions, diff
│   │       └── chat.py          # POST/GET chat
│   ├── data/                    # SQLite DB (created at runtime)
│   ├── .env                     # API keys + config (git-ignored)
│   ├── requirements.txt
│   └── seed_demo.py             # loads "The Stolen Prototype" demo case
├── frontend/
│   ├── index.html               # single-page app shell
│   ├── style.css                # detective theme
│   └── app.js                   # all UI logic (vanilla JS + fetch)
├── .venv/                       # Python virtual environment
└── .gitignore
```

---

## Data Model

All data lives in SQLite (`backend/data/deduce.db`). Every analysis artifact is tied to a **version**, which is what makes the "how conclusions evolved" feature possible.

| Table | Purpose |
|---|---|
| `cases` | case title + description |
| `evidence` | type, source label, text — belongs to a case |
| `investigation_versions` | one row per analysis run; `trigger` = `initial` or `new_evidence` |
| `facts` | statement + `status` (verified/claim/disputed) + cited evidence IDs |
| `timeline_events` | timestamped events, sortable, with cited evidence IDs |
| `contradictions` | two evidence IDs that conflict + description + severity |
| `hypotheses` | statement + status (supported/contradicted/uncertain) + supporting/contradicting evidence IDs + confidence |
| `unknowns` | open question + why it matters + what evidence would resolve it |
| `chat_messages` | detective conversation history per case |

**Versioning in one sentence:** every time you hit Investigate, a new `investigation_versions` row is created and all facts/timeline/contradictions/hypotheses/unknowns from that run reference it — so you can always compare v1 vs v2 and see exactly what changed.

---

## The LLM Layer & Failover

`backend/app/llm.py` is a **multi-provider client with automatic failover**. It exposes two functions — `generate_json()` (structured analysis) and `generate_text()` (detective chat) — and tries providers in order:

```
Gemini  →  Groq  →  DeepSeek
```

- **Gemini** uses the official `google-genai` SDK with a JSON schema (`response_schema`).
- **Groq** and **DeepSeek** use their OpenAI-compatible `/chat/completions` REST endpoints via `httpx`, with `response_format: {"type": "json_object"}`.
- If a provider fails (quota exhausted, rate limit, auth error, server error), it logs a warning and **falls through to the next**. If all fail, it raises a clear error.
- **Enum coercion** is shared across all providers: the JSON schema sent to the model includes enums (e.g. `verified|claim|disputed`), and if the LLM returns an out-of-enum value, it's reset to the default before validation. This keeps structured output reliable regardless of which provider answers.

**Why this matters for a hackathon:** free-tier quotas are tiny (Gemini free = 20 req/day). With three providers, you can keep investigating even when one runs out.

---

## API Reference

Base URL: `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | health check |
| POST | `/api/cases` | create case `{title, description}` |
| GET | `/api/cases` | list cases |
| GET | `/api/cases/{id}` | get one case |
| DELETE | `/api/cases/{id}` | delete case (cascades) |
| POST | `/api/cases/{id}/evidence` | add evidence `{type, source_label, text}` |
| GET | `/api/cases/{id}/evidence` | list evidence |
| DELETE | `/api/evidence/{id}` | delete evidence |
| POST | `/api/cases/{id}/investigate` | run/re-run investigation → new version |
| GET | `/api/cases/{id}/analysis` | latest analysis (facts/timeline/contradictions/hypotheses/unknowns) |
| GET | `/api/cases/{id}/versions` | version history with counts |
| GET | `/api/cases/{id}/versions/diff?from_v=1&to_v=2` | diff two versions |
| POST | `/api/cases/{id}/chat` | ask detective `{message}` |
| GET | `/api/cases/{id}/chat` | conversation history |

---

## Getting Started

### Prerequisites
- Python 3.11+
- At least one API key: Gemini, Groq, or DeepSeek

### 1. Create a virtual environment & install

```powershell
cd C:\Users\hp\Desktop\detectiveAI
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

### 2. Configure API keys

Open `backend\.env` and add your keys:

```env
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash

# Fallback providers (optional but recommended)
LLM_PROVIDERS=gemini,groq,deepseek
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile
DEEPSEEK_API_KEY=your-deepseek-key
DEEPSEEK_MODEL=deepseek-chat
```

Leave a key blank to disable that provider — unconfigured providers are skipped automatically.

### 3. Start the server

```powershell
.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --app-dir backend
```

### 4. Seed the demo (optional)

In a second terminal:

```powershell
.venv\Scripts\python.exe backend\seed_demo.py
```

### 5. Open the app

Go to **http://localhost:8000**

---

## Using the App

1. **Create a case** (top-right) or select the seeded demo.
2. **Add evidence** in the Evidence tab — pick a type, add a source, paste the text.
3. Click **⚡ Investigate** — the AI analyzes everything and saves version 1.
4. Browse the **Analysis** tab: facts (color-coded verified/claim/disputed), timeline, contradictions, hypotheses, unknowns.
5. Switch to the **Detective** tab and ask things like:
   - *"Why is John suspicious?"*
   - *"What evidence contradicts his statement?"*
   - *"What should I investigate next?"*
6. **Add new evidence → Investigate again** — a new version is created.
7. Open the **Versions** tab, click two versions, and see a **diff** of what changed (e.g. a hypothesis going from `uncertain` → `supported`).

---

## Configuration

All config lives in `backend\.env`:

| Variable | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Gemini key |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model |
| `GROQ_API_KEY` | — | Groq key |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` | Groq model |
| `DEEPSEEK_API_KEY` | — | DeepSeek key |
| `DEEPSEEK_MODEL` | `deepseek-chat` | DeepSeek model |
| `LLM_PROVIDERS` | `gemini,groq,deepseek` | failover order (comma-separated) |
| `DATABASE_PATH` | `data/deduce.db` | SQLite file location |

---

## Deployment

### Option A: Render / Railway / Fly.io (easiest)

1. Push the project to GitHub.
2. Create a new Web Service on Render (or Railway/Fly) pointing at the repo.
3. **Build command:**
   ```bash
   pip install -r backend/requirements.txt
   ```
4. **Start command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend
   ```
5. Add your API keys in the dashboard's environment variables.
6. Deploy. The frontend is served by FastAPI itself, so there's nothing else to host.

### Option B: Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /code
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY frontend ./frontend
ENV DATABASE_PATH=/code/backend/data/deduce.db
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "backend"]
```

```powershell
docker build -t deduce .
docker run -p 8000:8000 --env-file backend/.env deduce
```

### Option C: VPS (Ubuntu)

```bash
git clone <your-repo> && cd detectiveAI
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
# set keys in backend/.env
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend
```

Run it in the background with `systemd`, `pm2`, or `nohup` for persistence.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Backend framework | FastAPI |
| Database | SQLite (stdlib `sqlite3`, no ORM) |
| LLM | Gemini (google-genai SDK), Groq + DeepSeek (OpenAI-compatible REST) |
| Structured output | Pydantic models + JSON schema + enum coercion |
| Frontend | Vanilla HTML/CSS/JS (no build step) |
| Server | Uvicorn |

---

## Troubleshooting

- **429 / quota errors** — all configured providers are temporarily exhausted. Wait for quotas to reset, or add more keys in `.env`. The failover system means one provider being down doesn't stop the app.
- **"No LLM providers configured"** — no API keys are set in `backend/.env`.
- **Port 8000 already in use** — kill the old process or use `--port 8001`.
- **DB errors after moving files** — delete `backend/data/deduce.db` and restart; it's recreated automatically.
=======
# A.C.I.D.
>>>>>>> 1096266a786efd4cc4d66f94c997454068d11ce3
