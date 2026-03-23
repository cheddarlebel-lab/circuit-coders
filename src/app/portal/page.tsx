'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PortalLogin() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/customer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold font-mono text-white">
            Circuit<span className="text-circuit-400">Coders</span>
          </Link>
          <p className="text-carbon-400 text-sm mt-2">Client Portal</p>
        </div>

        {sent ? (
          <div className="glass-card p-6 rounded-xl text-center">
            <div className="text-3xl mb-3">&#9889;</div>
            <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
            <p className="text-sm text-carbon-400">
              We sent a login link to <span className="text-circuit-400">{email}</span>. Click it to access your portal.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-sm text-carbon-500 hover:text-white mt-4 transition"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl space-y-4">
            <div>
              <label className="text-sm text-carbon-300 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white placeholder-carbon-500 focus:border-circuit-400 focus:outline-none transition"
                placeholder="your@email.com"
                required
                autoFocus
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Login Link'}
            </button>

            <p className="text-xs text-carbon-500 text-center">
              No password needed. We&apos;ll email you a secure login link.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
