'use client';

import { useEffect, useMemo, useState, useCallback, type CSSProperties } from 'react';
import Link from 'next/link';

type Prospect = {
  id: number;
  product: string;
  name: string;
  contact_name: string | null;
  city: string | null;
  region: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  segment: string | null;
  status: string;
  channel: string | null;
  notes: string | null;
  last_touch_at: string | null;
};

const PRODUCTS: Record<string, { label: string; accent: string }> = {
  circuit_coders: { label: 'Circuit Coders', accent: '#2fbf71' },
  lothours: { label: 'LotHours', accent: '#5b9dff' },
  lanetab: { label: 'LaneTab', accent: '#ffb020' },
};

// Ordered pipeline stages (reached-count funnel).
const STAGES = ['not_contacted', 'sent', 'replied', 'meeting', 'won'] as const;
const STAGE_LABEL: Record<string, string> = {
  not_contacted: 'Not contacted', sent: 'Sent', replied: 'Replied',
  meeting: 'Meeting', won: 'Won', lost: 'Lost', bounced: 'Bounced',
};
const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  not_contacted: { bg: '#1a1d1a', fg: '#8b938b' },
  sent: { bg: '#152230', fg: '#5b9dff' },
  replied: { bg: '#2a2410', fg: '#ffb020' },
  meeting: { bg: '#12321f', fg: '#4fd08a' },
  won: { bg: '#0f3a1d', fg: '#2fbf71' },
  lost: { bg: '#2a1c1f', fg: '#d08a8a' },
  bounced: { bg: '#2a1c1f', fg: '#e0654b' },
};
const ALL_STATUSES = Object.keys(STATUS_STYLE);

function ago(iso: string | null): string {
  if (!iso) return '—';
  const d = (Date.now() - new Date(iso.replace(' ', 'T') + (iso.includes('Z') ? '' : 'Z')).getTime()) / 1000;
  if (isNaN(d)) return '—';
  if (d < 3600) return `${Math.max(1, Math.floor(d / 60))}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

export default function OutreachMissionControl() {
  const [rows, setRows] = useState<Prospect[] | null>(null);
  const [err, setErr] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/outreach');
    if (r.status === 401) { window.location.href = '/admin'; return; }
    if (!r.ok) { setErr('Failed to load'); return; }
    const d = await r.json();
    setRows(d.prospects as Prospect[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (id: number, status: string) => {
    setRows(rs => rs?.map(r => (r.id === id ? { ...r, status, last_touch_at: new Date().toISOString() } : r)) ?? rs);
    await fetch('/api/admin/outreach', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
  };

  const summary = useMemo(() => {
    const by: Record<string, Record<string, number>> = {};
    for (const p of rows ?? []) {
      by[p.product] ??= { total: 0 };
      by[p.product].total++;
      by[p.product][p.status] = (by[p.product][p.status] ?? 0) + 1;
    }
    return by;
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter(p =>
      (productFilter === 'all' || p.product === productFilter) &&
      (statusFilter === 'all' || p.status === statusFilter) &&
      (!needle || [p.name, p.contact_name, p.city, p.region, p.email, p.phone, p.notes]
        .some(v => v?.toLowerCase().includes(needle))));
  }, [rows, productFilter, statusFilter, q]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b0d0b', color: '#e8ece8', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 12 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>Outreach Mission Control</h1>
          <Link href="/admin/dashboard" style={{ color: '#8b938b', fontSize: 13, textDecoration: 'none' }}>← Admin</Link>
        </div>
        <p style={{ color: '#8b938b', fontSize: 13.5, marginTop: 0, marginBottom: 24 }}>
          Every prospect and every touch across Circuit Coders, LotHours &amp; LaneTab.
        </p>

        {/* Funnel cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginBottom: 28 }}>
          {Object.entries(PRODUCTS).map(([key, meta]) => {
            const s = summary[key] ?? { total: 0 };
            const base = Math.max(s.total ?? 0, 1);
            return (
              <div key={key} style={{ background: '#12151280', border: '1px solid #1f231f', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                  <span style={{ fontWeight: 800, fontSize: 15, color: meta.accent }}>{meta.label}</span>
                  <span style={{ color: '#8b938b', fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>{s.total ?? 0} prospects</span>
                </div>
                {STAGES.map(stage => {
                  const v = s[stage] ?? 0;
                  const pct = Math.round((v / base) * 100);
                  return (
                    <div key={stage} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#b6bdb6' }}>{STAGE_LABEL[stage]}</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>{v}<span style={{ color: '#6b736b', fontWeight: 500 }}> · {pct}%</span></span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: '#0b0d0b', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: meta.accent, opacity: stage === 'not_contacted' ? 0.25 : 0.9, borderRadius: 999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          {['all', ...Object.keys(PRODUCTS)].map(p => (
            <button key={p} onClick={() => setProductFilter(p)} style={pill(productFilter === p)}>
              {p === 'all' ? 'All products' : PRODUCTS[p].label}
            </button>
          ))}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All statuses</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
          <input placeholder="Search name, city, contact…" value={q} onChange={e => setQ(e.target.value)}
            style={{ ...selectStyle, flex: 1, minWidth: 180 }} />
          <span style={{ color: '#6b736b', fontSize: 12.5 }}>{filtered.length} shown</span>
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #1f231f', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#101310', color: '#8b938b', textAlign: 'left' }}>
                  {['Prospect', 'Product', 'Contact', 'Location', 'Reach', 'Status', 'Last touch'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows === null && <tr><td colSpan={7} style={{ padding: 24, color: '#8b938b' }}>Loading…</td></tr>}
                {err && <tr><td colSpan={7} style={{ padding: 24, color: '#e0654b' }}>{err}</td></tr>}
                {filtered.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid #171a17' }}>
                    <td style={{ padding: '9px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      {p.segment && <div style={{ color: '#6b736b', fontSize: 11.5 }}>{p.segment}</div>}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ color: PRODUCTS[p.product]?.accent ?? '#b6bdb6', fontSize: 12 }}>{PRODUCTS[p.product]?.label ?? p.product}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#b6bdb6' }}>{p.contact_name ?? '—'}</td>
                    <td style={{ padding: '9px 12px', color: '#b6bdb6', whiteSpace: 'nowrap' }}>{[p.city, p.region].filter(Boolean).join(', ') || '—'}</td>
                    <td style={{ padding: '9px 12px', color: '#b6bdb6', whiteSpace: 'nowrap' }}>
                      {p.email ? <div style={{ fontSize: 12 }}>{p.email}</div> : null}
                      {p.phone ? <div style={{ fontSize: 12, color: '#8b938b' }}>{p.phone}</div> : (!p.email && '—')}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <select value={p.status} onChange={e => setStatus(p.id, e.target.value)}
                        style={{ ...statusPill(p.status), cursor: 'pointer', appearance: 'none', border: 'none' }}>
                        {ALL_STATUSES.map(s => <option key={s} value={s} style={{ background: '#161a16', color: '#e8ece8' }}>{STAGE_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '9px 12px', color: '#6b736b', whiteSpace: 'nowrap' }}>{ago(p.last_touch_at)}</td>
                  </tr>
                ))}
                {rows !== null && !filtered.length && <tr><td colSpan={7} style={{ padding: 24, color: '#8b938b' }}>No prospects match.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function pill(active: boolean): CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${active ? '#2fbf71' : '#242824'}`,
    background: active ? '#123020' : '#12151280', color: active ? '#8ef0bd' : '#b6bdb6',
  };
}
const selectStyle: CSSProperties = {
  padding: '6px 10px', borderRadius: 8, fontSize: 12.5,
  background: '#12151280', color: '#e8ece8', border: '1px solid #242824',
};
function statusPill(status: string): CSSProperties {
  const st = STATUS_STYLE[status] ?? { bg: '#1a1d1a', fg: '#b6bdb6' };
  return { background: st.bg, color: st.fg, padding: '4px 9px', borderRadius: 999, fontSize: 12, fontWeight: 600 };
}
