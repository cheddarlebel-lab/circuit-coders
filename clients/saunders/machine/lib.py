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
    # Pass title/message as argv (on run argv) so apostrophes, quotes, backslashes,
    # and any AppleScript-special chars are never injected into the script body.
    script = ('on run argv\n'
              'display notification (item 1 of argv) with title (item 2 of argv) '
              'sound name "Glass"\n'
              'end run')
    try:
        subprocess.run(["osascript", "-e", script, str(message), str(title)], check=False)
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
