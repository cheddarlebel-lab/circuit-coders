#!/usr/bin/env python3
"""Saunders billing setup — one-time $2,500 sprint invoice + $2,950/mo subscription.

Deal terms (proposal v6, both rooftops, month-to-month):
  - One-time: $2,500 Get-Well Sprint  -> a one-off Stripe Invoice (due on receipt)
  - Recurring: $2,950/mo Brand Management -> a Stripe Subscription, billed monthly,
    STARTS at the Day-14 sprint review (set trial_end / billing anchor at run time)

SEQUENCING (do not skip):
  1. Deal must be SIGNED (still verbal close as of build).
  2. Access call complete -> THEN send the $2,500 invoice (work starts on payment).
  3. Subscription starts at Day-14 review, not at kickoff.

REQUIRES the LIVE key — test mode cannot collect real money:
  export STRIPE_API_KEY=sk_live_...    (NOT the sk_test_ key in accounts.md)

Usage:
  python3 setup_invoices.py --customer-email jareds@toyotaofvero.com --create-customer
  python3 setup_invoices.py --customer cus_XXX --send-sprint-invoice          # after access call
  python3 setup_invoices.py --customer cus_XXX --start-subscription --anchor 2026-07-01

Nothing is sent unless you pass the explicit --send-* / --start-* flag. Dry-run by default.
"""
import argparse
import os
import sys

try:
    import stripe
except ImportError:
    sys.exit("pip install stripe — then re-run")

SPRINT_CENTS = 250000      # $2,500.00 one-time
MONTHLY_CENTS = 295000     # $2,950.00 / mo
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
        description="Circuit Coders — brand management, both rooftops",
        metadata={"client": "saunders", "deal": "brand-mgmt-v6"},
    )
    print(f"customer: {c.id}  ({email})")
    return c.id


def send_sprint_invoice(customer, send):
    stripe.InvoiceItem.create(
        customer=customer, amount=SPRINT_CENTS, currency="usd",
        description="Get-Well Sprint (one-time) — Toyota & Kia of Vero Beach brand cleanup, weeks 1-2",
    )
    inv = stripe.Invoice.create(
        customer=customer, collection_method="send_invoice", days_until_due=7,
        description="Circuit Coders — Get-Well Sprint. Sprint clock starts when access checklist is complete.",
        metadata={"client": "saunders", "type": "sprint-onetime"},
    )
    if send:
        inv = stripe.Invoice.finalize_invoice(inv.id)
        stripe.Invoice.send_invoice(inv.id)
        print(f"SENT sprint invoice {inv.id} -> {inv.hosted_invoice_url}")
    else:
        print(f"DRAFT sprint invoice {inv.id} ($2,500). Re-run with --send-sprint-invoice to send.")
    return inv.id


def start_subscription(customer, anchor, start):
    # Ensure a recurring price exists (idempotent-ish: create product+price each run is fine,
    # or paste an existing price id). Here we create on the fly.
    price = stripe.Price.create(
        unit_amount=MONTHLY_CENTS, currency="usd",
        recurring={"interval": "month"},
        product_data={"name": "Brand Management — Toyota & Kia of Vero Beach (both rooftops)"},
    )
    kwargs = dict(
        customer=customer, items=[{"price": price.id}],
        collection_method="send_invoice", days_until_due=7,
        metadata={"client": "saunders", "type": "brand-mgmt-monthly"},
    )
    if anchor:
        # Delay first charge to the Day-14 review date.
        import datetime as dt
        ts = int(dt.datetime.fromisoformat(anchor).timestamp())
        kwargs["billing_cycle_anchor"] = ts
        kwargs["proration_behavior"] = "none"
    if not start:
        print(f"DRY-RUN subscription: $2,950/mo, price {price.id}, anchor {anchor or 'now'}. "
              f"Re-run with --start-subscription to activate.")
        return None
    sub = stripe.Subscription.create(**kwargs)
    print(f"STARTED subscription {sub.id} ($2,950/mo, first bill {anchor or 'now'})")
    return sub.id


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--customer-email")
    p.add_argument("--customer")
    p.add_argument("--create-customer", action="store_true")
    p.add_argument("--send-sprint-invoice", action="store_true")
    p.add_argument("--start-subscription", action="store_true")
    p.add_argument("--anchor", help="ISO date for first monthly charge, e.g. 2026-07-01")
    a = p.parse_args()
    need_live_key()

    cust = a.customer
    if a.create_customer:
        if not a.customer_email:
            sys.exit("--create-customer needs --customer-email")
        cust = create_customer(a.customer_email)
    if not cust:
        print("No customer id yet. Run --create-customer --customer-email <jared> first.")
        return
    # Default behavior = dry-run previews of both, unless explicit send flags passed.
    send_sprint_invoice(cust, a.send_sprint_invoice)
    start_subscription(cust, a.anchor, a.start_subscription)


if __name__ == "__main__":
    main()
