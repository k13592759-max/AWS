import React, { useState } from 'react';
import {
  Wrench,
  QrCode,
  PlusCircle,
  LayoutDashboard,
  ShieldAlert,
  BarChart3,
  Search,
  Menu,
  X,
  Server,
  UserCheck,
  GraduationCap,
  Layers
} from 'lucide-react';
import { SystemStatus } from '../types/ticket';

export type PageId =
  | 'landing'
  | 'student'
  | 'report'
  | 'qr'
  | 'track'
  | 'admin'
  | 'escalations'
  | 'analytics';

interface NavbarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  systemStatus: SystemStatus | null;
  onOpenArchModal: () => void;
  escalatedCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  isAdmin,
  setIsAdmin,
  systemStatus,
  onOpenArchModal,
  escalatedCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: PageId; label: string; icon: React.FC<{ className?: string }>; badge?: number; adminOnly?: boolean }[] = [
    { id: 'landing', label: 'Home', icon: Layers },
    { id: 'student', label: 'Student Hub', icon: GraduationCap },
    { id: 'report', label: 'Report Issue', icon: PlusCircle },
    { id: 'qr', label: 'QR Scan & Codes', icon: QrCode },
    { id: 'track', label: 'Track Ticket', icon: Search },
    { id: 'admin', label: 'Admin Console', icon: LayoutDashboard },
    {
      id: 'escalations',
      label: 'Escalations',
      icon: ShieldAlert,
      badge: escalatedCount,
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNav = (id: PageId) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  Campus<span className="text-indigo-600">Fix</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                  AI
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 tracking-tight leading-none">
                Report it. Track it. Fix it.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Architecture / AWS Region Pill */}
            <button
              onClick={onOpenArchModal}
              title="Click to view AWS Serverless Architecture"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition"
            >
              <Server className="w-3.5 h-3.5 text-indigo-600" />
              <span>ap-south-1</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            </button>

            {/* Role Switcher */}
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isAdmin
                  ? 'bg-violet-600 text-white border-violet-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {isAdmin ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Admin Mode</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student Mode</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsAdmin(!isAdmin)}
              className={`p-1.5 rounded-lg text-xs font-semibold border ${
                isAdmin ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isAdmin ? 'Admin' : 'Student'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  {item.label}
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenArchModal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 font-medium hover:bg-slate-50 rounded-lg"
            >
              <Server className="w-4 h-4 text-indigo-600" />
              View AWS Serverless Architecture
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
