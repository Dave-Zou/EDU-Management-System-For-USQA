#!/usr/bin/env python3
"""Check a GU2 portfolio for the sections this year's notes require.

Looks in file names and in the text of .md, .txt and .docx. PDF text is
not extracted. A passing run does not mean the work meets H48W 35.

    python check_portfolio.py PORTFOLIO
    python check_portfolio.py PORTFOLIO --manifest slots.json

A manifest replaces the default slots. It is a JSON list of
{"slot": "...", "needles": ["..."]}.
"""

from __future__ import annotations

import argparse
import json
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

W_T = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t"

DEFAULT_SLOTS: list[dict[str, list[str]]] = [
    {"slot": "brief or task analysis", "needles": ["项目简报", "任务书", "project brief"]},
    {"slot": "functional requirements", "needles": ["功能需求", "functional requirement"]},
    {"slot": "implied requirements or data entities", "needles": ["数据实体", "隐含要求", "implied requirement"]},
    {"slot": "use cases", "needles": ["用例", "use case"]},
    {"slot": "subsystems", "needles": ["子系统", "subsystem"]},
    {"slot": "meeting notes", "needles": ["会议纪要", "minutes"]},
    {"slot": "plan", "needles": ["里程碑", "项目计划", "milestone"]},
    {"slot": "tests", "needles": ["测试计划", "测试用例", "test plan", "期望"]},
    {"slot": "user documentation", "needles": ["用户文档", "操作说明", "user guide"]},
    {"slot": "evaluation", "needles": ["优点", "缺点", "evaluation", "评价"]},
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


def docx_text(path: Path) -> str:
    try:
        with zipfile.ZipFile(path) as archive:
            xml = archive.read("word/document.xml")
    except (zipfile.BadZipFile, KeyError, OSError):
        return ""
    try:
        root = ET.fromstring(xml)
    except ET.ParseError:
        return ""
    return "".join(node.text or "" for node in root.iter(W_T))


def corpus(root: Path) -> tuple[list[str], str, int]:
    names: list[str] = []
    chunks: list[str] = []
    pdfs = 0
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(root).as_posix()
        names.append(rel.lower())
        suffix = path.suffix.lower()
        if suffix == ".pdf":
            pdfs += 1
        elif suffix in {".md", ".txt"}:
            chunks.append(path.read_text(encoding="utf-8", errors="replace"))
        elif suffix == ".docx":
            chunks.append(docx_text(path))
    return names, "\n".join(chunks).lower(), pdfs


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
    names, text, pdfs = corpus(root)
    haystack = "\n".join(names) + "\n" + text
    missing: list[str] = []

    print(f"portfolio: {root.resolve()}")
    print(f"files: {len(names)}")
    if pdfs:
        print(f"pdf: {pdfs} (text not extracted; match is by file name only)")
    for slot in slots:
        hit = next((needle for needle in slot["needles"] if needle.lower() in haystack), None)
        if hit:
            print(f"  ok   {slot['slot']}  <- {hit}")
        else:
            missing.append(slot["slot"])
            needles = ", ".join(slot["needles"])
            print(f"  miss {slot['slot']}  (looked for: {needles})")

    if len(names) > 15:
        print("note: many separate files. Spoken requirement this year was one document; a zip of 20+ files was treated as not following the brief. This note does not change the exit code.")

    if missing:
        print(f"missing {len(missing)} slot(s)")
        return 1
    print("all slots present (quality is not checked)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
