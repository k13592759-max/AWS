import React, { useState } from 'react';
import {
  LayoutDashboard,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
  Check,
  Edit3,
  MapPin,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  UserCheck,
  X,
  Send
} from 'lucide-react';
import { Ticket, TicketStatus, TicketPriority } from '../types/ticket';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryPill } from '../components/CategoryIcon';
import { PageId } from '../components/Navbar';

interface AdminDashboardProps {
  tickets: Ticket[];
  loading?: boolean;
  onUpdateTicket: (ticketId: string, updates: any) => Promise<any>;
  setSelectedTicketId: (id: string) => void;
  setCurrentPage: (page: PageId) => void;
  systemStatus?: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tickets,
  loading = false,
  onUpdateTicket,
  setSelectedTicketId,
  setCurrentPage,
  systemStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Modal for updating ticket
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus] = useState<TicketStatus>('IN_PROGRESS');
  const [newPriority, setNewPriority] = useState<TicketPriority>('HIGH');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Metrics
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'PENDING').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  const openEditModal = (t: Ticket) => {
    setEditingTicket(t);
    setNewStatus(t.status);
    setNewPriority(t.priority);
    setAdminNotes(t.adminNotes || '');
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTicket) return;

    setIsUpdating(true);
    try {
      await onUpdateTicket(editingTicket.ticketId, {
        status: newStatus,
        priority: newPriority,
        adminNotes: adminNotes,
        actor: 'Campus Facilities Lead (Admin)',
        note: `Admin updated status to ${newStatus}. Notes: ${adminNotes || 'None'}`
      });
      setEditingTicket(null);
      showNotice(`Work order ${editingTicket.ticketId} updated successfully.`);
    } catch (err: any) {
      showNotice(`Update failed: ${err?.message || 'Unknown error — check backend connection.'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickResolve = async (ticket: Ticket) => {
    await onUpdateTicket(ticket.ticketId, {
      status: 'RESOLVED',
      adminNotes: 'Repairs inspected and verified by Facilities Officer.',
      actor: 'Facilities Lead',
      note: 'Issue marked resolved.'
    });
    showNotice(`Ticket ${ticket.ticketId} marked as RESOLVED.`);
  };

  const handleQuickAssign = async (ticket: Ticket) => {
    await onUpdateTicket(ticket.ticketId, {
      status: 'IN_PROGRESS',
      adminNotes: 'Field maintenance technician assigned on site.',
      actor: 'Facilities Dispatcher',
      note: 'Status advanced to In Progress.'
    });
    showNotice(`Ticket ${ticket.ticketId} assigned and set to In Progress.`);
  };

  const handleInspect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentPage('track');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-bold border border-violet-200">
              Campus Facilities Administration
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Service Level Agreement Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Facilities Management & Incident Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Triage reported defects, assign contractor crews, resolve work orders, and review Step Functions escalations.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('escalations')}
          className="px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-300 text-xs font-bold shadow-2xs hover:bg-rose-100 flex items-center gap-2 transition"
        >
          <AlertOctagon className="w-4 h-4 text-rose-600" />
          View Escalated Queue ({escalated})
        </button>
      </div>

      {/* Action Notice Notification Toast */}
      {actionNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-slate-500">Total Tickets</span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">DynamoDB Records</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-amber-700">Pending Triage</span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600">{pending}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">Requires Assignment</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-blue-700">In Progress</span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-blue-600">{inProgress}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">Under Active Repair</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <span className="text-xs font-semibold text-emerald-700">Resolved</span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600">{resolved}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Repairs Verified</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-card col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-rose-700">Escalated Tickets</span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-rose-600">{escalated}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">SLA Timeouts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, title, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Triage</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated (SLA Breached)</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="PLUMBING">Plumbing</option>
            <option value="WIFI_IT">Wi-Fi & IT</option>
            <option value="FURNITURE">Furniture</option>
            <option value="HVAC">HVAC</option>
            <option value="CLEANLINESS">Cleanliness</option>
            <option value="SAFETY_STRUCTURAL">Structural Safety</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Admin Tickets Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Campus Issues Log ({filteredTickets.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {systemStatus?.hasAwsCredentials ? 'Active AWS DynamoDB Query View' : 'Active Campus Database Query View (Local Mode)'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200/60">
              <tr>
                <th className="px-5 py-3.5">Ticket ID</th>
                <th className="px-5 py-3.5">Issue Details</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-6 w-24 bg-slate-200 rounded-md" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-40 bg-slate-200 rounded mb-1" /><div className="h-3 w-28 bg-slate-100 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="px-5 py-4"><div className="h-5 w-16 bg-slate-200 rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-7 w-20 bg-slate-100 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No tickets found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.ticketId} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleInspect(ticket.ticketId)}
                        className="font-mono font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 transition"
                      >
                        {ticket.ticketId}
                      </button>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{ticket.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ticket.description}</div>
                      <div className="mt-1">
                        <CategoryPill category={ticket.category} />
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{ticket.building}</div>
                      <div className="text-[11px] text-slate-500">{ticket.room}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                      {ticket.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleQuickResolve(ticket)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold transition"
                          title="Mark Resolved"
                        >
                          Resolve
                        </button>
                      )}

                      {ticket.status === 'PENDING' && (
                        <button
                          onClick={() => handleQuickAssign(ticket)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold transition"
                          title="Advance to In Progress"
                        >
                          Assign
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(ticket)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 font-semibold transition"
                        title="Edit Status & Notes"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Ticket Management Modal */}
      {editingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-floating border border-slate-200 w-full max-w-lg p-6 sm:p-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {editingTicket.ticketId}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Manage Work Order
                </h3>
              </div>
              <button
                onClick={() => setEditingTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Update Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                >
                  <option value="PENDING">PENDING (Awaiting Triage)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Technician Assigned)</option>
                  <option value="RESOLVED">RESOLVED (Repairs Completed)</option>
                  <option value="ESCALATED">ESCALATED (Immediate Attention)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Update Priority Urgency
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal Facilities Dispatch Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record contractor team dispatched, replacement parts ordered, or estimated time to completion..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingTicket(null)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  {isUpdating ? 'Saving...' : 'Save & Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
