# Domain Audit — Toyota / Kia of Vero Beach (Saunders)
Audited 2026-06-12 via dig / whois / curl / openssl.

## Summary table

| Domain | Registrar | Expires | Web state | Mail (MX) |
|---|---|---|---|---|
| verobeachtoyota.com | Network Solutions | 2027-05-19 | **LIVE Toyota primary** (DealerOn) | Reynolds & Reynolds (reyrey.net) — active |
| kiaofverobeach.com | Network Solutions | 2028-12-16 | **LIVE Kia primary** (DealerOn) | Microsoft 365 + Helion — active |
| toyotaofverobeach.com | Network Solutions | 2027-01-15 | 301 → verobeachtoyota.com, but **HTTPS cert broken on www** | reyrey.net — present |
| toyotaofvero.com | Network Solutions | **2026-10-20** | NetSol parking error page, no real site | **M365 + Helion — mail flows** |
| verobeachkia.com | Squarespace Domains | 2027-02-06 | 301 → toyotaverobeach.com → Squarespace "Website Expired" 404 | **None** |
| toyotaverobeach.com | Squarespace Domains | 2027-02-06 | Squarespace "Website Expired" | None |
| drivevero.com | GoDaddy | 2027-04-11 | GoDaddy Website Builder placeholder | Motosnap (mx1/mx2.motosnap.com) — present |

---

## 1. verobeachtoyota.com — LIVE Toyota primary
- Registrar: Network Solutions. Created 1996-05-18, expires 2027-05-19.
- NS: dns1/dns2.dealeron.com (DealerOn-managed DNS). A: 199.232.192.247 / 199.232.196.247 (Fastly, DealerOn platform).
- Web: HTTPS 200 on www, headers `x-dealeron: PROD-NGINX-EXT-2-Platform`. Title: "New & Pre-Owned Toyota Dealership In Vero Beach, FL | Toyota of Vero Beach".
- MX: `verobeachtoyota.com.inbounda/b.reyrey.net` (Reynolds & Reynolds). SPF present (`-all`).
- **Recommended disposition:** Keep — this is the canonical Toyota domain. Use it everywhere in NAP/citations. Renew well before May 2027.

## 2. kiaofverobeach.com — LIVE Kia primary
- Registrar: Network Solutions (NS59/60.worldnic.com — NetSol DNS, not DealerOn DNS). Created 2003-12-16, expires 2028-12-16.
- A: 199.232.192.247 (Fastly/DealerOn). Apex 301 → https://www.kiaofverobeach.com (200, DealerOn headers, valid HTTPS).
- MX: `kiaofverobeach-com.mail.protection.outlook.com` + `email.heliontechnologies.com` (Helion Technologies — dealership IT MSP). SPF includes outlook + simplepart, `-all`.
- **Recommended disposition:** Keep — canonical Kia domain. Healthy through 2028.

## 3. toyotaofverobeach.com — legacy redirect domain, BROKEN HTTPS on www
- Registrar: Network Solutions. Created 2000-01-15, expires 2027-01-15.
- NS: dns1/dns2.dealeron.com. A: four DealerOn/Fastly IPs.
- Web: apex redirects to www.verobeachtoyota.com and lands fine — BUT `www.toyotaofverobeach.com` serves a `CN=*.dealeron.com` certificate (SAN does not cover the hostname), so any HTTPS visit to www throws a browser security error. Plain-cert HEAD/GET fails (curl exit 60). Redirect only works for users who hit the apex or http.
- MX: `toyotaofverobeach.com.inbounda/b.reyrey.net` — mail routing still configured (Reynolds). SPF present.
- **Recommended disposition:** Renew + fix. Ask DealerOn to add `www.toyotaofverobeach.com` to their cert/SAN provisioning so the 301 → verobeachtoyota.com works over HTTPS. Keep MX as-is. Easy win to flag in the sprint.

## 4. toyotaofvero.com — email-only domain, NO website, expires Oct 2026
- Registrar: Network Solutions. Created 2006-10-20, **expires 2026-10-20 (4 months out)**.
- NS: ns73/74.worldnic.com. A: 208.91.197.27 (Network Solutions parking — serves "Error. Page cannot be displayed." on port 80; HTTPS doesn't respond).
- MX: **present and resolving** — `email.heliontechnologies.com` (pri 0) + `toyotaofvero-com.mail.protection.outlook.com` (pri 10). SPF record with M365 + Helion IPs, `-all`, plus two MS verification TXTs. **Mail flows — this is the live staff email domain seen on Kia staff addresses.**
- **Recommended disposition:** RENEW IMMEDIATELY (multi-year) — staff email dies in October otherwise. Keep MX untouched; add a trivial web 301 → verobeachtoyota.com (one A/CNAME + redirect at the host or via DealerOn) so the domain printed on staff email signatures actually resolves.

## 5. verobeachkia.com — expired Squarespace site, broken redirect chain
- Registrar: Squarespace Domains LLC (privacy-redacted). Created 2025-02-06, registration paid through 2027-02-06. Last updated 2026-01-22 (when the site lapsed).
- NS: ns-cloud-b*.googledomains.com (Squarespace-managed). A: 198.185.159.145 (Squarespace).
- Web: 301 → https://toyotaverobeach.com/ which itself returns a Squarespace "Website Expired" 404. So the redirect chain dead-ends on an expired sibling site.
- MX: none. TXT: none. No mail role.
- **Recommended disposition:** Keep the registration (already paid to Feb 2027) but repoint: 301 verobeachkia.com → kiaofverobeach.com (and kill the dependence on the dead Squarespace site). Zero ongoing cost; protects the brand-match keyword domain.

## 6. toyotaverobeach.com — expired Squarespace sibling (discovered during audit)
- Registrar: Squarespace Domains LLC. Created 2025-02-06 (same minute as verobeachkia.com), expires 2027-02-06.
- NS: ns-cloud-a*.googledomains.com. A: 198.185.159.145 (Squarespace). Site: "Website Expired" page.
- No MX.
- **Recommended disposition:** Repoint 301 → verobeachtoyota.com (registration already paid). Note the one-letter-different name vs the live primary (verobeachtoyota vs toyotaverobeach) — worth controlling to prevent confusion/squatting.

## 7. drivevero.com — group/umbrella domain, placeholder site
- Registrar: GoDaddy. Created 2017-04-11, expires 2027-04-11 (renewed Dec 2025 — someone is maintaining it).
- NS: ns65/66.domaincontrol.com (GoDaddy). A: 76.223.105.230 / 13.248.243.5 (AWS Global Accelerator — GoDaddy Website Builder).
- Web: 200 OK, GoDaddy Website Builder 8.0 placeholder titled just "drivevero.com" — effectively empty.
- MX: mx1/mx2.motosnap.com (Motosnap — automotive DMS/CRM vendor), so vendor-side mail routing exists. No SPF TXT published (deliverability gap if anything sends as @drivevero.com).
- **Recommended disposition:** Keep for email (Motosnap dependency — confirm with Jared what sends through it before touching). Replace the placeholder with a simple group landing page or 301 to the Toyota primary; add an SPF record if outbound mail uses this domain.

---

## Priority actions
1. **Renew toyotaofvero.com now** (expires 2026-10-20; staff email domain).
2. **Fix www.toyotaofverobeach.com SSL** via DealerOn cert provisioning.
3. Repoint the two paid-up Squarespace domains (verobeachkia.com, toyotaverobeach.com) as 301s to the live primaries — currently they leak brand traffic into a "Website Expired" page.
4. Add web redirect on toyotaofvero.com; add SPF on drivevero.com.
