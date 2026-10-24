"""Multi-provider LLM client with automatic failover.

Providers (tried in order, first success wins):
  1. Gemini   — google-genai SDK
  2. Groq     — OpenAI-compatible REST
  3. DeepSeek — OpenAI-compatible REST

If one provider is exhausted / errors, we automatically fall through to the next.
Swap or reorder via LLM_PROVIDERS in .env.
"""
import json
import logging
import time

import httpx
from google import genai
from google.genai import types
from pydantic import BaseModel

from .config import (
    GEMINI_API_KEY, GEMINI_MODEL,
    GROQ_API_KEY, GROQ_MODEL,
    DEEPSEEK_API_KEY, DEEPSEEK_MODEL,
    PROVIDER_ORDER,
)

logger = logging.getLogger("deduce.llm")

# ---------------------------------------------------------------------------
# Schema helpers (shared across providers)
# ---------------------------------------------------------------------------

def _coerce_enums(data, schema: dict) -> None:
    """Walk a JSON schema and reset any enum field whose value is invalid
    back to its default. LLMs usually respect enums, but not always."""
    if not isinstance(data, dict):
        return
    props = schema.get("properties", {})
    for key, value in data.items():
        prop = props.get(key)
        if not prop:
            continue
        if isinstance(value, dict):
            _coerce_enums(value, prop)
        elif isinstance(value, list):
            item_schema = prop.get("items", {})
            for item in value:
                if isinstance(item, dict):
                    _coerce_enums(item, item_schema)
        elif "enum" in prop and value not in prop["enum"]:
            data[key] = prop.get("default")


def _parse_and_validate(raw: str, schema_model: type[BaseModel]) -> BaseModel:
    data = json.loads(raw)
    _coerce_enums(data, schema_model.model_json_schema())
    return schema_model.model_validate(data)


# ---------------------------------------------------------------------------
# Gemini (google-genai SDK)
# ---------------------------------------------------------------------------

_gemini_client = None


def _get_gemini_client() -> genai.Client:
    global _gemini_client
    if _gemini_client is None:
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your-key-here":
            raise RuntimeError("GEMINI_API_KEY is not set in .env")
        _gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    return _gemini_client


def _gemini_generate_json(prompt: str, schema_model: type[BaseModel]) -> BaseModel:
    client = _get_gemini_client()
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=schema_model,
    )
    response = client.models.generate_content(
        model=GEMINI_MODEL, contents=prompt, config=config,
    )
    return _parse_and_validate(response.text, schema_model)


def _gemini_generate_text(system_prompt: str, contents: str) -> str:
    client = _get_gemini_client()
    config = types.GenerateContentConfig(system_instruction=system_prompt)
    response = client.models.generate_content(
        model=GEMINI_MODEL, contents=contents, config=config,
    )
    return response.text


# ---------------------------------------------------------------------------
# OpenAI-compatible REST (Groq + DeepSeek)
# ---------------------------------------------------------------------------

def _openai_compat_json(base_url: str, api_key: str, model: str,
                        prompt: str, schema_model: type[BaseModel]) -> BaseModel:
    resp = httpx.post(
        f"{base_url}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"},
        },
        timeout=120.0,
    )
    resp.raise_for_status()
    raw = resp.json()["choices"][0]["message"]["content"]
    return _parse_and_validate(raw, schema_model)


def _openai_compat_text(base_url: str, api_key: str, model: str,
                        system_prompt: str, contents: str) -> str:
    resp = httpx.post(
        f"{base_url}/chat/completions",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": contents},
            ],
        },
        timeout=120.0,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _groq_generate_json(prompt, schema_model):
    return _openai_compat_json("https://api.groq.com/openai/v1", GROQ_API_KEY, GROQ_MODEL, prompt, schema_model)


def _groq_generate_text(system_prompt, contents):
    return _openai_compat_text("https://api.groq.com/openai/v1", GROQ_API_KEY, GROQ_MODEL, system_prompt, contents)


def _deepseek_generate_json(prompt, schema_model):
    return _openai_compat_json("https://api.deepseek.com", DEEPSEEK_API_KEY, DEEPSEEK_MODEL, prompt, schema_model)


def _deepseek_generate_text(system_prompt, contents):
    return _openai_compat_text("https://api.deepseek.com", DEEPSEEK_API_KEY, DEEPSEEK_MODEL, system_prompt, contents)


# ---------------------------------------------------------------------------
# Provider registry + failover
# ---------------------------------------------------------------------------

_PROVIDERS = {
    "gemini": {
        "configured": bool(GEMINI_API_KEY and GEMINI_API_KEY != "your-key-here"),
        "json": _gemini_generate_json,
        "text": _gemini_generate_text,
    },
    "groq": {
        "configured": bool(GROQ_API_KEY),
        "json": _groq_generate_json,
        "text": _groq_generate_text,
    },
    "deepseek": {
        "configured": bool(DEEPSEEK_API_KEY),
        "json": _deepseek_generate_json,
        "text": _deepseek_generate_text,
    },
}


def _active_providers() -> list[str]:
    return [p for p in PROVIDER_ORDER if _PROVIDERS.get(p, {}).get("configured")]


def _call_with_failover(kind: str, *args):
    """Try each configured provider in order. kind is 'json' or 'text'."""
    active = _active_providers()
    if not active:
        raise RuntimeError(
            "No LLM providers configured. Set at least one of: "
            "GEMINI_API_KEY, GROQ_API_KEY, DEEPSEEK_API_KEY in .env"
        )

    last_exc = None
    for provider in active:
        fn = _PROVIDERS[provider][kind]
        try:
            result = fn(*args)
            if provider != active[0]:
                logger.info("fell back to %s", provider)
            return result
        except Exception as e:
            last_exc = e
            logger.warning("provider %s failed: %s", provider, e)
            continue

    raise RuntimeError(f"All LLM providers failed. Last error: {last_exc}")


# ---------------------------------------------------------------------------
# Public API (unchanged signatures — analyzer/chat don't need to change)
# ---------------------------------------------------------------------------

def generate_json(prompt: str, schema_model: type[BaseModel]) -> BaseModel:
    """Structured JSON output, with automatic provider failover."""
    return _call_with_failover("json", prompt, schema_model)


def generate_text(system_prompt: str, contents: str) -> str:
    """Conversational text output, with automatic provider failover."""
    return _call_with_failover("text", system_prompt, contents)
