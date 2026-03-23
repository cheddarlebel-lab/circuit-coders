'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      setError('Invalid password');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-carbon-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white font-mono">
            Circuit<span className="text-circuit-400">Coders</span>
          </h1>
          <p className="text-carbon-400 text-sm mt-2">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 rounded-xl space-y-4">
          <div>
            <label className="text-sm text-carbon-300 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white placeholder-carbon-500 focus:border-circuit-400 focus:outline-none transition"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
