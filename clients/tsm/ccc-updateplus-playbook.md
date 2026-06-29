# CCC ONE UpdatePlus — Setup Playbook (TSM Collision)

**Why:** UpdatePlus delivers BOTH of our modules natively — repair-status texts AND review requests with **built-in Google Reviews** — from the shop's own number. No Twilio needed. (Twilio review-engine in `review-engine/` = backup only.)

## What UpdatePlus does for us
- **Repair-status texts:** auto-sends customers updates when a repair order is created, timeline/ETA changes, or the job is marked complete.
- **CSI survey within 2 days of completion** → **can route happy customers to a Google review** (the whole point). Sent by text or email per customer preference.
- Reporting on sends/responses (Carwise/UpdatePlus reporting).

## ⚠️ Confirm first (when logged in)
1. **Is UpdatePlus active on Efrain's plan?** It's a paid CCC add-on ("low fixed monthly subscription"). If not enabled, find the cost to turn on — it's likely cheaper/cleaner than us running Twilio, and it's the right call. Flag the number to Efrain.
2. **Google Reviews toggle** present in the CSI settings.

## Setup steps (do when Leo is home + logged in)
**Path A (cccone.com web):** Site Navigation Menu → **Settings** → **UpdatePlus** tile → enable **Appointment message**, **Repair Status messaging**, and **CSI messaging** (status + CSI must be enabled together).
**Path B (desktop):** Configure → Profiles → select TSM facility profile → Edit → **UpdatePlus** (under Repair Management) → **Activate** under Repair Status and CSI.

Then:
3. **Enable Google Reviews** in the CSI settings → point it at the TSM Google Business Profile.
4. Set the **Default rule** (applies to all workfiles unless an insurer overrides). Tune timing/frequency of status texts (don't over-text — daily updates can annoy; set to key milestones + completion).
5. **CSI timing:** send within ~1–2 days of completion (when satisfaction is highest).
6. Review/edit **message templates** (Configure → custom message templates) for warm, on-brand TSM wording.

## Data hygiene (this is what makes it actually fire)
UpdatePlus only sends if, on each workfile's **Contacts tab**: vehicle owner **first + last name**, a **valid cell**, and **communication preference = Text** (or Email) are filled in. → Coach the front desk to always capture cell + set Text preference at intake. This is the #1 reason shops get "missing status messages."

## Our deliverable (reframed)
Not "build a texter" — it's: **enable + configure UpdatePlus, turn on Google Reviews, tune the rules/templates, fix the intake data habit, and report on it.** Less infra, better result, from the shop's number.

## Open
- [ ] Confirm UpdatePlus enabled + cost (when in CCC)
- [ ] Confirm Google Reviews option present + link to GBP
- [ ] Set rules + templates
- [ ] Brief front desk on capturing cell + Text preference

Sources: cccis.com UpdatePlus + help.cccis.com UpdatePlus setup job aids.
