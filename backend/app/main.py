from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .db import init_db
from .routers import cases, evidence, investigation, analysis, chat

# frontend/ is a sibling of backend/
FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"

app = FastAPI(title="DEDUCE — AI Investigation Engine", version="0.1.0")

app.include_router(cases.router)
app.include_router(evidence.router)
app.include_router(investigation.router)
app.include_router(analysis.router)
app.include_router(chat.router)


@app.get("/")
def index():
    return FileResponse(FRONTEND_DIR / "index.html")


app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

@app.on_event("startup")
def startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {"status": "ok", "engine": "DEDUCE"}

# Static frontend is mounted in step 7.
