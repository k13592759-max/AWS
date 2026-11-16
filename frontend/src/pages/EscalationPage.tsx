import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  PhoneCall,
  UserCheck,
  ArrowRight,
  Flame,
  Info,
  X
} from 'lucide-react';
import { Ticket } from '../types/ticket';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryPill } from '../components/CategoryIcon';
import { PageId } from '../components/Navbar';

interface EscalationPageProps {
  tickets: Ticket[];
  onUpdateTicket: (ticketId: string, updates: any) => Promise<any>;
  setSelectedTicketId: (id: string) => void;
  setCurrentPage: (page: PageId) => void;
  onOpenArchModal: () => void;
}

export const EscalationPage: React.FC<EscalationPageProps> = ({
  tickets,
  onUpdateTicket,
  setSelectedTicketId,
  setCurrentPage,
  onOpenArchModal,
}) => {
  const [notice, setNotice] = useState<string | null>(null);
  const escalatedTickets = tickets.filter(t => t.status === 'ESCALATED');

  const handleDeescalate = async (ticket: Ticket) => {
    try {
      await onUpdateTicket(ticket.ticketId, {
        status: 'RESOLVED',
        adminNotes: 'Emergency resolution confirmed by Facilities Director.',
        actor: 'Facilities Director (Emergency Ops)',
        note: 'Ticket de-escalated and resolved following priority crew deployment.'
      });
      setNotice(`Ticket ${ticket.ticketId} has been successfully de-escalated and marked as RESOLVED.`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      alert(`De-escalation failed: ${err?.message || 'Error'}`);
    }
  };

  const handleInspect = (id: string) => {
    setSelectedTicketId(id);
    setCurrentPage('track');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-navy-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-rose-800/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              High-Priority Escalation Control Room
            </span>
          </div>

          <button
            onClick={onOpenArchModal}
            className="text-xs font-medium text-slate-300 hover:text-white underline"
          >
            How Step Functions Escalation Works →
          </button>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SLA Escalated Incidents ({escalatedTickets.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            These tickets exceeded their configured resolution SLA without being resolved by routine maintenance.
            They have been automatically escalated to the University Facilities Directorate and Dean of Infrastructure
            via <strong>AWS Step Functions state machine execution</strong>.
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      {notice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-950 p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Escalated Tickets Cards */}
      {escalatedTickets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Zero Active Escalations</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            All reported campus infrastructure tickets are currently operating within their required SLA window,
            or have been resolved on schedule!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalatedTickets.map((ticket) => (
            <div
              key={ticket.ticketId}
              className="bg-white rounded-3xl border-2 border-rose-200 shadow-card hover:shadow-floating transition p-6 sm:p-8 space-y-5"
            >
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-rose-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold bg-rose-50 text-rose-800 px-3 py-1 rounded-xl border border-rose-300">
                    {ticket.ticketId}
                  </span>
                  <PriorityBadge priority={ticket.priority} size="md" />
                  <CategoryPill category={ticket.category} />
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-300 animate-pulse">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                    ESCALATED (SLA Breached)
                  </span>
                </div>
              </div>

              {/* Title & Escalation Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {ticket.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {ticket.description}
                  </p>

                  {/* Reason Callout Box */}
                  <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-1">
                    <span className="font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-600" />
                      Escalation Trigger Reason
                    </span>
                    <p className="text-rose-800 font-medium leading-relaxed">
                      {ticket.escalationReason || 'Automatic Step Functions timeout: unresolved after SLA window.'}
                    </p>
                    {ticket.escalatedAt && (
                      <span className="text-[11px] font-mono text-rose-600 block mt-1">
                        Escalated At: {new Date(ticket.escalatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metadata & Quick Actions */}
                <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs flex flex-col justify-between">
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Location
                      </span>
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                        {ticket.building} • {ticket.room}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Reported By
                      </span>
                      <div className="font-semibold text-slate-700 mt-0.5">
                        {ticket.reporterName || 'Campus Student'} ({new Date(ticket.createdAt).toLocaleDateString()})
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleDeescalate(ticket)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      De-escalate & Resolve
                    </button>

                    <button
                      onClick={() => handleInspect(ticket.ticketId)}
                      className="w-full py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl font-semibold transition flex items-center justify-center gap-1"
                    >
                      Inspect Full Audit Timeline →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
