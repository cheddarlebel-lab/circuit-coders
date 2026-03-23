'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  status: string;
  project_type: string;
  customer_name: string;
  customer_email: string;
  company: string;
  budget: string;
  timeline: string;
  unread_messages: number;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  content: string;
  sender: string;
  customer_name: string;
  customer_email: string;
  project_title: string;
  project_id: number;
  read: number;
  created_at: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
  project_count: number;
  unread_messages: number;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-yellow-500/20 text-yellow-400',
  quoted: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-circuit-500/20 text-circuit-400',
  review: 'bg-purple-500/20 text-purple-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<'projects' | 'messages' | 'customers'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<number | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<Message | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', company: '' });
  const [newProject, setNewProject] = useState({ customer_id: '', title: '', description: '', project_type: 'software', budget: '', timeline: '' });
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '', update_type: 'progress' });
  const [replyContent, setReplyContent] = useState('');
  const [statusEdit, setStatusEdit] = useState<{ id: number; status: string } | null>(null);

  const fetchAll = useCallback(async () => {
    const [pRes, mRes, cRes] = await Promise.all([
      fetch('/api/admin/projects'),
      fetch('/api/admin/messages'),
      fetch('/api/admin/customers'),
    ]);
    if (pRes.ok) setProjects(await pRes.json());
    if (mRes.ok) setMessages(await mRes.json());
    if (cRes.ok) setCustomers(await cRes.json());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });
    if (res.ok) {
      setShowNewCustomer(false);
      setNewCustomer({ name: '', email: '', company: '' });
      fetchAll();
    }
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProject, customer_id: Number(newProject.customer_id) }),
    });
    if (res.ok) {
      setShowNewProject(false);
      setNewProject({ customer_id: '', title: '', description: '', project_type: 'software', budget: '', timeline: '' });
      fetchAll();
    }
  }

  async function updateStatus(id: number, status: string) {
    await fetch(`/api/admin/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setStatusEdit(null);
    fetchAll();
  }

  async function postUpdate(projectId: number) {
    await fetch(`/api/admin/projects/${projectId}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUpdate),
    });
    setShowUpdateModal(null);
    setNewUpdate({ title: '', content: '', update_type: 'progress' });
    fetchAll();
  }

  async function markRead(ids: number[]) {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    fetchAll();
  }

  async function sendReply(msg: Message) {
    await fetch('/api/admin/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: msg.project_id, customer_id: Number(msg.customer_email ? customers.find(c => c.email === msg.customer_email)?.id : 0), content: replyContent }),
    });
    setShowReplyModal(null);
    setReplyContent('');
    fetchAll();
  }

  const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;

  return (
    <div className="min-h-screen bg-carbon-900 text-white">
      {/* Header */}
      <header className="border-b border-carbon-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold font-mono">
            Circuit<span className="text-circuit-400">Coders</span>
          </Link>
          <span className="text-carbon-500 text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNewCustomer(true)} className="text-sm bg-carbon-700 hover:bg-carbon-600 px-3 py-1.5 rounded-lg transition">
            + Customer
          </button>
          <button onClick={() => setShowNewProject(true)} className="text-sm bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-3 py-1.5 rounded-lg transition">
            + Project
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-carbon-700 px-6">
        <div className="flex gap-6">
          {(['projects', 'messages', 'customers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition capitalize ${
                tab === t ? 'border-circuit-400 text-circuit-400' : 'border-transparent text-carbon-400 hover:text-white'
              }`}
            >
              {t}
              {t === 'messages' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-6xl mx-auto">
        {/* Projects Tab */}
        {tab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 && <p className="text-carbon-500 text-center py-12">No projects yet</p>}
            {projects.map(p => (
              <div key={p.id} className="glass-card rounded-xl p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-white truncate">{p.title}</h3>
                    {statusEdit?.id === p.id ? (
                      <select
                        value={statusEdit.status}
                        onChange={e => setStatusEdit({ ...statusEdit, status: e.target.value })}
                        onBlur={() => updateStatus(p.id, statusEdit.status)}
                        className="bg-carbon-800 border border-carbon-600 text-sm rounded px-2 py-0.5 text-white"
                        autoFocus
                      >
                        {Object.keys(STATUS_COLORS).map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setStatusEdit({ id: p.id, status: p.status })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-carbon-700 text-carbon-300'}`}
                      >
                        {p.status.replace('_', ' ')}
                      </button>
                    )}
                    {p.unread_messages > 0 && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                        {p.unread_messages} new msg{p.unread_messages > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-carbon-400">
                    {p.customer_name} {p.company && `(${p.company})`} &middot; {p.project_type} &middot; {p.budget || 'No budget'} &middot; {p.timeline || 'No timeline'}
                  </p>
                  <p className="text-xs text-carbon-500 mt-1">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setShowUpdateModal(p.id)}
                  className="text-sm bg-carbon-700 hover:bg-carbon-600 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                >
                  Post Update
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Messages Tab */}
        {tab === 'messages' && (
          <div className="space-y-2">
            {messages.length === 0 && <p className="text-carbon-500 text-center py-12">No messages yet</p>}
            {messages.map(m => (
              <div
                key={m.id}
                className={`glass-card rounded-xl p-4 flex items-start justify-between gap-4 ${!m.read && m.sender === 'customer' ? 'border-l-2 border-circuit-400' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.sender === 'admin' ? 'bg-circuit-500/20 text-circuit-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {m.sender}
                    </span>
                    <span className="text-sm font-medium text-white">{m.customer_name}</span>
                    {m.project_title && <span className="text-xs text-carbon-500">re: {m.project_title}</span>}
                  </div>
                  <p className="text-sm text-carbon-300 line-clamp-2">{m.content}</p>
                  <p className="text-xs text-carbon-500 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {!m.read && m.sender === 'customer' && (
                    <button onClick={() => markRead([m.id])} className="text-xs text-carbon-400 hover:text-white transition">
                      Mark read
                    </button>
                  )}
                  {m.sender === 'customer' && (
                    <button onClick={() => setShowReplyModal(m)} className="text-xs bg-circuit-500/20 text-circuit-400 hover:bg-circuit-500/30 px-2 py-1 rounded transition">
                      Reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customers Tab */}
        {tab === 'customers' && (
          <div className="space-y-3">
            {customers.length === 0 && <p className="text-carbon-500 text-center py-12">No customers yet</p>}
            {customers.map(c => (
              <div key={c.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{c.name}</h3>
                    {c.company && <span className="text-xs text-carbon-500">({c.company})</span>}
                  </div>
                  <p className="text-sm text-carbon-400">{c.email}</p>
                  <p className="text-xs text-carbon-500 mt-1">{c.project_count} project{c.project_count !== 1 ? 's' : ''} &middot; Joined {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                {c.unread_messages > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                    {c.unread_messages} unread
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <Modal onClose={() => setShowNewCustomer(false)} title="Add Customer">
          <form onSubmit={addCustomer} className="space-y-3">
            <Input label="Name" value={newCustomer.name} onChange={v => setNewCustomer({ ...newCustomer, name: v })} required />
            <Input label="Email" type="email" value={newCustomer.email} onChange={v => setNewCustomer({ ...newCustomer, email: v })} required />
            <Input label="Company" value={newCustomer.company} onChange={v => setNewCustomer({ ...newCustomer, company: v })} />
            <button type="submit" className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2 rounded-lg transition">
              Add Customer
            </button>
          </form>
        </Modal>
      )}

      {/* New Project Modal */}
      {showNewProject && (
        <Modal onClose={() => setShowNewProject(false)} title="Create Project">
          <form onSubmit={addProject} className="space-y-3">
            <div>
              <label className="text-sm text-carbon-300 block mb-1">Customer</label>
              <select
                value={newProject.customer_id}
                onChange={e => setNewProject({ ...newProject, customer_id: e.target.value })}
                className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none"
                required
              >
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <Input label="Title" value={newProject.title} onChange={v => setNewProject({ ...newProject, title: v })} required />
            <div>
              <label className="text-sm text-carbon-300 block mb-1">Description</label>
              <textarea
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-carbon-300 block mb-1">Type</label>
                <select
                  value={newProject.project_type}
                  onChange={e => setNewProject({ ...newProject, project_type: e.target.value })}
                  className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none"
                >
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                  <option value="integrated">Integrated</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
              <Input label="Budget" value={newProject.budget} onChange={v => setNewProject({ ...newProject, budget: v })} />
            </div>
            <Input label="Timeline" value={newProject.timeline} onChange={v => setNewProject({ ...newProject, timeline: v })} />
            <button type="submit" className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2 rounded-lg transition">
              Create Project
            </button>
          </form>
        </Modal>
      )}

      {/* Post Update Modal */}
      {showUpdateModal && (
        <Modal onClose={() => setShowUpdateModal(null)} title="Post Project Update">
          <div className="space-y-3">
            <Input label="Title" value={newUpdate.title} onChange={v => setNewUpdate({ ...newUpdate, title: v })} required />
            <div>
              <label className="text-sm text-carbon-300 block mb-1">Update</label>
              <textarea
                value={newUpdate.content}
                onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none resize-none"
                rows={4}
                placeholder="What's new on this project..."
              />
            </div>
            <div>
              <label className="text-sm text-carbon-300 block mb-1">Type</label>
              <select
                value={newUpdate.update_type}
                onChange={e => setNewUpdate({ ...newUpdate, update_type: e.target.value })}
                className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none"
              >
                <option value="progress">Progress</option>
                <option value="milestone">Milestone</option>
                <option value="deliverable">Deliverable</option>
                <option value="blocker">Blocker</option>
              </select>
            </div>
            <button
              onClick={() => postUpdate(showUpdateModal)}
              className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2 rounded-lg transition"
            >
              Post Update
            </button>
          </div>
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <Modal onClose={() => setShowReplyModal(null)} title={`Reply to ${showReplyModal.customer_name}`}>
          <div className="space-y-3">
            <div className="bg-carbon-800 rounded-lg p-3 text-sm text-carbon-300 border-l-2 border-carbon-600">
              {showReplyModal.content}
            </div>
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white focus:border-circuit-400 focus:outline-none resize-none"
              rows={4}
              placeholder="Type your reply..."
              autoFocus
            />
            <button
              onClick={() => sendReply(showReplyModal)}
              className="w-full bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold py-2 rounded-lg transition"
            >
              Send Reply
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-carbon-800 border border-carbon-700 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-carbon-400 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-sm text-carbon-300 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-carbon-800 border border-carbon-700 rounded-lg px-4 py-2.5 text-white placeholder-carbon-500 focus:border-circuit-400 focus:outline-none transition"
        required={required}
      />
    </div>
  );
}
