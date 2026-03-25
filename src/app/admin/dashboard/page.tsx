'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const LeadMap = dynamic(() => import('@/components/LeadMap'), { ssr: false });

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

interface SeoCampaign {
  id: number;
  name: string;
  client_name: string | null;
  website_url: string | null;
  target_keywords: string | null;
  status: string;
  monthly_budget: string | null;
  start_date: string | null;
  notes: string | null;
  da_score: number | null;
  organic_traffic: number | null;
  keywords_ranked: number | null;
  backlinks: number | null;
  created_at: string;
  updated_at: string;
}

const SEO_STATUS_COLORS: Record<string, string> = {
  planning: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-circuit-500/20 text-circuit-400',
  paused: 'bg-orange-500/20 text-orange-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  area_code: string | null;
  city: string | null;
  created_at: string;
  project_id: number;
  project_title: string;
  project_type: string;
  budget: string;
  timeline: string;
  status: string;
  description: string;
  inquiry_date: string;
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
  const [tab, setTab] = useState<'leads' | 'seo' | 'projects' | 'messages' | 'customers'>('leads');
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [editingLead, setEditingLead] = useState<{ id: number; area_code: string; city: string } | null>(null);
  const [seoCampaigns, setSeoCampaigns] = useState<SeoCampaign[]>([]);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', client_name: '', website_url: '', target_keywords: '', monthly_budget: '', start_date: '', notes: '' });
  const [editingCampaign, setEditingCampaign] = useState<SeoCampaign | null>(null);
  const [editingMetrics, setEditingMetrics] = useState<{ id: number; da_score: string; organic_traffic: string; keywords_ranked: string; backlinks: string } | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<number | null>(null);
  const [showReplyModal, setShowReplyModal] = useState<Message | null>(null);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', company: '' });
  const [newProject, setNewProject] = useState({ customer_id: '', title: '', description: '', project_type: 'software', budget: '', timeline: '' });
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '', update_type: 'progress' });
  const [replyContent, setReplyContent] = useState('');
  const [statusEdit, setStatusEdit] = useState<{ id: number; status: string } | null>(null);

  const fetchLeads = useCallback(async (search = '') => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/admin/leads${q}`);
    if (res.ok) setLeads(await res.json());
  }, []);

  const fetchAll = useCallback(async () => {
    const [pRes, mRes, cRes, sRes] = await Promise.all([
      fetch('/api/admin/projects'),
      fetch('/api/admin/messages'),
      fetch('/api/admin/customers'),
      fetch('/api/admin/seo-campaigns'),
    ]);
    if (pRes.ok) setProjects(await pRes.json());
    if (mRes.ok) setMessages(await mRes.json());
    if (cRes.ok) setCustomers(await cRes.json());
    if (sRes.ok) setSeoCampaigns(await sRes.json());
    fetchLeads();
    setLoading(false);
  }, [fetchLeads]);

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

  async function deleteMessage(id: number) {
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this project and all its messages/updates?')) return;
    await fetch('/api/admin/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  async function updateLeadStatus(projectId: number, status: string) {
    await fetch(`/api/admin/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchAll();
    fetchLeads(leadSearch);
  }

  async function addCampaign(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/seo-campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCampaign),
    });
    if (res.ok) {
      setShowNewCampaign(false);
      setNewCampaign({ name: '', client_name: '', website_url: '', target_keywords: '', monthly_budget: '', start_date: '', notes: '' });
      fetchAll();
    }
  }

  async function updateCampaign(id: number, updates: Record<string, unknown>) {
    await fetch('/api/admin/seo-campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    setEditingCampaign(null);
    setEditingMetrics(null);
    fetchAll();
  }

  async function deleteCampaign(id: number) {
    await fetch('/api/admin/seo-campaigns', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchAll();
  }

  async function saveLeadLocation(customerId: number, area_code: string, city: string) {
    await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: customerId, area_code, city }),
    });
    setEditingLead(null);
    fetchLeads(leadSearch);
  }

  function handleLeadSearch(value: string) {
    setLeadSearch(value);
    fetchLeads(value);
  }

  const unreadCount = messages.filter(m => !m.read && m.sender === 'customer').length;
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const activeCampaigns = seoCampaigns.filter(c => c.status === 'active').length;

  async function handleLogout() {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/admin';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-500 flex items-center justify-center admin-page">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-circuit-500/30 border-t-circuit-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm font-mono">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-carbon-500 text-gray-100 admin-page">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold font-mono">
              Circuit<span className="text-circuit-400">Coders</span>
            </Link>
            <span className="text-xs font-mono bg-circuit-500/15 text-circuit-400 px-2 py-0.5 rounded-full border border-circuit-500/20">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowNewCampaign(true)} className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition font-medium">
              + Campaign
            </button>
            <button onClick={() => setShowNewCustomer(true)} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition font-medium">
              + Customer
            </button>
            <button onClick={() => setShowNewProject(true)} className="text-sm bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-3 py-1.5 rounded-lg transition">
              + Project
            </button>
            <div className="w-px h-6 bg-white/10 mx-1"></div>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white px-2 py-1.5 transition" title="Sign out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3l3-3m0 0l-3-3m3 3H9" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Leads</p>
            <p className="text-2xl font-bold text-white mt-1">{leads.length}</p>
            <p className="text-xs text-yellow-400 mt-1">inquiry stage</p>
          </div>
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Projects</p>
            <p className="text-2xl font-bold text-white mt-1">{activeProjects}</p>
            <p className="text-xs text-circuit-400 mt-1">in progress</p>
          </div>
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Customers</p>
            <p className="text-2xl font-bold text-white mt-1">{customers.length}</p>
            <p className="text-xs text-gray-500 mt-1">total</p>
          </div>
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Unread</p>
            <p className="text-2xl font-bold text-white mt-1">{unreadCount}</p>
            <p className="text-xs text-red-400 mt-1">{unreadCount > 0 ? 'needs attention' : 'all caught up'}</p>
          </div>
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">SEO Campaigns</p>
            <p className="text-2xl font-bold text-white mt-1">{activeCampaigns}</p>
            <p className="text-xs text-blue-400 mt-1">active</p>
          </div>
          <div className="glass-card rounded-xl p-4 hover:border-circuit-500/20 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Projects</p>
            <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
            <p className="text-xs text-gray-500 mt-1">all time</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 px-6">
        <div className="max-w-7xl mx-auto flex gap-6">
          {(['leads', 'seo', 'projects', 'messages', 'customers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition capitalize ${
                tab === t ? 'border-circuit-400 text-circuit-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {t === 'seo' ? 'SEO' : t}
              {t === 'seo' && seoCampaigns.filter(c => c.status === 'active').length > 0 && (
                <span className="ml-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">{seoCampaigns.filter(c => c.status === 'active').length}</span>
              )}
              {t === 'leads' && leads.length > 0 && (
                <span className="ml-2 bg-yellow-500 text-carbon-900 text-xs px-1.5 py-0.5 rounded-full font-semibold">{leads.length}</span>
              )}
              {t === 'messages' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Leads Tab */}
        {tab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={leadSearch}
                  onChange={e => handleLeadSearch(e.target.value)}
                  placeholder="Search by area code, city, name, or company..."
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500 transition pl-10"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</span>
            </div>

            {leads.length === 0 && (
              <p className="text-gray-500 text-center py-12">
                {leadSearch ? 'No leads match your search' : 'No inquiry leads yet'}
              </p>
            )}

            <div className="grid gap-3">
              {leads.map(lead => (
                <div key={`${lead.id}-${lead.project_id}`} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">{lead.name}</h3>
                        {lead.company && (
                          <span className="text-sm text-gray-400">({lead.company})</span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">
                          {lead.project_type}
                        </span>
                        <select
                          value={lead.status}
                          onChange={e => updateLeadStatus(lead.project_id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-circuit-500 ${STATUS_COLORS[lead.status] || 'bg-gray-500/20 text-gray-400'}`}
                        >
                          <option value="inquiry" className="bg-carbon-400">Inquiry</option>
                          <option value="quoted" className="bg-carbon-400">Quoted</option>
                          <option value="in_progress" className="bg-carbon-400">In Progress</option>
                          <option value="review" className="bg-carbon-400">Review</option>
                          <option value="completed" className="bg-carbon-400">Completed</option>
                          <option value="cancelled" className="bg-carbon-400">Cancelled</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="text-gray-500">Email:</span>
                          <a href={`mailto:${lead.email}`} className="text-circuit-400 hover:underline">{lead.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="text-gray-500">Budget:</span>
                          <span>{lead.budget || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="text-gray-500">Timeline:</span>
                          <span>{lead.timeline || 'Not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <span className="text-gray-500">Inquiry:</span>
                          <span>{new Date(lead.inquiry_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {lead.description && (
                        <p className="text-sm text-gray-400 bg-white/5 rounded-lg p-3 mb-3 line-clamp-3">
                          {lead.description}
                        </p>
                      )}

                      {/* Area Code / City */}
                      {editingLead?.id === lead.id ? (
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={editingLead.area_code}
                            onChange={e => setEditingLead({ ...editingLead, area_code: e.target.value })}
                            placeholder="Area code"
                            className="w-28 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editingLead.city}
                            onChange={e => setEditingLead({ ...editingLead, city: e.target.value })}
                            placeholder="City"
                            className="w-40 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500"
                          />
                          <button
                            onClick={() => saveLeadLocation(lead.id, editingLead.area_code, editingLead.city)}
                            className="text-xs bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-3 py-1.5 rounded transition"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingLead(null)}
                            className="text-xs text-gray-400 hover:text-white px-2 py-1.5 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 mt-2">
                          {(lead.area_code || lead.city) ? (
                            <span className="text-sm text-gray-300">
                              <span className="text-gray-500">Location:</span>{' '}
                              {[lead.area_code, lead.city].filter(Boolean).join(' — ')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 italic">No location set</span>
                          )}
                          <button
                            onClick={() => setEditingLead({ id: lead.id, area_code: lead.area_code || '', city: lead.city || '' })}
                            className="text-xs text-circuit-400 hover:text-circuit-300 transition"
                          >
                            {lead.area_code || lead.city ? 'Edit' : '+ Add location'}
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => { if (confirm('Delete this lead and its project?')) deleteProject(lead.project_id); }}
                      className="text-red-400/60 hover:text-red-400 transition p-1.5 shrink-0"
                      title="Delete lead"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Map */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Target Map</h2>
              <LeadMap leads={leads.map(l => ({ id: l.id, name: l.name, email: l.email, company: l.company, city: l.city, area_code: l.area_code, project_type: l.project_type, budget: l.budget }))} />
            </div>
          </div>
        )}

        {/* SEO Campaigns Tab */}
        {tab === 'seo' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">SEO Campaigns</h2>
              <span className="text-sm text-gray-500">{seoCampaigns.length} campaign{seoCampaigns.length !== 1 ? 's' : ''}</span>
            </div>

            {seoCampaigns.length === 0 && (
              <p className="text-gray-500 text-center py-12">No SEO campaigns yet. Click &quot;+ SEO Campaign&quot; to create one.</p>
            )}

            <div className="grid gap-4">
              {seoCampaigns.map(c => (
                <div key={c.id} className="glass-card rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">{c.name}</h3>
                        <select
                          value={c.status}
                          onChange={e => updateCampaign(c.id, { status: e.target.value })}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium border-0 cursor-pointer ${SEO_STATUS_COLORS[c.status] || 'bg-white/10 text-gray-300'}`}
                        >
                          {Object.keys(SEO_STATUS_COLORS).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm mb-3">
                        {c.client_name && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-500">Client:</span>
                            <span>{c.client_name}</span>
                          </div>
                        )}
                        {c.website_url && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-500">Website:</span>
                            <a href={c.website_url.startsWith('http') ? c.website_url : `https://${c.website_url}`} target="_blank" rel="noopener noreferrer" className="text-circuit-400 hover:underline truncate">{c.website_url}</a>
                          </div>
                        )}
                        {c.monthly_budget && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-500">Budget:</span>
                            <span>{c.monthly_budget}/mo</span>
                          </div>
                        )}
                        {c.start_date && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-gray-500">Started:</span>
                            <span>{new Date(c.start_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {c.target_keywords && (
                        <div className="mb-3">
                          <span className="text-xs text-gray-500">Keywords:</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {c.target_keywords.split(',').map((kw, i) => (
                              <span key={i} className="text-xs bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full">{kw.trim()}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics */}
                      {editingMetrics?.id === c.id ? (
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">DA:</span>
                            <input type="number" value={editingMetrics.da_score} onChange={e => setEditingMetrics({ ...editingMetrics, da_score: e.target.value })} className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Traffic:</span>
                            <input type="number" value={editingMetrics.organic_traffic} onChange={e => setEditingMetrics({ ...editingMetrics, organic_traffic: e.target.value })} className="w-20 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Keywords:</span>
                            <input type="number" value={editingMetrics.keywords_ranked} onChange={e => setEditingMetrics({ ...editingMetrics, keywords_ranked: e.target.value })} className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Backlinks:</span>
                            <input type="number" value={editingMetrics.backlinks} onChange={e => setEditingMetrics({ ...editingMetrics, backlinks: e.target.value })} className="w-16 bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500" />
                          </div>
                          <button
                            onClick={() => updateCampaign(c.id, {
                              da_score: editingMetrics.da_score ? Number(editingMetrics.da_score) : null,
                              organic_traffic: editingMetrics.organic_traffic ? Number(editingMetrics.organic_traffic) : null,
                              keywords_ranked: editingMetrics.keywords_ranked ? Number(editingMetrics.keywords_ranked) : null,
                              backlinks: editingMetrics.backlinks ? Number(editingMetrics.backlinks) : null,
                            })}
                            className="text-xs bg-circuit-500 hover:bg-circuit-400 text-carbon-900 font-semibold px-3 py-1 rounded transition"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingMetrics(null)} className="text-xs text-gray-400 hover:text-white transition">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-4 text-sm">
                            {c.da_score != null && (
                              <span className="text-gray-300"><span className="text-gray-500">DA:</span> {c.da_score}</span>
                            )}
                            {c.organic_traffic != null && (
                              <span className="text-gray-300"><span className="text-gray-500">Traffic:</span> {c.organic_traffic.toLocaleString()}</span>
                            )}
                            {c.keywords_ranked != null && (
                              <span className="text-gray-300"><span className="text-gray-500">Ranked:</span> {c.keywords_ranked}</span>
                            )}
                            {c.backlinks != null && (
                              <span className="text-gray-300"><span className="text-gray-500">Backlinks:</span> {c.backlinks.toLocaleString()}</span>
                            )}
                          </div>
                          <button
                            onClick={() => setEditingMetrics({
                              id: c.id,
                              da_score: String(c.da_score ?? ''),
                              organic_traffic: String(c.organic_traffic ?? ''),
                              keywords_ranked: String(c.keywords_ranked ?? ''),
                              backlinks: String(c.backlinks ?? ''),
                            })}
                            className="text-xs text-circuit-400 hover:text-circuit-300 transition"
                          >
                            {(c.da_score != null || c.organic_traffic != null) ? 'Edit metrics' : '+ Add metrics'}
                          </button>
                        </div>
                      )}

                      {c.notes && (
                        <p className="text-sm text-gray-400 mt-2 italic">{c.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setEditingCampaign(c)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteCampaign(c.id)}
                        className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {tab === 'projects' && (
          <div className="space-y-3">
            {projects.length === 0 && <p className="text-gray-500 text-center py-12">No projects yet</p>}
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
                        className="bg-white/10 border border-white/20 text-sm rounded px-2 py-0.5 text-gray-100"
                        autoFocus
                      >
                        {Object.keys(STATUS_COLORS).map(s => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    ) : (
                      <button
                        onClick={() => setStatusEdit({ id: p.id, status: p.status })}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-white/10 text-gray-300'}`}
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
                  <p className="text-sm text-gray-400">
                    {p.customer_name} {p.company && `(${p.company})`} &middot; {p.project_type} &middot; {p.budget || 'No budget'} &middot; {p.timeline || 'No timeline'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowUpdateModal(p.id)}
                    className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
                  >
                    Post Update
                  </button>
                  <button
                    onClick={() => deleteProject(p.id)}
                    className="text-red-400/60 hover:text-red-400 transition p-1.5"
                    title="Delete project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages Tab */}
        {tab === 'messages' && (
          <div className="space-y-2">
            {messages.length === 0 && <p className="text-gray-500 text-center py-12">No messages yet</p>}
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
                    {m.project_title && <span className="text-xs text-gray-500">re: {m.project_title}</span>}
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{m.content}</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {!m.read && m.sender === 'customer' && (
                    <button onClick={() => markRead([m.id])} className="text-xs text-gray-400 hover:text-white transition">
                      Mark read
                    </button>
                  )}
                  {m.sender === 'customer' && (
                    <button onClick={() => setShowReplyModal(m)} className="text-xs bg-circuit-500/20 text-circuit-400 hover:bg-circuit-500/30 px-2 py-1 rounded transition">
                      Reply
                    </button>
                  )}
                  <button onClick={() => deleteMessage(m.id)} className="text-xs text-red-400/60 hover:text-red-400 transition" title="Delete message">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Customers Tab */}
        {tab === 'customers' && (
          <div className="space-y-3">
            {customers.length === 0 && <p className="text-gray-500 text-center py-12">No customers yet</p>}
            {customers.map(c => (
              <div key={c.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{c.name}</h3>
                    {c.company && <span className="text-xs text-gray-500">({c.company})</span>}
                  </div>
                  <p className="text-sm text-gray-400">{c.email}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.project_count} project{c.project_count !== 1 ? 's' : ''} &middot; Joined {new Date(c.created_at).toLocaleDateString()}</p>
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
              <label className="text-sm text-gray-300 block mb-1">Customer</label>
              <select
                value={newProject.customer_id}
                onChange={e => setNewProject({ ...newProject, customer_id: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500"
                required
              >
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <Input label="Title" value={newProject.title} onChange={v => setNewProject({ ...newProject, title: v })} required />
            <div>
              <label className="text-sm text-gray-300 block mb-1">Description</label>
              <textarea
                value={newProject.description}
                onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300 block mb-1">Type</label>
                <select
                  value={newProject.project_type}
                  onChange={e => setNewProject({ ...newProject, project_type: e.target.value })}
                  className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500"
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
              <label className="text-sm text-gray-300 block mb-1">Update</label>
              <textarea
                value={newUpdate.content}
                onChange={e => setNewUpdate({ ...newUpdate, content: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={4}
                placeholder="What's new on this project..."
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Type</label>
              <select
                value={newUpdate.update_type}
                onChange={e => setNewUpdate({ ...newUpdate, update_type: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500"
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

      {/* New SEO Campaign Modal */}
      {showNewCampaign && (
        <Modal onClose={() => setShowNewCampaign(false)} title="New SEO Campaign">
          <form onSubmit={addCampaign} className="space-y-3">
            <Input label="Campaign Name" value={newCampaign.name} onChange={v => setNewCampaign({ ...newCampaign, name: v })} required />
            <Input label="Client Name" value={newCampaign.client_name} onChange={v => setNewCampaign({ ...newCampaign, client_name: v })} />
            <Input label="Website URL" value={newCampaign.website_url} onChange={v => setNewCampaign({ ...newCampaign, website_url: v })} />
            <div>
              <label className="text-sm text-gray-300 block mb-1">Target Keywords (comma-separated)</label>
              <textarea
                value={newCampaign.target_keywords}
                onChange={e => setNewCampaign({ ...newCampaign, target_keywords: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={2}
                placeholder="seo services, web development, circuit board design..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Monthly Budget" value={newCampaign.monthly_budget} onChange={v => setNewCampaign({ ...newCampaign, monthly_budget: v })} />
              <Input label="Start Date" type="date" value={newCampaign.start_date} onChange={v => setNewCampaign({ ...newCampaign, start_date: v })} />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Notes</label>
              <textarea
                value={newCampaign.notes}
                onChange={e => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={2}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition">
              Create Campaign
            </button>
          </form>
        </Modal>
      )}

      {/* Edit SEO Campaign Modal */}
      {editingCampaign && (
        <Modal onClose={() => setEditingCampaign(null)} title="Edit Campaign">
          <form onSubmit={e => { e.preventDefault(); updateCampaign(editingCampaign.id, {
            name: editingCampaign.name,
            client_name: editingCampaign.client_name,
            website_url: editingCampaign.website_url,
            target_keywords: editingCampaign.target_keywords,
            monthly_budget: editingCampaign.monthly_budget,
            start_date: editingCampaign.start_date,
            notes: editingCampaign.notes,
          }); }} className="space-y-3">
            <Input label="Campaign Name" value={editingCampaign.name} onChange={v => setEditingCampaign({ ...editingCampaign, name: v })} required />
            <Input label="Client Name" value={editingCampaign.client_name || ''} onChange={v => setEditingCampaign({ ...editingCampaign, client_name: v })} />
            <Input label="Website URL" value={editingCampaign.website_url || ''} onChange={v => setEditingCampaign({ ...editingCampaign, website_url: v })} />
            <div>
              <label className="text-sm text-gray-300 block mb-1">Target Keywords (comma-separated)</label>
              <textarea
                value={editingCampaign.target_keywords || ''}
                onChange={e => setEditingCampaign({ ...editingCampaign, target_keywords: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Monthly Budget" value={editingCampaign.monthly_budget || ''} onChange={v => setEditingCampaign({ ...editingCampaign, monthly_budget: v })} />
              <Input label="Start Date" type="date" value={editingCampaign.start_date || ''} onChange={v => setEditingCampaign({ ...editingCampaign, start_date: v })} />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1">Notes</label>
              <textarea
                value={editingCampaign.notes || ''}
                onChange={e => setEditingCampaign({ ...editingCampaign, notes: e.target.value })}
                className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
                rows={2}
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-lg transition">
              Save Changes
            </button>
          </form>
        </Modal>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <Modal onClose={() => setShowReplyModal(null)} title={`Reply to ${showReplyModal.customer_name}`}>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3 text-sm text-gray-300 border-l-2 border-circuit-500/30">
              {showReplyModal.content}
            </div>
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 focus:border-circuit-500 focus:outline-none caret-circuit-500 resize-none"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md px-4 animate-[fadeIn_150ms_ease-out]" onClick={onClose}>
      <div className="bg-carbon-400 border border-white/15 rounded-2xl glow-border p-6 w-full max-w-lg shadow-2xl shadow-black/50 animate-[scaleIn_200ms_ease-out] admin-page" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
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
      <label className="text-sm text-gray-300 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/15 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:border-circuit-500 focus:outline-none caret-circuit-500 transition"
        required={required}
      />
    </div>
  );
}
