import React from 'react';
import { TicketStatus } from '../types/ticket';
import { Clock, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = (status || 'PENDING').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  }[size];

  switch (normalized) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-amber-500'} />
          Pending Triage
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses}`}>
          <RefreshCw className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-blue-600'} animate-spin`} style={{ animationDuration: '4s' }} />
          In Progress
        </span>
      );

    case 'RESOLVED':
      return (
        <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
          <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-emerald-600'} />
          Resolved
        </span>
      );

    case 'ESCALATED':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-300 font-bold shadow-xs ${sizeClasses} animate-pulse`}>
          <AlertOctagon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 text-rose-600'} />
          Escalated (SLA Breached)
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
