"""Shared helpers for the Saunders brand-management machine.
No third-party deps beyond stdlib. macOS notifications via osascript.
"""
import json
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CONFIG = ROOT / "config" / "stores.json"
DATA = ROOT / "data"


def load_config():
    with open(CONFIG) as f:
        return json.load(f)


def stores():
    return load_config()["stores"]


def notify(title, message):
    """macOS notification per feedback_deliverables_in_terminal / ping-anytime rules."""
    try:
        subprocess.run(
            ["osascript", "-e",
             f'display notification {json.dumps(message)} with title {json.dumps(title)} sound name "Glass"'],
            check=False,
        )
    except Exception as e:
        print(f"[notify-failed] {title}: {message} ({e})")


def load_json(path, default):
    p = Path(path)
    if not p.exists():
        return default
    with open(p) as f:
        return json.load(f)


def save_json(path, obj):
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with open(p, "w") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)


def access_ready(store, platform):
    """True if we hold the access needed to act on this platform (set at kickoff)."""
    p = store["platforms"].get(platform, {})
    for flag in ("manager_access", "admin_access", "claimed", "account"):
        if flag in p:
            return bool(p[flag])
    return False
