#!/usr/bin/env python3
"""Pre-stage the Saunders first invoice to bill 2026-07-19 (Jun 19 sign + 30 days).

Creates a $2,500/mo subscription that does NOTHING until 2026-07-19, then sends the
first invoice and bills monthly thereafter. Uses trial_end so nothing charges before
the anchor. Collection = send_invoice (Stripe emails a hosted invoice; no saved card
needed). Also deactivates the immediate-pay payment link so there's ONE billing path.

Key: reads the live restricted key from ~/clawd/circuit-coders/.secrets/stripe_live_restricted.key
(rk_live, Products+PaymentLinks scope — subscription/invoice writes MAY be out of scope;
this script reports honestly if so).

Run: python3 prestage_invoice.py            (does it)
     python3 prestage_invoice.py --probe     (only test what the key can do, create nothing)
"""
import datetime as dt
import pathlib
import sys

try:
    import stripe
except ImportError:
    sys.exit("pip install stripe")

KEYFILE = pathlib.Path.home() / "clawd/circuit-coders/.secrets/stripe_live_restricted.key"
ANCHOR = dt.datetime(2026, 7, 19, 12, 0, 0)        # noon UTC, Jun 19 + 30 days
ANCHOR_TS = int(ANCHOR.timestamp())
MONTHLY_CENTS = 250000
CUST_EMAIL = "jareds@toyotaofvero.com"
CUST_NAME = "Toyota & Kia of Vero Beach (Saunders)"
LIVE_LINK_ID = "plink_1TkwgvKqJSPvOjzRmrv0BCMh"     # immediate-pay link to deactivate


def load_key():
    if not KEYFILE.exists():
        sys.exit(f"Live key missing at {KEYFILE}")
    stripe.api_key = KEYFILE.read_text().strip()
    if "_live_" not in stripe.api_key:
        sys.exit("Not a live key.")


def main():
    load_key()
    probe = "--probe" in sys.argv

    # 1. Can this key write Customers / Subscriptions? Find out before committing.
    try:
        cust = stripe.Customer.create(
            name=CUST_NAME, email=CUST_EMAIL,
            description="Circuit Coders brand management $2,500/mo (v7)",
            metadata={"client": "saunders", "deal": "brand-mgmt-v7"}) if not probe else None
    except stripe.error.PermissionError as e:
        sys.exit(f"KEY SCOPE BLOCKED on Customer.create: {e.user_message or e}")
    if probe:
        # Just verify the key can LIST customers (read) and report scope expectation.
        try:
            stripe.Subscription.list(limit=1)
            print("PROBE: key can read subscriptions — likely can write too.")
        except stripe.error.PermissionError as e:
            print(f"PROBE: subscriptions OUT OF SCOPE for this key: {e.user_message or e}")
        return

    print(f"customer: {cust.id}")

    # 2. Create the subscription: nothing until ANCHOR (trial_end), then $2,500/mo.
    price = stripe.Price.create(
        unit_amount=MONTHLY_CENTS, currency="usd",
        recurring={"interval": "month"},
        product_data={"name": "Brand Management — Toyota & Kia of Vero Beach (both rooftops)"})
    sub = stripe.Subscription.create(
        customer=cust.id,
        items=[{"price": price.id}],
        trial_end=ANCHOR_TS,
        collection_method="send_invoice",
        days_until_due=7,
        proration_behavior="none",
        description="Circuit Coders Brand Management. First invoice 2026-07-19, then monthly.",
        metadata={"client": "saunders", "type": "brand-mgmt-monthly", "deal": "v7",
                  "first_bill": "2026-07-19"})
    print(f"SUBSCRIPTION {sub.id} status={sub.status} first_invoice={ANCHOR.date()} ($2,500/mo)")

    # 3. Deactivate the immediate-pay link so there is ONE billing path.
    try:
        stripe.PaymentLink.modify(LIVE_LINK_ID, active=False)
        print(f"deactivated payment link {LIVE_LINK_ID}")
    except Exception as e:
        print(f"WARN: could not deactivate {LIVE_LINK_ID}: {e} — do it manually to avoid double-bill")


if __name__ == "__main__":
    main()
