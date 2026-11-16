import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  User,
  ArrowRight
} from 'lucide-react';
import { Ticket, TicketStatus } from '../types/ticket';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CategoryPill } from '../components/CategoryIcon';
import { PageId } from '../components/Navbar';

interface TicketTrackingPageProps {
  selectedTicketId: string;
  setSelectedTicketId: (id: string) => void;
  tickets: Ticket[];
  setCurrentPage: (page: PageId) => void;
}

export const TicketTrackingPage: React.FC<TicketTrackingPageProps> = ({
  selectedTicketId,
  setSelectedTicketId,
  tickets,
  setCurrentPage,
}) => {
  const [searchInput, setSearchInput] = useState(selectedTicketId || '');
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Time remaining countdown for SLA
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  // Keep activeTicket in sync with latest polling data
  useEffect(() => {
    if (selectedTicketId) {
      setSearchInput(selectedTicketId);
      const found = tickets.find(t => t.ticketId.toUpperCase() === selectedTicketId.toUpperCase());
      if (found) {
        setActiveTicket(found);
      }
    } else if (tickets.length > 0 && !activeTicket) {
      setActiveTicket(tickets[0]);
      setSearchInput(tickets[0].ticketId);
    }
  }, [selectedTicketId, tickets]);

  // SLA Countdown Timer
  useEffect(() => {
    if (!activeTicket) return;

    if (activeTicket.status === 'RESOLVED' || activeTicket.status === 'ESCALATED') {
      setSecondsRemaining(null);
      return;
    }

    const slaTotal = activeTicket.slaSeconds || 60;
    const createdTime = new Date(activeTicket.createdAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - createdTime) / 1000);
      const remaining = slaTotal - elapsed;
      setSecondsRemaining(remaining > 0 ? remaining : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeTicket]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const query = searchInput.trim().toUpperCase();
    if (!query) {
      setSearchError('Please enter a ticket ID to search.');
      return;
    }
    const found = tickets.find(t => t.ticketId.toUpperCase() === query);
    if (found) {
      setActiveTicket(found);
      setSelectedTicketId(found.ticketId);
    } else {
      setSearchError(`No ticket found matching ID "${query}". Please check the ID and try again.`);
    }
  };

  const handleCopyId = () => {
    if (!activeTicket) return;
    navigator.clipboard?.writeText(activeTicket.ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Search Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Live Ticket Status & SLA Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent real-time tracking backed by automated AWS Step Functions event audit logs.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Ticket ID (e.g., TKT-89341)"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (searchError) setSearchError(null);
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            Lookup Ticket
          </button>
        </form>
      </div>

      {/* Search Error Notice */}
      {searchError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between shadow-2xs animate-fade-in">
          <span>{searchError}</span>
          <button onClick={() => setSearchError(null)} className="text-rose-600 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Ticket Inspection Grid */}
      {activeTicket ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Ticket Details & Evidence */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-5">
              {/* ID Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base sm:text-lg font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                    {activeTicket.ticketId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy Ticket ID"
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <PriorityBadge priority={activeTicket.priority} size="md" />
                </div>

                <StatusBadge status={activeTicket.status} size="lg" />
              </div>

              {/* Title & Category */}
              <div>
                <div className="mb-2">
                  <CategoryPill category={activeTicket.category} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {activeTicket.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {activeTicket.description}
                </p>
              </div>

              {/* Location & Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Location
                  </span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{activeTicket.building}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 pl-5">{activeTicket.room}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Submission Timestamp
                  </span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{new Date(activeTicket.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 pl-5">
                    {new Date(activeTicket.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Reported By
                  </span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{activeTicket.reporterName || 'Campus Student'}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 pl-5">Authenticated User</div>
                </div>
              </div>

              {/* Photo Evidence Card */}
              {activeTicket.imageUrl && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Photographic Evidence (Amazon S3)
                  </span>
                  <div
                    onClick={() => setImageModalOpen(true)}
                    className="relative rounded-2xl overflow-hidden border border-slate-200 group cursor-pointer max-w-md shadow-sm"
                  >
                    <img
                      src={activeTicket.imageUrl}
                      alt={activeTicket.title}
                      className="w-full h-56 object-cover group-hover:scale-102 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Eye className="w-4 h-4" /> Click to view full image
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Notes If Present */}
            {activeTicket.adminNotes && (
              <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1">
                <span className="font-bold text-indigo-900 uppercase tracking-wider">
                  Facilities Administration Dispatch Note
                </span>
                <p className="text-indigo-800 leading-relaxed font-medium">
                  {activeTicket.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: SLA Progress & Audit Timeline */}
          <div className="space-y-6">
            {/* SLA Escalation Progress Box */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-bold text-sm text-slate-900">SLA Enforcement</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  AWS Step Functions
                </span>
              </div>

              {activeTicket.status === 'RESOLVED' ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-emerald-800">SLA Met & Verified</p>
                  <p className="text-[11px] text-emerald-600">
                    Repairs completed and closed prior to SLA escalation threshold.
                  </p>
                </div>
              ) : activeTicket.status === 'ESCALATED' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-center space-y-1 animate-pulse">
                  <AlertOctagon className="w-8 h-8 text-rose-600 mx-auto" />
                  <p className="text-xs font-bold text-rose-800">SLA Breached & Escalated</p>
                  <p className="text-[11px] text-rose-700">
                    {activeTicket.escalationReason || 'Automatic Step Functions escalation triggered due to resolution SLA timeout.'}
                  </p>
                  {activeTicket.escalatedAt && (
                    <span className="text-[10px] font-mono text-rose-600 block mt-1">
                      Escalated: {new Date(activeTicket.escalatedAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Resolution SLA Countdown</span>
                    <span className="font-mono font-bold text-indigo-600 text-sm">
                      {secondsRemaining !== null ? `${secondsRemaining}s` : '60s'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${
                          secondsRemaining !== null
                            ? Math.max(0, Math.min(100, (secondsRemaining / (activeTicket.slaSeconds || 60)) * 100))
                            : 100
                        }%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    If facilities staff do not mark this ticket resolved within the timer, AWS Step Functions will automatically escalate it.
                  </p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                <span>Status History Timeline</span>
                <span className="text-xs text-slate-400 font-normal">
                  {activeTicket.timeline?.length || 1} Events
                </span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(activeTicket.timeline || []).map((entry, idx) => (
                  <div key={idx} className="relative">
                    {/* Bullet */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                        entry.status === 'RESOLVED'
                          ? 'bg-emerald-600 text-white'
                          : entry.status === 'ESCALATED'
                          ? 'bg-rose-600 text-white'
                          : entry.status === 'IN_PROGRESS'
                          ? 'bg-blue-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      •
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          {entry.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                        {entry.note}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 italic">
                        By {entry.actor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-3">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No ticket selected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Enter a valid ticket ID above or click on any ticket in your dashboard.
          </p>
        </div>
      )}

      {/* Full-Screen Image Modal */}
      {imageModalOpen && activeTicket?.imageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-floating border border-slate-800">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeTicket.imageUrl}
              alt={activeTicket.title}
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};
