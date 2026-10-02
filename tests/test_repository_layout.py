from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_raw_data_and_secrets_are_ignored_but_placeholders_are_tracked():
    ignore_rules = (ROOT / ".gitignore").read_text(encoding="utf-8").splitlines()

    assert "data/raw/*.csv" in ignore_rules
    assert "data/raw/*.zip" in ignore_rules
    assert ".env" in ignore_rules
    assert "node_modules/" in ignore_rules
    assert (ROOT / "data/raw/.gitkeep").is_file()
    assert (ROOT / "data/processed/.gitkeep").is_file()
