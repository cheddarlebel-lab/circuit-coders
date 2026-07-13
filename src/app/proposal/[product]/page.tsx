import { ensureDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Cfg = {
  brand: string; accent: string; eyebrow: string; headline: string;
  intro: string; points: { h: string; d: string }[]; cta: string; email: string;
};

const PRODUCTS: Record<string, Cfg> = {
  lothours: {
    brand: 'LotHours', accent: '#2f6bff', eyebrow: 'Proposal · Dealership Operations',
    headline: 'Stop paying for hours nobody worked.',
    intro:
      'LotHours puts a geofence around your lot. Techs, porters, and sales staff clock ' +
      'in and out automatically the moment they arrive or leave — no punch clock to game, ' +
      'no Friday timesheet guesswork, and a clean record if a labor claim ever lands.',
    points: [
      { h: 'Automatic, location-verified clock-in', d: 'Staff are on the clock only when they are physically on your lot. Buddy-punching ends.' },
      { h: 'Payroll that reconciles itself', d: 'Hours flow straight to a dashboard your office manager approves in minutes, not hours.' },
      { h: 'A defensible paper trail', d: 'Every shift is time- and location-stamped — the record you want if a wage dispute shows up.' },
      { h: 'Live in a week, works on the phones they already carry', d: 'No hardware to buy, no kiosk to install.' },
    ],
    cta: 'Book a 10-minute demo', email: 'leo@lothours.com',
  },
  circuit_coders: {
    brand: 'Circuit Coders', accent: '#2fbf71', eyebrow: 'Proposal · Websites & AI Reception',
    headline: 'Every missed call is a job that walked.',
    intro:
      'Circuit Coders builds the website and the AI receptionist that answers every call, ' +
      'books the estimate, and texts the customer back — so nothing slips while you are under a car.',
    points: [
      { h: 'An AI receptionist that never misses', d: 'Answers 24/7, books appointments, and captures the lead even after hours.' },
      { h: 'A site that actually brings work in', d: 'Fast, mobile, built to rank locally and turn visitors into booked jobs.' },
      { h: 'Set up for you, start to finish', d: 'We handle the build, the copy, and the phone integration.' },
    ],
    cta: 'See it on a quick call', email: 'leo@circuitcoders.com',
  },
  lanetab: {
    brand: 'LaneTab', accent: '#ffb020', eyebrow: 'Proposal · Lane-Side Ordering',
    headline: 'Turn every lane into a table that orders itself.',
    intro:
      'LaneTab lets bowlers scan a QR code and order food and drinks right from the lane. ' +
      'Orders print straight to your kitchen — no server run, higher checks, staff freed for the desk.',
    points: [
      { h: 'Order from the lane, pay on the phone', d: 'Guests never leave their game; you never miss the round they would have skipped.' },
      { h: 'Straight to the kitchen printer', d: 'Tickets fire automatically — no relay, no lost orders.' },
      { h: 'Live in days on your existing setup', d: 'Just QR codes on the tables and a printer you already have.' },
    ],
    cta: 'See the live demo', email: 'leo@lanetab.com',
  },
};

export default async function ProposalPage({
  params, searchParams,
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { product } = await params;
  const { ref } = await searchParams;
  const cfg = PRODUCTS[product] ?? PRODUCTS.lothours;

  let name: string | null = null;
  if (ref) {
    try {
      const db = await ensureDb();
      const row = (await db.execute({
        sql: 'SELECT name FROM outreach_prospects WHERE track_token = ? LIMIT 1',
        args: [ref],
      })).rows[0] as unknown as { name: string } | undefined;
      name = row?.name ?? null;
    } catch { /* fall back to generic */ }
  }

  const subject = encodeURIComponent(`${cfg.brand} — ${name ?? 'quick question'}`);
  const mailto = `mailto:${cfg.email}?subject=${subject}`;

  return (
    <main style={{ minHeight: '100vh', background: '#0b0d10', color: '#e9edf1',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', padding: '0 20px' }}>
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '72px 0 96px' }}>
        <div style={{ fontSize: 12.5, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: cfg.accent, fontWeight: 700, marginBottom: 22 }}>{cfg.brand}</div>
        <div style={{ fontSize: 12.5, color: '#8b93a0', marginBottom: 10 }}>{cfg.eyebrow}</div>
        <h1 style={{ fontSize: 34, lineHeight: 1.15, fontWeight: 800, letterSpacing: '-0.02em',
          margin: '0 0 18px' }}>{cfg.headline}</h1>

        {name && (
          <p style={{ fontSize: 15, color: '#aeb6c2', margin: '0 0 26px' }}>
            Prepared for <span style={{ color: '#e9edf1', fontWeight: 600 }}>{name}</span>.
          </p>
        )}

        <p style={{ fontSize: 16.5, lineHeight: 1.6, color: '#c7cdd6', margin: '0 0 36px' }}>
          {cfg.intro}
        </p>

        <div style={{ borderTop: '1px solid #1c2029' }}>
          {cfg.points.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '20px 0',
              borderBottom: '1px solid #1c2029' }}>
              <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                background: cfg.accent + '22', color: cfg.accent, fontWeight: 700, fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.h}</div>
                <div style={{ fontSize: 14.5, lineHeight: 1.55, color: '#9aa2ae' }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <a href={mailto} style={{ display: 'inline-block', background: cfg.accent, color: '#07090c',
            fontWeight: 700, fontSize: 15, padding: '13px 24px', borderRadius: 10,
            textDecoration: 'none' }}>{cfg.cta} →</a>
          <span style={{ fontSize: 14, color: '#8b93a0' }}>
            or reply to the email — it comes straight to me.
          </span>
        </div>

        <div style={{ marginTop: 56, paddingTop: 22, borderTop: '1px solid #1c2029',
          fontSize: 13, color: '#6f7784' }}>
          Leo · {cfg.brand} · <a href={mailto} style={{ color: '#8b93a0' }}>{cfg.email}</a>
        </div>
      </div>
    </main>
  );
}
