'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  status: string;
  project_type: string;
  budget: string;
  timeline: string;
  update_count: number;
  unread_replies: number;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  inquiry: { label: 'Inquiry Received', color: 'text-yellow-400', icon: '&#128172;' },
  quoted: { label: 'Quote Sent', color: 'text-blue-400', icon: '&#128196;' },
  in_progress: { label: 'In Progress', color: 'text-circuit-400', icon: '&#9889;' },
  review: { label: 'In Review', color: 'text-purple-400', icon: '&#128269;' },
  completed: { label: 'Completed', color: 'text-green-400', icon: '&#9989;' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', icon: '&#10060;' },
};

const STATUS_STEPS = ['inquiry', 'quoted', 'in_progress', 'review', 'completed'];

export default function PortalDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [showPaymentBanner, setShowPaymentBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get('payment');
    if (p) { setPaymentStatus(p); setShowPaymentBanner(true); }
  }, []);

  const fetchProjects = useCallback(async () => {
    const res = await fetch('/api/portal/projects');
    if (res.ok) setProjects(await res.json());
    else if (res.status === 401) window.location.href = '/portal';
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-circuit-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-500 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold font-mono">
            Circuit<span className="text-circuit-400">Coders</span>
          </Link>
          <span className="text-gray-500 text-sm">My Projects</span>
        </div>
        {showPaymentBanner && paymentStatus === 'success' && (
          <div className="bg-circuit-500/20 text-circuit-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            Payment received! Your project is now in production.
            <button onClick={() => setShowPaymentBanner(false)} className="text-circuit-500/60 hover:text-circuit-400">&times;</button>
          </div>
        )}
        {showPaymentBanner && paymentStatus === 'cancelled' && (
          <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            Payment was cancelled. You can pay later from your project page.
            <button onClick={() => setShowPaymentBanner(false)} className="text-yellow-500/60 hover:text-yellow-400">&times;</button>
          </div>
        )}
        <button
          onClick={() => { document.cookie = 'cc_customer=; Max-Age=0; path=/'; window.location.href = '/portal'; }}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Sign Out
        </button>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">&#128640;</p>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-gray-400 mb-6">Once you submit an inquiry, your project will appear here.</p>
            <Link href="/#contact" className="bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-6 py-2.5 rounded-lg transition inline-block">
              Start a Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map(p => {
              const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.inquiry;
              const stepIndex = STATUS_STEPS.indexOf(p.status);

              return (
                <Link key={p.id} href={`/portal/project/${p.id}`} className="block">
                  <div className="glass-card rounded-xl p-5 hover:border-circuit-500/30 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-circuit-400 transition">{p.title}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">{p.project_type} &middot; {p.budget || 'TBD'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.unread_replies > 0 && (
                          <span className="text-xs bg-circuit-500/20 text-circuit-400 px-2 py-1 rounded-full">
                            {p.unread_replies} new update{p.unread_replies > 1 ? 's' : ''}
                          </span>
                        )}
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          <span dangerouslySetInnerHTML={{ __html: statusInfo.icon }} /> {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {p.status !== 'cancelled' && (
                      <div className="flex gap-1">
                        {STATUS_STEPS.map((step, i) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition ${
                              i <= stepIndex ? 'bg-circuit-400' : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{p.update_count} update{p.update_count !== 1 ? 's' : ''}</span>
                      <span>Started {new Date(p.created_at).toLocaleDateString()}</span>
                      <span>Last activity {new Date(p.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
