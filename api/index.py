"""Vercel serverless entrypoint for the DEDUCE FastAPI app.

Wraps the ASGI app in Mangum so it can run as a Vercel Function.
"""
import sys
from pathlib import Path

# Ensure the repo root is on sys.path so the backend package is importable.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.main import app  # noqa: E402
from mangum import Mangum  # noqa: E402

handler = Mangum(app)
