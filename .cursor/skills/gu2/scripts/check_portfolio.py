#!/usr/bin/env python3
"""Check that a GU2 portfolio folder contains the evidence slots.

Presence only. A passing run does not mean the work meets H48W 35.

    python check_portfolio.py PORTFOLIO
    python check_portfolio.py PORTFOLIO --manifest slots.json

Default slots look for a file whose path contains any of the listed
fragments (case-insensitive). A manifest replaces the defaults. It is a
JSON list of {"slot": "...", "needles": ["..."]}.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


DEFAULT_SLOTS: list[dict[str, list[str]]] = [
    {"slot": "planning action plan", "needles": ["action-plan", "action_plan", "计划"]},
    {"slot": "requirements", "needles": ["requirement", "需求"]},
    {"slot": "UML spec or drawio", "needles": [".drawio", "spec.json", "uml"]},
    {"slot": "test plan", "needles": ["test-plan", "test_plan", "测试计划"]},
    {"slot": "test runs", "needles": ["test-run", "test_run", "测试执行", "测试记录"]},
    {"slot": "user guide", "needles": ["user-guide", "user_guide", "用户"]},
    {"slot": "evaluation", "needles": ["evaluation", "评估"]},
    {"slot": "logbook", "needles": ["logbook", "log.md", "日志"]},
]


def load_slots(manifest: Path | None) -> list[dict[str, list[str]]]:
    if manifest is None:
        return DEFAULT_SLOTS
    data = json.loads(manifest.read_text(encoding="utf-8"))
    if not isinstance(data, list) or not data:
        raise SystemExit("manifest must be a non-empty JSON list")
    slots: list[dict[str, list[str]]] = []
    for item in data:
        slot = item.get("slot")
        needles = item.get("needles")
        if not isinstance(slot, str) or not needles or not all(isinstance(n, str) for n in needles):
            raise SystemExit(f"bad manifest entry: {item!r}")
        slots.append({"slot": slot, "needles": list(needles)})
    return slots


def rel_files(root: Path) -> list[str]:
    found: list[str] = []
    for path in root.rglob("*"):
        if path.is_file():
            found.append(path.relative_to(root).as_posix().lower())
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("portfolio", type=Path, help="portfolio directory")
    parser.add_argument("--manifest", type=Path, default=None, help="JSON slot list")
    args = parser.parse_args()

    root: Path = args.portfolio
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    slots = load_slots(args.manifest)
    files = rel_files(root)
    missing: list[str] = []

    print(f"portfolio: {root.resolve()}")
    print(f"files: {len(files)}")
    for slot in slots:
        hit = next((name for name in files if any(n.lower() in name for n in slot["needles"])), None)
        if hit:
            print(f"  ok   {slot['slot']}  <- {hit}")
        else:
            missing.append(slot["slot"])
            needles = ", ".join(slot["needles"])
            print(f"  miss {slot['slot']}  (looked for: {needles})")

    if missing:
        print(f"missing {len(missing)} slot(s)")
        return 1
    print("all slots present (quality is not checked)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
