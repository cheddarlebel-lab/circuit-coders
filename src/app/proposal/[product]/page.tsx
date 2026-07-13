import type { ReactNode } from 'react';
import { ensureDb } from '@/lib/db';
import PricingBuilder, { type Pricing } from './PricingBuilder';

export const dynamic = 'force-dynamic';

type Feature = { title: string; desc: string; icon: 'pin' | 'ledger' | 'shield' | 'bolt' | 'phone' | 'globe' | 'chat' | 'chart' };
type Cfg = {
  brand: string; poweredBy?: boolean; accent: string; accentSoft: string;
  eyebrow: string; headline: string; sub: string;
  proof: string; features: Feature[]; cta: string; email: string; pricing?: Pricing;
};

const PRODUCTS: Record<string, Cfg> = {
  lothours: {
    brand: 'LotHours', poweredBy: true, accent: '#155dfc', accentSoft: 'rgba(21,93,252,0.10)',
    eyebrow: 'Proposal for',
    headline: 'Stop paying for hours nobody worked.',
    sub: 'LotHours puts a geofence around your lot. Techs, porters, and sales staff clock in and out automatically the moment they arrive or leave — no punch clock to game, no Friday timesheet guesswork, and a clean record if a labor claim ever lands.',
    proof: 'Built for car dealerships · Payroll-grade compliance across iOS, Android & Wear OS',
    features: [
      { icon: 'pin', title: 'Geofenced, location-verified clock-in', desc: 'Polygon geofences around the actual lot — showroom, service, and parts. Staff are on the clock only when they are physically there. Buddy-punching ends.' },
      { icon: 'ledger', title: 'Payroll that reconciles itself', desc: 'Every shift flows straight to a dashboard your office manager approves in minutes, not hours. Flat-rate overtime is computed on real clock hours.' },
      { icon: 'shield', title: 'A defensible paper trail', desc: 'Each clock event captures location accuracy, battery, and timestamp — the audit-ready record you want the day a wage dispute or comp claim shows up.' },
      { icon: 'bolt', title: 'Live on your lot in under a week', desc: 'Runs on the phones your team already carries, plus Apple Watch and Wear OS. No hardware to buy, no kiosk to bolt to a wall.' },
    ],
    cta: 'Book a 10-minute demo', email: 'leo@lothours.com',
    pricing: {
      basePrice: 199, baseLabel: 'Basic', trialDays: 14,
      unit: { label: 'Employees', included: 20, per: 5 },
      baseIncludes: ['Geofenced auto clock-in/out', 'Timesheets & payroll-ready exports', 'Team messaging + two-way SMS', 'Scheduling, shifts & cover requests'],
      modules: [
        { id: 'multirooftop', label: 'Multi-rooftop administration & cross-site analytics', price: 79, note: 'For dealer groups running more than one store.' },
        { id: 'overtime', label: 'Predictive overtime & California meal-break alerts', price: 39, recommended: true },
        { id: 'integrations', label: 'Direct payroll, DMS & CRM integrations', price: 59, recommended: true },
        { id: 'api', label: 'API access & priority support', price: 79 },
      ],
      freeNote: 'Or start free forever — the Free plan covers up to 5 employees at $0.',
    },
  },
  circuit_coders: {
    brand: 'Circuit Coders', accent: '#0a7d33', accentSoft: 'rgba(10,125,51,0.10)',
    eyebrow: 'Proposal for',
    headline: 'Every missed call is a job that walked.',
    sub: 'Circuit Coders builds the website and the AI receptionist that answers every call, books the estimate, and texts the customer back — so nothing slips while you are heads-down on the work.',
    proof: 'Websites · Local SEO · AI receptionists — built for local businesses',
    features: [
      { icon: 'phone', title: 'An AI receptionist that never misses', desc: 'Answers 24/7 in a natural voice, books the appointment, and captures the lead — even after hours and on the calls you would have sent to voicemail.' },
      { icon: 'globe', title: 'A site that actually brings work in', desc: 'Fast, mobile, and built to rank locally — designed to turn the people already searching for you into booked jobs, not bounces.' },
      { icon: 'chat', title: 'Every lead followed up, automatically', desc: 'Missed calls get an instant text back. Inquiries route straight to you. No lead sits unanswered while you are on a job.' },
      { icon: 'bolt', title: 'Built for you, start to finish', desc: 'We handle the design, the copy, and the phone integration. You approve it and it goes live — usually inside a week.' },
    ],
    cta: 'See it on a quick call', email: 'leo@circuitcoders.com',
    pricing: {
      basePrice: 149, baseLabel: 'Website',
      baseIncludes: ['Custom design, built for your business', 'Mobile-optimized & fast', 'Hosting, SSL & security included', 'Unlimited content edits'],
      modules: [
        { id: 'receptionist', label: 'AI receptionist — answers & books every call, 24/7', price: 149, recommended: true, note: 'Never lose a job to voicemail again.' },
        { id: 'seo', label: 'Local SEO — rank in Google Maps & local search', price: 99 },
        { id: 'textback', label: 'Missed-call text-back', price: 29, note: 'Every missed call gets an instant text back.' },
        { id: 'booking', label: 'Online booking & scheduling', price: 39 },
        { id: 'reviews', label: 'Review generation & management', price: 49 },
      ],
      offer: { badge: 'Free demo first', cta: 'Get my free demo site →', reassure: 'I build it before you pay · no long contracts' },
      freeNote: 'One flat monthly rate — no setup fees, no surprises.',
    },
  },
  lanetab: {
    brand: 'LaneTab', accent: '#d97706', accentSoft: 'rgba(217,119,6,0.10)',
    eyebrow: 'Proposal for',
    headline: 'Turn every lane into a table that orders itself.',
    sub: 'LaneTab lets bowlers scan a QR code and order food and drinks right from the lane. Tickets print straight to your kitchen — checks go up, staff stay at the desk, and nobody leaves their game to flag someone down.',
    proof: 'Lane-side ordering · Prints straight to the kitchen · Live in days',
    features: [
      { icon: 'phone', title: 'Order from the lane, pay on the phone', desc: 'Guests scan, order, and pay without leaving their game — so you never miss the round they would have skipped.' },
      { icon: 'chat', title: 'Straight to the kitchen printer', desc: 'Tickets fire automatically the moment an order is placed. No server relay, no lost orders, no walked checks.' },
      { icon: 'chart', title: 'Higher checks, freed-up staff', desc: 'Impulse rounds add up and your team stays at the desk running the house instead of running food.' },
      { icon: 'bolt', title: 'Live in days on your existing setup', desc: 'Just QR codes on the tables and a printer you already have. No new hardware, no rewiring.' },
    ],
    cta: 'See the live demo', email: 'leo@lanetab.com',
  },
};

function Icon({ name, color }: { name: Feature['icon']; color: string }) {
  const p: Record<Feature['icon'], ReactNode> = {
    pin: <><path d="M12 21s-6-5.686-6-10a6 6 0 1112 0c0 4.314-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></>,
    ledger: <><rect x="4" y="3.5" width="16" height="17" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    shield: <><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></>,
    bolt: <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8z" />,
    phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2 2A16 16 0 014.5 5.5a2 2 0 012-2z" />,
    globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.4 2.5 14.6 0 17M12 3.5c-2.5 2.4-2.5 14.6 0 17" /></>,
    chat: <path d="M4.5 6a2 2 0 012-2h11a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 4v-4H6.5a2 2 0 01-2-2V6z" />,
    chart: <><path d="M4 20V4M4 20h16" /><path d="M8 16v-4M12 16V8M16 16v-6" /></>,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {p[name]}
    </svg>
  );
}

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
    } catch { /* generic fallback */ }
  }

  const subject = encodeURIComponent(`${cfg.brand} — ${name ?? 'quick question'}`);
  const mailto = `mailto:${cfg.email}?subject=${subject}`;
  const ink = '#18181b', body = '#52525c', line = '#e8e8ec';
  const wrap = 1080;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <main style={{
        minHeight: '100vh', background: '#fff', color: ink,
        fontFamily: "'Geist', ui-sans-serif, -apple-system, 'Segoe UI', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
      }}>
        {/* Header */}
        <header style={{ borderBottom: `1px solid ${line}` }}>
          <div style={{ maxWidth: wrap, margin: '0 auto', padding: '18px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{cfg.brand}</span>
              {cfg.poweredBy && (
                <span style={{ fontSize: 10, letterSpacing: '0.09em', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase' }}>
                  Powered by Circuit Coders
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#a1a1aa', fontWeight: 600, textTransform: 'uppercase' }}>Proposal</span>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: wrap, margin: '0 auto', padding: '72px 24px 44px' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7,
              background: cfg.accentSoft, color: cfg.accent, border: `1px solid ${cfg.accent}22`,
              borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 600, marginBottom: 22 }}>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: cfg.accent }} />
              {cfg.eyebrow} {name ?? 'your team'}
            </div>
            <h1 style={{ fontSize: 52, lineHeight: 1.04, fontWeight: 600, letterSpacing: '-0.032em',
              margin: '0 0 20px', color: ink }}>{cfg.headline}</h1>
            <p style={{ fontSize: 19, lineHeight: 1.6, color: body, margin: '0 0 32px', maxWidth: 640 }}>{cfg.sub}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              <a href={mailto} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                background: cfg.accent, color: '#fff', fontWeight: 500, fontSize: 15,
                padding: '11px 20px', borderRadius: 6, textDecoration: 'none' }}>
                {cfg.cta}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
              <span style={{ fontSize: 14.5, color: '#71717a' }}>or just reply to the email — it comes straight to me.</span>
            </div>
            {cfg.pricing && (cfg.pricing.offer || cfg.pricing.trialDays) && (
              <div style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: body }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: cfg.accentSoft, color: cfg.accent, border: `1px solid ${cfg.accent}22`, borderRadius: 999, padding: '4px 10px', fontWeight: 600 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={cfg.accent} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                  {cfg.pricing.offer?.badge ?? `${cfg.pricing.trialDays}-day free trial`}
                </span>
                {cfg.pricing.offer?.reassure ?? 'no credit card to start'}
              </div>
            )}
          </div>
        </section>

        {/* Proof band */}
        <div style={{ borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, background: '#fafafa' }}>
          <div style={{ maxWidth: wrap, margin: '0 auto', padding: '15px 24px',
            fontSize: 12, letterSpacing: '0.06em', color: '#a1a1aa', fontWeight: 500, textTransform: 'uppercase', textAlign: 'center' }}>
            {cfg.proof}
          </div>
        </div>

        {/* Features */}
        <section style={{ maxWidth: wrap, margin: '0 auto', padding: '64px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '44px 56px' }}>
            {cfg.features.map((f, i) => (
              <div key={i}>
                <div style={{ width: 40, height: 40, borderRadius: 9, background: cfg.accentSoft,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon name={f.icon} color={cfg.accent} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: ink, marginBottom: 7, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 15, lineHeight: 1.6, color: body }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing configurator */}
        {cfg.pricing && (
          <section style={{ borderTop: `1px solid ${line}`, marginTop: 40, background: '#fafafa' }}>
            <div style={{ maxWidth: wrap, margin: '0 auto', padding: '60px 24px' }}>
              <div style={{ maxWidth: 640, marginBottom: 32 }}>
                <div style={{ fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase', color: cfg.accent, fontWeight: 600, marginBottom: 12 }}>Build your plan</div>
                <h2 style={{ fontSize: 34, lineHeight: 1.1, fontWeight: 600, letterSpacing: '-0.03em', margin: '0 0 12px', color: ink }}>
                  Priced for {name ?? 'you'} — not a quote you have to chase.
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: body, margin: 0 }}>
                  Start with {cfg.pricing.baseLabel}, then add only what you need.{cfg.pricing.unit ? ' Set your headcount and' : ''} toggle the modules — your monthly total updates live.
                </p>
              </div>
              <PricingBuilder pricing={cfg.pricing} accent={cfg.accent} accentSoft={cfg.accentSoft}
                dealer={name ?? 'your business'} email={cfg.email} brand={cfg.brand} />
            </div>
          </section>
        )}

        {/* Closing CTA */}
        <section style={{ maxWidth: wrap, margin: '0 auto', padding: '48px 24px 0' }}>
          <div style={{ borderTop: `1px solid ${line}`, paddingTop: 48,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: ink, marginBottom: 4 }}>
                Worth a 10-minute look?
              </div>
              <div style={{ fontSize: 15, color: body }}>I&apos;ll show you exactly how it runs on {name ?? 'your operation'} — no slides.</div>
            </div>
            <a href={mailto} style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              background: cfg.accent, color: '#fff', fontWeight: 500, fontSize: 15,
              padding: '11px 20px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {cfg.cta}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ maxWidth: wrap, margin: '0 auto', padding: '56px 24px 72px' }}>
          <div style={{ fontSize: 14, color: '#71717a' }}>
            <span style={{ color: ink, fontWeight: 600 }}>Leo Lebel</span>
            <span style={{ margin: '0 8px', color: '#d4d4d8' }}>·</span>{cfg.brand}
            <span style={{ margin: '0 8px', color: '#d4d4d8' }}>·</span>Call or text (442) 297-8170
            <span style={{ margin: '0 8px', color: '#d4d4d8' }}>·</span>
            <a href={mailto} style={{ color: cfg.accent, textDecoration: 'none' }}>{cfg.email}</a>
          </div>
        </footer>
      </main>
    </>
  );
}
