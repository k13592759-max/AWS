import React, { useState } from 'react';
import {
  PlusCircle,
  QrCode,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types/ticket';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryPill } from '../components/CategoryIcon';
import { PageId } from '../components/Navbar';

interface StudentDashboardProps {
  tickets: Ticket[];
  loading?: boolean;
  setCurrentPage: (page: PageId) => void;
  setSelectedTicketId: (id: string) => void;
  systemStatus?: any;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  tickets,
  loading = false,
  setCurrentPage,
  setSelectedTicketId,
  systemStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Metrics
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'PENDING').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.room.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTrackTicket = (id: string) => {
    setSelectedTicketId(id);
    setCurrentPage('track');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner & Quick Report Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              Student Service Portal
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Live Campus Infrastructure Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Infrastructure Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Submit broken campus facilities, monitor live repair progress, and hold administration accountable via automated SLA escalation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage('qr')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-indigo-600" />
            Scan Location QR
          </button>
          <button
            onClick={() => setCurrentPage('report')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Reports</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Campus wide logged</div>
        </div>

        {/* Pending */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-amber-600">{pending}</div>
          <div className="text-[11px] text-amber-600/80 mt-1">Awaiting triage</div>
        </div>

        {/* In Progress */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-blue-600">{inProgress}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">Crew dispatched</div>
        </div>

        {/* Resolved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolved}</div>
          <div className="text-[11px] text-emerald-600/80 mt-1">Repairs completed</div>
        </div>

        {/* Escalated */}
        <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-card col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Auto-Escalated</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-rose-600">{escalated}</div>
          <div className="text-[11px] text-rose-600/80 mt-1">SLA breach triggered</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ticket ID, title, building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl overflow-x-auto w-full sm:w-auto shadow-2xs text-xs">
          {['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {status === 'ALL' ? 'All Complaints' : status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-slate-900">
            Recent Reports ({filteredTickets.length})
          </h2>
          <span className="text-xs text-slate-500">
            {systemStatus?.hasAwsCredentials
              ? 'Live synchronized with AWS DynamoDB (ap-south-1)'
              : 'Live synchronized with Campus Database (Local Mode)'}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card animate-pulse">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="h-5 w-24 bg-slate-200 rounded-md" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-full bg-slate-100 rounded mb-1" />
                <div className="h-3 w-5/6 bg-slate-100 rounded" />
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                  <div className="h-3 w-10 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No issues found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No reported campus problems match your active filter criteria. Submit a new issue or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                onClick={() => handleTrackTicket(ticket.ticketId)}
                className="group p-5 bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-premium hover:border-indigo-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        {ticket.ticketId}
                      </span>
                      <PriorityBadge priority={ticket.priority} size="sm" />
                    </div>
                    <StatusBadge status={ticket.status} size="sm" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition line-clamp-1">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {ticket.description}
                  </p>
                </div>

                {/* Footer Meta */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      {ticket.building} • {ticket.room}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-1 transition">
                    Track <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
