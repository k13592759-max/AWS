import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Layers,
  MapPin,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Ticket, TicketCategory } from '../types/ticket';
import { getCategoryMeta } from '../components/CategoryIcon';
import { StatusBadge } from '../components/StatusBadge';
import { PageId } from '../components/Navbar';

interface AnalyticsPageProps {
  tickets: Ticket[];
  setSelectedTicketId: (id: string) => void;
  setCurrentPage: (page: PageId) => void;
  systemStatus?: any;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  tickets,
  setSelectedTicketId,
  setCurrentPage,
  systemStatus,
}) => {
  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'PENDING').length;
  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const escalationRate = total > 0 ? Math.round((escalated / total) * 100) : 0;

  // Real Category Breakdown
  const categoryCounts: Record<string, number> = {};
  tickets.forEach(t => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const categoryEntries = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Real Building Distribution
  const buildingCounts: Record<string, number> = {};
  tickets.forEach(t => {
    buildingCounts[t.building] = (buildingCounts[t.building] || 0) + 1;
  });
  const buildingEntries = Object.entries(buildingCounts).sort((a, b) => b[1] - a[1]);

  // Real Recent Activity Timeline (top 8 latest events across all tickets)
  const recentEvents: { ticketId: string; title: string; status: string; timestamp: string; actor: string; note: string }[] = [];
  tickets.forEach(t => {
    (t.timeline || []).forEach(e => {
      recentEvents.push({
        ticketId: t.ticketId,
        title: t.title,
        status: e.status,
        timestamp: e.timestamp,
        actor: e.actor,
        note: e.note,
      });
    });
  });

  recentEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const displayEvents = recentEvents.slice(0, 7);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              Campus Intelligence
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">
              {systemStatus?.hasAwsCredentials ? 'Live AWS DynamoDB Aggregates' : 'Live Campus Database Aggregates (Local Mode)'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Infrastructure Health Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time incident metrics, category distribution, campus building repair hot-spots, and SLA compliance rates.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Logged</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-slate-900">{total}</div>
          <p className="text-[11px] text-slate-400 mt-1">Campus issues across all blocks</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Resolution Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-3xl font-black text-emerald-600">{resolutionRate}%</div>
          <p className="text-[11px] text-emerald-600/80 mt-1">{resolved} resolved work orders</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Active Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-black text-amber-600">{pending + inProgress}</div>
          <p className="text-[11px] text-amber-600/80 mt-1">{pending} pending, {inProgress} in repair</p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700">Escalated Tickets</span>
            <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" />
          </div>
          <div className="mt-3 text-3xl font-black text-rose-600">{escalated}</div>
          <p className="text-[11px] text-rose-600/80 mt-1">{escalationRate}% breach rate</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Issues by Infrastructure Category</h2>
              <p className="text-xs text-slate-500">Breakdown of reported problems across domains</p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-600" />
          </div>

          {categoryEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No category data recorded yet.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {categoryEntries.map(([cat, count]) => {
                const { label, Icon } = getCategoryMeta(cat);
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-indigo-600" />
                        {label}
                      </span>
                      <span className="font-mono text-slate-500">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Building Hotspots */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Campus Facility Hotspots</h2>
              <p className="text-xs text-slate-500">Incident concentration by building</p>
            </div>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>

          {buildingEntries.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">No location records available.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {buildingEntries.map(([bld, count]) => {
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={bld} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="line-clamp-1">{bld}</span>
                      <span className="font-mono text-slate-500">{count} tickets</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Real Recent System Activity Audit Log */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Live Campus System Audit Trail
            </h2>
            <p className="text-xs text-slate-500">Real-time status changes, triage events, and automated SLA escalations</p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {systemStatus?.hasAwsCredentials ? 'AWS DynamoDB Event Feed' : 'Local System Event Feed'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayEvents.map((evt, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <StatusBadge status={evt.status} size="sm" />
                <div>
                  <button
                    onClick={() => {
                      setSelectedTicketId(evt.ticketId);
                      setCurrentPage('track');
                    }}
                    className="font-bold text-slate-900 hover:text-indigo-600 transition"
                  >
                    {evt.ticketId} • {evt.title}
                  </button>
                  <p className="text-[11px] text-slate-500 mt-0.5">{evt.note}</p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 sm:text-right shrink-0">
                <span className="font-medium text-slate-600 block">{evt.actor}</span>
                <span>{new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
