'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  project_type: string;
  budget: string;
  timeline: string;
  created_at: string;
  updated_at: string;
}

interface Update {
  id: number;
  title: string;
  content: string;
  update_type: string;
  created_at: string;
}

interface Message {
  id: number;
  content: string;
  sender: string;
  read: number;
  created_at: string;
}

const UPDATE_ICONS: Record<string, string> = {
  progress: '&#9889;',
  milestone: '&#127942;',
  deliverable: '&#128230;',
  blocker: '&#9888;&#65039;',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  inquiry: { label: 'Inquiry Received', color: 'text-yellow-400 bg-yellow-500/10' },
  quoted: { label: 'Quote Sent', color: 'text-blue-400 bg-blue-500/10' },
  in_progress: { label: 'In Progress', color: 'text-circuit-400 bg-circuit-500/10' },
  review: { label: 'In Review', color: 'text-purple-400 bg-purple-500/10' },
  completed: { label: 'Completed', color: 'text-green-400 bg-green-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-500/10' },
};

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/portal/projects/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.project);
      setUpdates(data.updates);
      setMessages(data.messages);
    } else if (res.status === 401) {
      window.location.href = '/portal';
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await fetch('/api/portal/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: Number(id), content: newMessage }),
    });
    setNewMessage('');
    setSending(false);
    fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-500 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-circuit-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-carbon-500 flex items-center justify-center text-white">
        <p>Project not found.</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[project.status] || STATUS_LABELS.inquiry;

  return (
    <div className="min-h-screen bg-carbon-500 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/dashboard" className="text-gray-400 hover:text-white transition">
            &larr; Back
          </Link>
          <Link href="/" className="text-xl font-bold font-mono">
            Circuit<span className="text-circuit-400">Coders</span>
          </Link>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Project Header */}
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-bold">{project.title}</h1>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          {project.description && <p className="text-gray-300 mb-4">{project.description}</p>}
          <div className="flex gap-6 text-sm text-gray-400">
            <span>Type: <span className="text-white capitalize">{project.project_type}</span></span>
            {project.budget && <span>Budget: <span className="text-white">{project.budget}</span></span>}
            {project.timeline && <span>Timeline: <span className="text-white">{project.timeline}</span></span>}
            <span>Started: <span className="text-white">{new Date(project.created_at).toLocaleDateString()}</span></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Updates Timeline */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold mb-4">Project Updates</h2>
            {updates.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-gray-500">No updates yet. We&apos;ll post updates here as work progresses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {updates.map(u => (
                  <div key={u.id} className="glass-card rounded-xl p-4 border-l-2 border-circuit-500/40">
                    <div className="flex items-center gap-2 mb-2">
                      <span dangerouslySetInnerHTML={{ __html: UPDATE_ICONS[u.update_type] || UPDATE_ICONS.progress }} />
                      <h3 className="font-medium text-white">{u.title}</h3>
                      <span className="text-xs text-gray-500 capitalize px-2 py-0.5 rounded bg-white/10">{u.update_type}</span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{u.content}</p>
                    <p className="text-xs text-gray-500 mt-2">{new Date(u.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Messages</h2>
            <div className="glass-card rounded-xl overflow-hidden flex flex-col" style={{ maxHeight: '500px' }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No messages yet. Send one below!</p>
                )}
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      m.sender === 'customer'
                        ? 'bg-circuit-500/20 text-circuit-100'
                        : 'bg-white/10 text-gray-200'
                    }`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${m.sender === 'customer' ? 'text-circuit-500/60' : 'text-gray-500'}`}>
                        {m.sender === 'admin' ? 'Circuit Coders' : 'You'} &middot; {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="border-t border-white/10 p-3 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 caret-circuit-500 focus:border-circuit-400 focus:outline-none"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
