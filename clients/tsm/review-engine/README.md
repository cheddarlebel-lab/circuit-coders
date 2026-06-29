# TSM Collision — Review-Request Engine

Auto-texts a customer a Google review link when their job is done. The "job done"
trigger is a simple front-desk web form — no CCC integration needed.

## Files
- `send_review_request.py` — core sender (Twilio via stdlib, dedupes, logs to `sent.jsonl`)
- `desk_server.py` — front-desk web form (`http://localhost:8077`)
- `config.example.env` — copy to `.env` and fill in
- `sent.jsonl` — every request logged (powers reporting + dedupe)

## Try it now (dry-run, no creds needed)
```
cd clients/tsm/review-engine
python3 send_review_request.py "Maria Lopez" "(951) 555-0192" --dry-run
# or the form:
python3 desk_server.py   # → http://localhost:8077  (runs in dry-run until .env is filled)
```

## TO GO LIVE (Phase-0 dependencies)
1. **Twilio account** → get `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and an SMS-capable `TWILIO_FROM` number.
2. **Google review link** from the TSM Google Business Profile (needs GBP manager access).
3. `cp config.example.env .env` and fill all four values.
4. Re-run — it now sends real texts.

## Message (editable in `send_review_request.py → build_message`)
> Hi {first name}, thank you for trusting TSM Collision with your vehicle — it was a pleasure
> taking care of you! If you have a quick moment, a short Google review means the world to our
> shop: {link}  (Reply STOP to opt out.)

## How the shop uses it
Car picked up → advisor opens the form, types name + cell, taps **Send Review Request**. Done.
Dedupe prevents texting the same number twice. Later: host the form + (optionally) auto-pull
completed jobs from the CCC login to pre-fill names.

## Compliance note
Includes "Reply STOP to opt out." Only text customers who did business with the shop. Don't bulk-blast old lists.
