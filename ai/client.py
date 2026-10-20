
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env", override=False)

def create_openrouter_client() -> OpenAI:
    """
    Create an OpenRouter client using an environment variable.

    The API key must never be hardcoded in source files.
    """
    api_key = os.environ.get("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError(
            "OPENROUTER_API_KEY is not configured. "
            "Set it in your local environment before using AI features."
        )

    return OpenAI(
        api_key=api_key,
        base_url=OPENROUTER_BASE_URL,
        timeout=20.0,
        max_retries=0,
    )
