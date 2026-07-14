'use client';

import { useMemo, useState, type CSSProperties } from 'react';

// Interactive time-theft ROI calculator for the LotHours proposal.
// Speaks the dealer's language: their headcount, their loaded rate, real dollars.
export default function RoiCalculator({
  accent, accentSoft, basePrice, included, per, dealer,
}: {
  accent: string; accentSoft: string; basePrice: number; included: number; per: number; dealer: string;
}) {
  const ink = '#18181b', body = '#52525c', line = '#e8e8ec', warn = '#d1443a';
  const [emp, setEmp] = useState(15);
  const [mins, setMins] = useState(10);
  const [rate, setRate] = useState(35);
  const WORKDAYS = 21; // avg paid workdays / month

  const { monthly, annual, cost, paybackDays } = useMemo(() => {
    const monthly = emp * (mins / 60) * rate * WORKDAYS;
    const cost = basePrice + Math.max(0, emp - included) * per;
    const dailySavings = monthly / WORKDAYS;
    const paybackDays = dailySavings > 0 ? Math.max(1, Math.ceil(cost / dailySavings)) : 0;
    return { monthly, annual: monthly * 12, cost, paybackDays };
  }, [emp, mins, rate, basePrice, included, per]);

  const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
      {/* Inputs */}
      <div style={{ border: `1px solid ${line}`, borderRadius: 14, background: '#fff', padding: 24 }}>
        <div style={{ fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#a1a1aa', fontWeight: 600, marginBottom: 18 }}>Your lot&apos;s numbers</div>
        <Field label="Hourly employees" sub="techs, porters, detailers, sales" value={emp} setValue={setEmp} min={1} max={200} step={5} accent={accent} suffix="" />
        <Field label="Minutes gamed per person / day" sub="late clock-ins, buddy-punching, long breaks" value={mins} setValue={setMins} min={1} max={60} step={5} accent={accent} suffix=" min" />
        <Field label="Loaded hourly rate" sub="wage + taxes + benefits" value={rate} setValue={setRate} min={15} max={120} step={5} accent={accent} prefix="$" />
      </div>

      {/* Result */}
      <div style={{ border: `1.5px solid ${accent}`, borderRadius: 14, background: accentSoft, padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 12.5, letterSpacing: '0.04em', textTransform: 'uppercase', color: body, fontWeight: 600 }}>
          {dealer} is losing about
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 0' }}>
          <span style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.03em', color: warn, lineHeight: 1 }}>{money(monthly)}</span>
          <span style={{ fontSize: 16, color: body }}>/mo</span>
        </div>
        <div style={{ fontSize: 14, color: body, marginTop: 6 }}>
          That&apos;s <strong style={{ color: ink }}>{money(annual)}</strong> a year walking off the lot in hours nobody worked.
        </div>

        <div style={{ borderTop: `1px solid ${accent}33`, margin: '18px 0', paddingTop: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: 14, color: body }}>
            <span>LotHours for {emp} employees</span>
            <span style={{ fontWeight: 700, color: ink }}>{money(cost)}/mo</span>
          </div>
          <div style={{ marginTop: 14, background: accent, color: '#fff', borderRadius: 10, padding: '14px 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              LotHours pays for itself in {paybackDays === 1 ? 'the first business day' : `~${paybackDays} business days`}.
            </div>
            <div style={{ fontSize: 13, opacity: 0.9, marginTop: 3 }}>
              The rest of the month — {money(monthly - cost)} — stays in your pocket.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: '#71717a', marginTop: 'auto' }}>
          Estimate only — adjust the inputs to your store. Based on {WORKDAYS} paid days/month.
        </div>
      </div>
    </div>
  );
}

function Field({
  label, sub, value, setValue, min, max, step, accent, prefix = '', suffix = '',
}: {
  label: string; sub: string; value: number; setValue: (n: number) => void;
  min: number; max: number; step: number; accent: string; prefix?: string; suffix?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: '#18181b' }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: accent, fontVariantNumeric: 'tabular-nums' }}>{prefix}{value}{suffix}</span>
      </div>
      <div style={{ fontSize: 12.5, color: '#71717a', marginBottom: 8 }}>{sub}</div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(+e.target.value)}
        style={{ width: '100%', accentColor: accent, cursor: 'pointer' } as CSSProperties} />
    </div>
  );
}
