import json

from ai.client import create_openrouter_client

MODEL_NAME = "deepseek/deepseek-v4.1-flash"

QA_SYSTEM_PROMPT = """
You are an AI data analysis assistant for fleet operators
using a California historical traffic accident dashboard.

Answer the user's question using ONLY the provided
aggregated statistical context.

Use exactly these three sections, formatted in Markdown:

### 1. Direct Answer
Write a short paragraph answering the question directly.

### 2. Supporting Data
Provide relevant statistics as bullet points.
Only include numbers supported by the supplied context.

### 3. Interpretation and Limitations
Explain what the statistics mean and their limitations.

Formatting requirements:
- Put each section heading on its own line.
- Leave a blank line after each heading.
- Do not combine headings and body text on the same line.
- Do not add extra sections.

Requirements:
- Answer in English.
- Use only the supplied statistical context.
- Do not invent statistics or external information.
- If the data cannot answer the question, say so clearly.
- Do not claim that correlation proves causation.
- Do not interpret accident counts as accident probabilities.
- Do not predict future accidents.
- Keep answers concise and relevant to fleet operators.
"""

def answer_ai_question(question: str, ai_context: dict) -> str:
    """Answer a question using the current dashboard statistics."""

    if not isinstance(question, str) or not question.strip():
        raise ValueError("Question cannot be empty.")

    if not isinstance(ai_context, dict) or not ai_context.get("summary"):
        raise ValueError("Valid AI context is required.")

    client = create_openrouter_client()

    user_message = json.dumps(
        {
            "question": question.strip(),
            "statistical_context": ai_context,
        },
        ensure_ascii=False,
    )

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": QA_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": user_message,
            },
        ],
        temperature=0,
        max_tokens=3000,
    )

    answer = response.choices[0].message.content

    if not answer or not answer.strip():
        raise RuntimeError("AI returned an empty answer.")

    validation = validate_qa_answer(answer, ai_context)

    if not validation["valid"]:
        raise ValueError(
            "AI Q&A validation failed: "
            + "; ".join(validation["errors"])
        )

    return answer.strip()

def validate_qa_answer(answer: str, ai_context: dict) -> dict:
    """Check selected numerical claims in an AI Q&A answer."""

    import re

    errors = []

    if not isinstance(answer, str) or not answer.strip():
        return {
            "valid": False,
            "errors": ["AI answer is empty."],
        }

    summary = ai_context.get("summary", {})
    total = summary.get("total_accidents")

    if total is not None:
        patterns = [
            r"(?i)\btotal\s+(?:recorded\s+)?accidents\s*:\s*([\d,]+)\b",
            r"(?i)\btotal\s+(?:accident\s+)?records\s*:\s*([\d,]+)\b",
            r"(?i)\b([\d,]+)\s+accident\s+records\b",
        ]

        for pattern in patterns:
            for value in re.findall(pattern, answer):
                actual = int(value.replace(",", ""))

                if actual != int(total):
                    errors.append(
                        f"Incorrect total accident count: {actual}"
                    )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }
def format_qa_answer(answer: str) -> str:
    """Normalize the three Q&A section headings for Markdown display."""
    import re

    headings = [
        "Direct Answer",
        "Supporting Data",
        "Interpretation and Limitations",
    ]

    formatted = answer.strip()

    for index, heading in enumerate(headings, start=1):
        pattern = rf"(?m)^\s*(?:###\s*)?{index}\.\s*{re.escape(heading)}\b[ \t]*"

        formatted = re.sub(
            pattern,
            f"### {index}. {heading}\n\n",
            formatted,
            count=1,
            flags=re.IGNORECASE,
        )

    formatted = re.sub(
        r"\n[ \t]*(?=### [123]\.)",
        "\n\n",
        formatted,
    )

    formatted = re.sub(
        r"(### [123]\. [^\n]+)\n{3,}",
        r"\1\n\n",
        formatted,
    )

    return formatted