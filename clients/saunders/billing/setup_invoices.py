#!/usr/bin/env python3
"""Saunders billing setup — single $2,500/mo subscription (REVISED v7 terms).

Deal terms (proposal v7, both rooftops, month-to-month):
  - NO upfront fee, NO setup invoice.
  - Recurring: $2,500/mo Brand Management -> a Stripe Subscription, billed monthly.
  - Begins at KICKOFF (the access call). First charge on program start, then the same
    date each month. The Weeks 1-2 get-well cleanup is included in month one.

SEQUENCING (do not skip):
  1. Deal must be SIGNED (still verbal close as of build).
  2. Access call complete -> THEN start the subscription (program begins at kickoff).

REQUIRES the LIVE key — test mode cannot collect real money:
  export STRIPE_API_KEY=sk_live_...    (NOT the sk_test_ key in accounts.md)

Usage:
  python3 setup_invoices.py --customer-email jareds@toyotaofvero.com --create-customer
  python3 setup_invoices.py --customer cus_XXX --start-subscription              # at kickoff
  python3 setup_invoices.py --customer cus_XXX --start-subscription --anchor 2026-07-01

Dry-run by default. Nothing is created/charged unless you pass --start-subscription.
"""
import argparse
import os
import sys

try:
    import stripe
except ImportError:
    sys.exit("pip install stripe — then re-run")

MONTHLY_CENTS = 250000     # $2,500.00 / mo (revised v7 — no upfront, no setup fee)
CLIENT = "Toyota & Kia of Vero Beach (Saunders)"


def need_live_key():
    key = os.environ.get("STRIPE_API_KEY", "")
    if not key:
        sys.exit("Set STRIPE_API_KEY=sk_live_... in the environment first.")
    if key.startswith("sk_test_"):
        sys.exit("That's a TEST key — it cannot collect real money. Use sk_live_...")
    stripe.api_key = key
    return key


def create_customer(email):
    c = stripe.Customer.create(
        name=CLIENT, email=email,
        description="Circuit Coders — brand management, both rooftops ($2,500/mo, v7 terms)",
        metadata={"client": "saunders", "deal": "brand-mgmt-v7"},
    )
    print(f"customer: {c.id}  ({email})")
    return c.id


def start_subscription(customer, anchor, start):
    price = stripe.Price.create(
        unit_amount=MONTHLY_CENTS, currency="usd",
        recurring={"interval": "month"},
        product_data={"name": "Brand Management — Toyota & Kia of Vero Beach (both rooftops)"},
    )
    kwargs = dict(
        customer=customer, items=[{"price": price.id}],
        collection_method="send_invoice", days_until_due=7,
        description="Circuit Coders — Brand Management Program. No setup fee; "
                    "get-well cleanup included in month one. Month-to-month, 30-day notice.",
        metadata={"client": "saunders", "type": "brand-mgmt-monthly", "deal": "v7"},
    )
    if anchor:
        # Delay the first charge to a specific program-start date.
        import datetime as dt
        ts = int(dt.datetime.fromisoformat(anchor).timestamp())
        kwargs["billing_cycle_anchor"] = ts
        kwargs["proration_behavior"] = "none"
    if not start:
        print(f"DRY-RUN subscription: $2,500/mo, price {price.id}, first bill {anchor or 'now'}. "
              f"Re-run with --start-subscription to activate.")
        return None
    sub = stripe.Subscription.create(**kwargs)
    print(f"STARTED subscription {sub.id} ($2,500/mo, first bill {anchor or 'now (kickoff)'})")
    return sub.id


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--customer-email")
    p.add_argument("--customer")
    p.add_argument("--create-customer", action="store_true")
    p.add_argument("--start-subscription", action="store_true")
    p.add_argument("--anchor", help="ISO date for first monthly charge, e.g. 2026-07-01")
    p.add_argument("--i-know-no-payment-link-exists", action="store_true",
                   help="Required override to start a subscription. The LIVE payment link "
                        "(plink_1TkwgvKqJSPvOjzRmrv0BCMh) is the chosen billing path — running "
                        "this too would DOUBLE-bill Jared $5,000/mo.")
    a = p.parse_args()

    # DOUBLE-BILLING GUARD: a recurring $2,500/mo payment link already exists for this
    # client. This script must NOT create a second subscription unless that link has been
    # cancelled and the override flag is passed explicitly.
    if a.start_subscription and not a.i_know_no_payment_link_exists:
        sys.exit("REFUSING: a live $2,500/mo payment link (plink_1TkwgvKqJSPvOjzRmrv0BCMh) is "
                 "the active billing path. Starting a subscription here would DOUBLE-bill Jared. "
                 "Cancel the payment link first, then re-run with --i-know-no-payment-link-exists.")
    need_live_key()

    cust = a.customer
    if a.create_customer:
        if not a.customer_email:
            sys.exit("--create-customer needs --customer-email")
        cust = create_customer(a.customer_email)
    if not cust:
        print("No customer id yet. Run --create-customer --customer-email <jared> first.")
        return
    start_subscription(cust, a.anchor, a.start_subscription)


if __name__ == "__main__":
    main()
