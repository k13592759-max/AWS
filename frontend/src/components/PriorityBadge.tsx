import React from 'react';
import { TicketPriority } from '../types/ticket';
import { ShieldAlert, Flame, AlertTriangle, ArrowDown } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const p = (priority || 'MEDIUM').toUpperCase();
  const base = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs font-semibold px-2.5 py-0.5 gap-1.5';

  switch (p) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center rounded-md bg-red-100 text-red-800 border border-red-300 font-bold ${base}`}>
          <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" style={{ animationDuration: '2s' }} />
          Critical SLA
        </span>
      );
    case 'HIGH':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-100 text-amber-800 border border-amber-300 ${base}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          High Priority
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${base}`}>
          <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
          Medium Priority
        </span>
      );
    case 'LOW':
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${base}`}>
          <ArrowDown className="w-3.5 h-3.5 text-slate-500" />
          Low Priority
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${base}`}>
          {priority}
        </span>
      );
  }
};
