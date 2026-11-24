#!/usr/bin/env python3
"""Replace operator-specific hostnames in local ops docs (not for public git)."""
from pathlib import Path

REPLACEMENTS = [
    ("your-upstream.example", "your-upstream.example"),
    ("REDACTED_BOX_HOST", "REDACTED_BOX_HOST"),
    ("REDACTED_LAN_HOST", "REDACTED_LAN_HOST"),
    ("your-project.livekit.cloud", "your-project.livekit.cloud"),
    ("your-project…", "your-project…"),
    ("teacher-nahixnjs", "your-project"),
    ("REDACTED_SSH_ALIAS", "REDACTED_SSH_ALIAS"),
    ("BOX_SSH_HOST=REDACTED_BOX_HOST", "BOX_SSH_HOST (set in private ops env, not in git)"),
    (".env.TEMPLATE", "private ops env (not in repo)"),
]

ROOT = Path(__file__).resolve().parents[1]
PATHS = [ROOT / "docs" / "rea" / "HANDOVER.md", ROOT / "DRAFT-README.md"]

def sanitize(text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    # Historical vercel rewrite prose → current model
    text = text.replace(
        "vercel.json rewrites /stream → upstream (https://your-upstream.example/stream)",
        "TARS_UPSTREAM env + middleware.js proxy /stream and /api/*",
    )
    return text

for p in PATHS:
    if not p.exists():
        continue
    p.write_text(sanitize(p.read_text(encoding="utf-8")), encoding="utf-8")
    print("sanitized", p)