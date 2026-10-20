import re


REQUIRED_SECTIONS = [
    "Analysis Scope",
    "Key Finding",
    "Supporting Evidence",
    "Suggested Follow-up",
    "Data Limitation",
]


def validate_ai_report(report: str, ai_context: dict) -> dict:
    """
    Validate the basic structure and key statistics
    of an AI-generated report.
    """

    errors = []
    if not isinstance(report, str) or not report.strip():
        return {
            "valid": False,
            "errors": ["AI report is empty."],
        }

    # Check required section headings and their order.
    positions = []

    for section in REQUIRED_SECTIONS:
        pattern = rf"(?im)^\s*(?:\d+[.)]\s*)?{re.escape(section)}\s*:?\s*$"
        match = re.search(pattern, report)

        if match is None:
            errors.append(f"Missing section: {section}")
        else:
            positions.append(match.start())

    if len(positions) == len(REQUIRED_SECTIONS):
        if positions != sorted(positions):
            errors.append("Report sections are in the wrong order.")

    # Check key statistics.
    summary = ai_context.get("summary", {})

    total = summary.get("total_accidents")

    if total is not None:
        expected_total = int(total)

        # Pattern 1: Total accidents: 100
        pattern_1 = (
            r"(?i)\btotal\s+accidents\s*:\s*"
            r"([\d,]+)\b"
        )

        # Pattern 2: 100 accident records
        pattern_2 = (
            r"(?i)\b([\d,]+)\s+"
            r"accident\s+records\b"
        )

                # Pattern 3: The dataset contains 100 records
        pattern_3 = (
            r"(?i)\b(?:the\s+)?(?:filtered\s+)?dataset\s+"
            r"contains\s+([\d,]+)\s+records\b"
        )

        matches = (
            re.findall(pattern_1, report)
            + re.findall(pattern_2, report)
            + re.findall(pattern_3, report)
        )

        if not matches:
            errors.append(
                "Total accident count not found in report."
            )
        else:
            incorrect_values = [
                value
                for value in matches
                if int(value.replace(",", "")) != expected_total
            ]

            if incorrect_values:
                errors.append(
                    "Incorrect total accident count: "
                    + ", ".join(incorrect_values)
                )

    severity_share = summary.get("severity_3_4_share_pct")

    if severity_share is not None:
        expected_share = float(severity_share)


        # Pattern 1: Severity 3-4 accounts for 30%
        pattern_1 = (
            r"(?i)\bseverity\s*3\s*[-–—]\s*4\b"
            r"[^\n]*?"
            r"(\d+(?:\.\d+)?)\s*%"
        )

        # Pattern 2: 30 records (30.0%) have severity 3 or 4
        pattern_2 = (
            r"(?i)(\d+(?:\.\d+)?)\s*%"
            r"[^\n]*?"
            r"\bseverity\s*3\s+or\s+4\b"
        )

        matches = (
            re.findall(pattern_1, report)
            + re.findall(pattern_2, report)
        )

        if not matches:
            errors.append(
                "Severity 3-4 percentage not found in report."
            )
        else:
            incorrect_values = [
                value
                for value in matches
                if abs(float(value) - expected_share) >= 0.051
            ]

            if incorrect_values:
                errors.append(
                    "Incorrect Severity 3-4 percentage: "
                    + ", ".join(incorrect_values)
                )
    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }
