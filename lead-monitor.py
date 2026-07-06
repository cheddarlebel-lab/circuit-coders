#!/usr/bin/env python3
"""
Circuit Coders Lead Monitor
Polls Turso DB every 5 minutes for new leads.
Sends Telegram notification with fulfillment plan for each new one.
Managed via launchd: com.circuitcoders.leadmonitor.plist
"""

import json
import os
import sys
import urllib.request
import ssl

def _load_secrets():
    envf = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".secrets", "monitor.env")
    if not os.path.exists(envf):
        return
    with open(envf) as f:
        for line in f:
            line = line.strip()
            if line.startswith("export "):
                line = line[7:]
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_secrets()

# === Config === (secrets sourced from .secrets/monitor.env — never hardcode)
TURSO_URL = os.environ.get("TURSO_URL", "https://circuit-coders-cheddar.aws-us-west-2.turso.io")
TURSO_TOKEN = os.environ.get("TURSO_TOKEN", "")
TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")
STATE_FILE = os.path.expanduser("~/clawd/circuit-coders/.last_lead_id")

if not TURSO_TOKEN:
    sys.exit("TURSO_TOKEN not set — source .secrets/monitor.env before running.")


def turso_query(sql):
    """Execute SQL against Turso HTTP API."""
    payload = json.dumps({
        "requests": [
            {"type": "execute", "stmt": {"sql": sql}},
            {"type": "close"}
        ]
    }).encode()

    req = urllib.request.Request(
        f"{TURSO_URL}/v2/pipeline",
        data=payload,
        headers={
            "Authorization": f"Bearer {TURSO_TOKEN}",
            "Content-Type": "application/json"
        }
    )
    ctx = ssl.create_default_context()
    resp = urllib.request.urlopen(req, context=ctx)
    data = json.loads(resp.read())

    # Parse Turso response
    result = data.get("results", [{}])[0]
    response = result.get("response", {}).get("result", {})
    cols = [c["name"] for c in response.get("cols", [])]
    rows = []
    for row in response.get("rows", []):
        rows.append({cols[i]: cell.get("value") for i, cell in enumerate(row)})
    return rows


def send_telegram(text):
    """Send message to Leo on Telegram."""
    payload = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown"
    }).encode()

    req = urllib.request.Request(
        f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req)
    except Exception as e:
        print(f"Telegram send failed: {e}", file=sys.stderr)


def get_last_seen_id():
    try:
        with open(STATE_FILE, 'r') as f:
            return int(f.read().strip())
    except (FileNotFoundError, ValueError):
        return 0


def set_last_seen_id(lead_id):
    with open(STATE_FILE, 'w') as f:
        f.write(str(lead_id))


def generate_fulfillment_plan(lead):
    """Create a fulfillment plan based on project type and details."""
    project_type = (lead.get("project_type") or "custom").lower()
    name = lead.get("customer_name") or "Unknown"
    company = lead.get("company") or ""
    budget = lead.get("budget") or "Not specified"
    timeline = lead.get("timeline") or "Not specified"
    description = lead.get("description") or ""

    # Base plan steps based on project type
    plans = {
        "web": [
            "Review requirements and wireframe main pages",
            "Set up Next.js project with Vercel deployment",
            "Design UI/UX mockups in Figma or direct-to-code",
            "Build responsive frontend + backend API",
            "Integrate any third-party services (payments, auth, etc.)",
            "QA testing across devices",
            "Deploy to production + hand off credentials",
        ],
        "mobile": [
            "Review requirements and define MVP scope",
            "Set up React Native / Expo project",
            "Design screens and navigation flow",
            "Build core features + API integration",
            "TestFlight / internal testing",
            "App Store / Play Store submission",
            "Post-launch support period",
        ],
        "iot": [
            "Review hardware requirements and component list",
            "Design circuit schematic + PCB layout",
            "Prototype firmware (Arduino/ESP32/RPi)",
            "Build companion app or dashboard if needed",
            "Hardware testing + iteration",
            "Manufacture small batch or hand-off design files",
            "Documentation + deployment guide",
        ],
        "embedded": [
            "Define hardware platform and constraints",
            "Design system architecture",
            "Develop firmware / embedded software",
            "Build communication layer (BLE/WiFi/MQTT)",
            "Integration testing with target hardware",
            "Reliability testing + edge cases",
            "Production firmware + documentation",
        ],
        "ai": [
            "Define AI/ML requirements and data needs",
            "Data collection / preparation pipeline",
            "Model selection and training",
            "Build API wrapper / integration layer",
            "Testing and validation",
            "Deploy model (cloud or edge)",
            "Monitoring + retraining plan",
        ],
        "consulting": [
            "Discovery call to understand needs",
            "Technical audit / assessment",
            "Prepare recommendations document",
            "Present findings + roadmap",
            "Follow-up support",
        ],
    }

    # Match project type to plan
    steps = plans.get("web")  # default
    for key in plans:
        if key in project_type:
            steps = plans[key]
            break

    plan_text = "\n".join([f"  {i+1}. {step}" for i, step in enumerate(steps)])

    return plan_text


def check_new_leads():
    """Check for new leads since last check."""
    last_id = get_last_seen_id()

    # Query for new projects with customer info
    sql = f"""
        SELECT p.id, p.title, p.description, p.project_type, p.budget, p.timeline, p.status,
               p.created_at, c.name as customer_name, c.email as customer_email, c.company
        FROM projects p
        JOIN customers c ON p.customer_id = c.id
        WHERE p.id > {last_id}
        ORDER BY p.id ASC
    """

    try:
        leads = turso_query(sql)
    except Exception as e:
        print(f"DB query failed: {e}", file=sys.stderr)
        return

    if not leads:
        return

    print(f"Found {len(leads)} new lead(s)")

    for lead in leads:
        lead_id = int(lead["id"])
        name = lead.get("customer_name", "Unknown")
        email = lead.get("customer_email", "")
        company = lead.get("company") or ""
        project_type = lead.get("project_type") or "Custom"
        budget = lead.get("budget") or "Not specified"
        timeline = lead.get("timeline") or "Not specified"
        description = lead.get("description") or "No description"
        created = lead.get("created_at", "")

        plan = generate_fulfillment_plan(lead)

        company_line = f"*Company:* {company}\n" if company else ""

        msg = (
            f"🔔 *NEW CIRCUIT CODERS LEAD*\n\n"
            f"*Name:* {name}\n"
            f"*Email:* {email}\n"
            f"{company_line}"
            f"*Type:* {project_type}\n"
            f"*Budget:* {budget}\n"
            f"*Timeline:* {timeline}\n\n"
            f"*Description:*\n{description[:300]}\n\n"
            f"---\n"
            f"📋 *FULFILLMENT PLAN:*\n{plan}\n\n"
            f"_Reply to {email} within 24h._\n"
            f"_Admin: circuitcoders.com/admin/dashboard_"
        )

        send_telegram(msg)
        print(f"  Notified: Lead #{lead_id} from {name} ({email})")

        # Update high water mark after each successful notification
        set_last_seen_id(lead_id)


if __name__ == "__main__":
    check_new_leads()
