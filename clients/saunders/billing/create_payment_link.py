#!/usr/bin/env python3
"""Create a recurring $2,500/mo Stripe Payment Link for the Saunders brand-management
program (v7 terms: flat $2,500/mo, no upfront, month-to-month). Jared clicks the link,
enters a card, and the monthly subscription is set up automatically — that's the
"invoice with payment link embedded."

Key handling:
  export STRIPE_API_KEY=sk_live_...   -> real, payable link (use for the actual send)
  export STRIPE_API_KEY=sk_test_...   -> TEST link (preview only; test cards only)

Run: python3 create_payment_link.py
Prints the hosted payment URL. Idempotent enough for our use (creates a fresh
product+price+link each run; delete extras in the dashboard if you re-run).
"""
import os, sys
try:
    import stripe
except ImportError:
    sys.exit("pip install stripe")

MONTHLY_CENTS = 250000  # $2,500.00 / mo

key = os.environ.get("STRIPE_API_KEY", "")
if not key:
    sys.exit("Set STRIPE_API_KEY=sk_live_... (or sk_test_... for a preview) first.")
stripe.api_key = key
MODE = "LIVE" if "_live_" in key else "TEST (preview only — not payable with real cards)"

price = stripe.Price.create(
    unit_amount=MONTHLY_CENTS, currency="usd",
    recurring={"interval": "month"},
    product_data={"name": "Brand Management — Toyota & Kia of Vero Beach (both rooftops)"},
)
link = stripe.PaymentLink.create(
    line_items=[{"price": price.id, "quantity": 1}],
    metadata={"client": "saunders", "deal": "brand-mgmt-v7", "amount": "2500/mo"},
    after_completion={"type": "hosted_confirmation",
                      "hosted_confirmation": {"custom_message":
                      "Thanks — you're all set. We'll be in touch to kick off."}},
)
print(f"[{MODE}]")
print(f"Recurring $2,500/mo payment link:\n  {link.url}")
print(f"price={price.id}  link={link.id}")
