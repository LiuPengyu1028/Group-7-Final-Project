from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_readme_covers_the_course_demo_contract() -> None:
    readme = (ROOT / "README.md").read_text(encoding="utf-8")
    for section in ("Problem", "Data source", "Run locally", "Limitations", "Dashboard features"):
        assert section in readme
    assert "https://www.kaggle.com/datasets/sobhanmoosavi/us-accidents" in readme
    assert "CC BY-NC-SA 4.0" in readme
    assert "vehicle make or model" in readme.lower()
    assert "not" in readme.lower() and "probability" in readme.lower()


def test_demo_script_has_six_labeled_beats() -> None:
    script = (ROOT / "docs" / "demo-script.md").read_text(encoding="utf-8").lower()
    for beat in ("problem", "data", "insight", "interaction", "limitation", "next step"):
        assert beat in script
