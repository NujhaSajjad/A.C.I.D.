import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Provider keys (add the ones you have; unconfigured providers are skipped) ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

# Order in which providers are tried. First available wins; on failure we fall through.
PROVIDER_ORDER = [p.strip() for p in os.getenv("LLM_PROVIDERS", "gemini,groq,deepseek").split(",") if p.strip()]

DATABASE_PATH = os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "deduce.db"))
