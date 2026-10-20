import json

from ai.client import create_openrouter_client


MODEL_NAME = "deepseek/deepseek-v4.1-flash"


SYSTEM_PROMPT = """
You are an AI safety analysis assistant for fleet operators
using a California historical traffic accident dashboard.

Your task is to interpret the provided statistical context
and suggest cautious operational follow-up actions.

Return ONLY a valid JSON object with exactly these five keys:

{
  "analysis_scope": "...",
  "key_finding": "...",
  "supporting_evidence": "...",
  "suggested_follow_up": "...",
  "data_limitation": "..."
}

Requirements:
- All five values must be non-empty English strings.
- Use only information supplied in the statistical context.
- Do not invent statistics, facts, or external information.
- Do not calculate new accident probabilities.
- Do not claim that correlation proves causation.
- Do not interpret raw accident counts as exposure-adjusted risk.
- Do not predict future accident numbers.
- Keep the analysis concise and useful for fleet operators.
- Provide cautious, actionable follow-up suggestions.
- Clearly explain the limitations of historical accident data.
- Do not include Markdown headings or code fences.
- Do not include any text outside the JSON object.
"""
REPORT_FIELDS = (
    "analysis_scope",
    "key_finding",
    "supporting_evidence",
    "suggested_follow_up",
    "data_limitation",
)


def parse_structured_report(content: str) -> dict:
    """Parse and check the basic structure of an AI JSON report."""

    if not isinstance(content, str) or not content.strip():
        raise ValueError("AI returned an empty response.")

    content = content.strip()

    if content.startswith("```json"):
        content = content[7:].strip()
    elif content.startswith("```"):
        content = content[3:].strip()

    if content.endswith("```"):
        content = content[:-3].strip()

    try:
        report = json.loads(content)
    except json.JSONDecodeError as error:
        raise ValueError("AI response is not valid JSON.") from error

    if not isinstance(report, dict):
        raise ValueError("AI report must be a JSON object.")

    if set(report.keys()) != set(REPORT_FIELDS):
        raise ValueError("AI report has missing or unexpected fields.")

    for field in REPORT_FIELDS:
        value = report[field]

        if not isinstance(value, str) or not value.strip():
            raise ValueError(
                f"AI report field '{field}' must be a non-empty string."
            )

    return report
def validate_structured_report(report: dict, ai_context: dict) -> dict:
    """Check selected numerical facts in a structured AI report."""

    import re

    errors = []

    summary = ai_context.get("summary", {})
    total = summary.get("total_accidents")

    report_text = " ".join(report.values())

    if total is not None:
        patterns = [
            r"(?i)\btotal\s+accidents\s*:\s*([\d,]+)\b",
            r"(?i)\b([\d,]+)\s+accident\s+records\b",
            r"(?i)\b([\d,]+)\s+accidents\s+in\s+total\b",
        ]

        matches = []

        for pattern in patterns:
            matches.extend(re.findall(pattern, report_text))

        for value in matches:
            actual = int(value.replace(",", ""))

            if actual != int(total):
                errors.append(
                    f"Incorrect total accident count: {actual}"
                )

    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }
def generate_ai_report(ai_context: dict) -> dict:
    """Generate an English fleet accident analysis report."""

    if not isinstance(ai_context, dict):
        raise ValueError("AI context must be a dictionary.")

    if not ai_context.get("summary"):
        raise ValueError("AI context is missing summary statistics.")

    client = create_openrouter_client()

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": json.dumps(
                    ai_context,
                    ensure_ascii=False,
                ),
            },
        ],
        temperature=0,
        max_tokens=3000,
    )

    content = response.choices[0].message.content

    report = parse_structured_report(content)

    validation = validate_structured_report(report, ai_context)

    if not validation["valid"]:
        raise RuntimeError(
            "AI report validation failed: "
            + "; ".join(validation["errors"])
        )

    return report