#!/usr/bin/env python3
"""Sanitize local ops docs (HANDOVER.md / DRAFT-README.md). Safe to run repeatedly.

Uses generic patterns — does not re-commit live hostnames. Optional exact tokens
can live in gitignored scripts/ops-secrets.local.txt (one token per line → REDACTED).
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATHS = [ROOT / "docs" / "rea" / "HANDOVER.md", ROOT / "DRAFT-README.md"]
LOCAL_SECRETS = ROOT / "scripts" / "ops-secrets.local.txt"

# Order matters: more specific first.
REGEX_REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}\.sslip\.io\b"), "your-upstream.example"),
    (re.compile(r"\b[\w-]+\.livekit\.cloud\b"), "your-project.livekit.cloud"),
    (re.compile(r"BOX_SSH_HOST=\S+"), "BOX_SSH_HOST=(set in private ops env, not in git)"),
    (re.compile(r"\.env\.TEMPLATE\b"), "private ops env (not in repo)"),
]

# Common operator aliases — extend via ops-secrets.local.txt if needed.
LITERAL_REPLACEMENTS = [
    ("greenmini", "REDACTED_SSH_ALIAS"),
]

PROSE_FIXES = [
    (
        "vercel.json rewrites /stream → upstream (https://your-upstream.example/stream)",
        "TARS_UPSTREAM env + middleware.js proxy /stream and /api/*",
    ),
]


def load_local_secrets() -> list[tuple[str, str]]:
    if not LOCAL_SECRETS.exists():
        return []
    out: list[tuple[str, str]] = []
    for line in LOCAL_SECRETS.read_text(encoding="utf-8").splitlines():
        token = line.strip()
        if not token or token.startswith("#"):
            continue
        out.append((token, "REDACTED"))
    return out


def sanitize(text: str) -> str:
    for old, new in load_local_secrets() + LITERAL_REPLACEMENTS:
        text = text.replace(old, new)
    for pattern, repl in REGEX_REPLACEMENTS:
        text = pattern.sub(repl, text)
    for old, new in PROSE_FIXES:
        text = text.replace(old, new)
    return text


def main() -> None:
    for path in PATHS:
        if not path.exists():
            print("skip (missing)", path)
            continue
        before = path.read_text(encoding="utf-8")
        after = sanitize(before)
        path.write_text(after, encoding="utf-8")
        print("sanitized" if after != before else "unchanged", path)


if __name__ == "__main__":
    main()
