import React from 'react';
import { TicketCategory } from '../types/ticket';
import {
  Zap,
  Droplets,
  Wifi,
  Armchair,
  Wind,
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface CategoryIconProps {
  category: TicketCategory | string;
  className?: string;
}

export const getCategoryMeta = (category: TicketCategory | string) => {
  const c = (category || 'OTHER').toUpperCase();
  switch (c) {
    case 'ELECTRICAL':
      return {
        label: 'Electrical',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
        Icon: Zap
      };
    case 'PLUMBING':
      return {
        label: 'Plumbing & Water',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        Icon: Droplets
      };
    case 'WIFI_IT':
      return {
        label: 'Wi-Fi & Network',
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        Icon: Wifi
      };
    case 'FURNITURE':
      return {
        label: 'Furniture & Desks',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        Icon: Armchair
      };
    case 'HVAC':
      return {
        label: 'HVAC & Cooling',
        color: 'text-teal-600 bg-teal-50 border-teal-200',
        Icon: Wind
      };
    case 'CLEANLINESS':
      return {
        label: 'Sanitation & Hygiene',
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        Icon: Sparkles
      };
    case 'SAFETY_STRUCTURAL':
      return {
        label: 'Structural & Safety',
        color: 'text-rose-600 bg-rose-50 border-rose-200',
        Icon: ShieldAlert
      };
    default:
      return {
        label: 'General Facility',
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        Icon: HelpCircle
      };
  }
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-4 h-4' }) => {
  const { Icon } = getCategoryMeta(category);
  return <Icon className={className} />;
};

export const CategoryPill: React.FC<{ category: TicketCategory | string }> = ({ category }) => {
  const { label, color, Icon } = getCategoryMeta(category);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${color}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  );
};
