'use client';

import { useMemo, useState, type CSSProperties } from 'react';

export type Module = { id: string; label: string; price: number; note?: string; recommended?: boolean };
export type Pricing = {
  basePrice: number; baseLabel: string; baseIncludes: string[];
  includedSeats: number; perSeat: number; modules: Module[]; freeNote?: string; trialDays?: number;
};

export default function PricingBuilder({
  pricing, accent, accentSoft, dealer, email,
}: {
  pricing: Pricing; accent: string; accentSoft: string; dealer: string; email: string;
}) {
  const ink = '#18181b', body = '#52525c', line = '#e8e8ec';
  const [seats, setSeats] = useState(pricing.includedSeats);
  const [picked, setPicked] = useState<Set<string>>(
    () => new Set(pricing.modules.filter(m => m.recommended).map(m => m.id)));

  const extraSeats = Math.max(0, seats - pricing.includedSeats);
  const seatCost = extraSeats * pricing.perSeat;
  const addOns = pricing.modules.filter(m => picked.has(m.id));
  const addOnCost = addOns.reduce((s, m) => s + m.price, 0);
  const total = pricing.basePrice + seatCost + addOnCost;

  const toggle = (id: string) =>
    setPicked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const trial = pricing.trialDays ?? 14;
  const mailto = useMemo(() => {
    const lines = [
      `Hi Leo — I'd like to start the ${trial}-day free trial for ${dealer} on this plan:`,
      ``,
      `• ${seats} employees`,
      ...addOns.map(m => `• ${m.label}`),
      ``,
      `After the trial: $${total}/mo. Let's set it up.`,
    ];
    return `mailto:${email}?subject=${encodeURIComponent(
      `LotHours ${trial}-day trial for ${dealer} — $${total}/mo plan`)}&body=${encodeURIComponent(lines.join('\n'))}`;
  }, [dealer, seats, addOns, total, email, trial]);

  const card: CSSProperties = { border: `1px solid ${line}`, borderRadius: 14, background: '#fff' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
      {/* Builder */}
      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: ink }}>Starts with {pricing.baseLabel}</span>
          <span style={{ fontSize: 15, color: body }}>${pricing.basePrice}/mo base</span>
        </div>
        <div style={{ fontSize: 13.5, color: body, lineHeight: 1.6, marginBottom: 20 }}>
          {pricing.baseIncludes.join(' · ')}
        </div>

        {/* Seats */}
        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 18, marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: ink }}>Employees</div>
              <div style={{ fontSize: 12.5, color: body }}>
                {pricing.includedSeats} included · ${pricing.perSeat}/mo each beyond
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, border: `1px solid ${line}`, borderRadius: 8, padding: 3 }}>
              <button onClick={() => setSeats(s => Math.max(1, s - 5))} style={stepBtn(ink)}>–</button>
              <input value={seats} onChange={e => setSeats(Math.max(1, Math.min(999, +e.target.value || 0)))}
                style={{ width: 46, textAlign: 'center', border: 'none', outline: 'none', fontSize: 15, fontWeight: 600, color: ink, background: 'transparent' }} />
              <button onClick={() => setSeats(s => s + 5)} style={stepBtn(ink)}>+</button>
            </div>
          </div>
        </div>

        {/* Modules */}
        <div style={{ marginTop: 14 }}>
          {pricing.modules.map(m => {
            const on = picked.has(m.id);
            return (
              <button key={m.id} onClick={() => toggle(m.id)} style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '13px 14px', marginTop: 10, cursor: 'pointer', borderRadius: 10,
                border: `1px solid ${on ? accent : line}`, background: on ? accentSoft : '#fff',
                transition: 'all .12s',
              }}>
                <span style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: 5, marginTop: 1,
                  border: `1.5px solid ${on ? accent : '#c4c4cc'}`, background: on ? accent : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>}
                </span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 14.5, fontWeight: 600, color: ink }}>{m.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: on ? accent : body, whiteSpace: 'nowrap' }}>+${m.price}/mo</span>
                  </span>
                  {m.note && <span style={{ display: 'block', fontSize: 12.5, color: body, marginTop: 2 }}>{m.note}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live total */}
      <div style={{ ...card, padding: 24, position: 'sticky', top: 20 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: body, fontWeight: 600 }}>
          {dealer} · monthly
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, margin: '8px 0 2px' }}>
          <span style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.03em', color: ink }}>${total}</span>
          <span style={{ fontSize: 16, color: body }}>/mo</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: accent, background: accentSoft, borderRadius: 999, padding: '4px 10px' }}>
            {trial}-day free trial
          </span>
        </div>
        <div style={{ fontSize: 13, color: body, marginBottom: 18 }}>
          {seats} employees{addOns.length ? ` · ${addOns.length} add-on${addOns.length > 1 ? 's' : ''}` : ''} · billed after your free trial
        </div>
        <div style={{ borderTop: `1px solid ${line}`, paddingTop: 14, fontSize: 13, color: body, lineHeight: 1.9 }}>
          <Row l={`${pricing.baseLabel} base`} r={`$${pricing.basePrice}`} />
          {seatCost > 0 && <Row l={`${extraSeats} extra employees`} r={`$${seatCost}`} />}
          {addOns.map(m => <Row key={m.id} l={m.label} r={`$${m.price}`} />)}
        </div>
        <a href={mailto} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 18,
          background: accent, color: '#fff', fontWeight: 500, fontSize: 15, padding: '12px 20px',
          borderRadius: 6, textDecoration: 'none',
        }}>Start your {trial}-day free trial →</a>
        <div style={{ fontSize: 12, color: '#71717a', marginTop: 10, textAlign: 'center' }}>
          No credit card to start · cancel anytime
        </div>
        {pricing.freeNote && <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8, textAlign: 'center' }}>{pricing.freeNote}</div>}
      </div>
    </div>
  );
}

function Row({ l, r }: { l: string; r: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
      <span style={{ fontWeight: 600, color: '#18181b', whiteSpace: 'nowrap' }}>{r}</span>
    </div>
  );
}

function stepBtn(ink: string): CSSProperties {
  return { width: 30, height: 28, border: 'none', background: 'transparent', cursor: 'pointer',
    fontSize: 18, color: ink, borderRadius: 6, lineHeight: 1 };
}
