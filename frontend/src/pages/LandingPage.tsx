import React from 'react';
import {
  Wrench,
  QrCode,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Server,
  Layers,
  Camera,
  Users
} from 'lucide-react';
import { PageId } from '../components/Navbar';
import { Ticket } from '../types/ticket';

interface LandingPageProps {
  setCurrentPage: (page: PageId) => void;
  onOpenArchModal: () => void;
  tickets: Ticket[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  setCurrentPage,
  onOpenArchModal,
  tickets,
}) => {
  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'RESOLVED').length;
  const escalated = tickets.filter(t => t.status === 'ESCALATED').length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50/40 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 text-indigo-800 text-xs font-semibold border border-indigo-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Smart Campus Facilities Management</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span className="text-indigo-600 font-bold">AWS Step Functions Powered</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Report it. Track it.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Fix it.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Broken lights, sparking fans, water leakage, or offline Wi-Fi?
              CampusFix AI bridges students and facility teams with instant QR reporting, photographic proof,
              and <strong>automated SLA escalation workflows</strong> that hold administrators accountable.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCurrentPage('report')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
              >
                <Camera className="w-4 h-4" />
                Report an Issue Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => setCurrentPage('qr')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 transition"
              >
                <QrCode className="w-4 h-4 text-indigo-600" />
                Scan Campus QR Code
              </button>

              <button
                onClick={() => setCurrentPage('admin')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Users className="w-4 h-4" />
                Facility Admin Console
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-2xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Total Tickets Logged</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-2xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{resolutionRate}%</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Resolved on SLA</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-2xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">{escalated}</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Auto-Escalated</div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/80 shadow-2xs">
                <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">60s</div>
                <div className="text-xs font-medium text-slate-500 mt-0.5">Demo SLA Window</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution Statement */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              The Campus Infrastructure Dilemma
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
              Why do campus repairs take weeks while nobody takes responsibility?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Traditional campus maintenance relies on paper registers at guard desks or lost WhatsApp messages.
              Complaints lack photo evidence, precise room coordinates, or accountability.
              When an issue goes unassigned, nobody notices until an accident happens.
            </p>
            <div className="space-y-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">✕</div>
                <span>Lost complaints and zero transparent status updates for students.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">✕</div>
                <span>Maintenance staff lack photographic evidence or exact room numbers.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">✕</div>
                <span>Zero escalation mechanism when high-priority hazards are neglected.</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-navy-950 text-white shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                The CampusFix AI Breakthrough
              </div>
              <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                AWS Step Functions
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight">
              Self-Enforcing SLA Accountability
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The moment a student submits a report, an AWS Step Functions execution begins an active SLA countdown.
              If the facilities administration does not triage and resolve the issue before the timer lapses,
              the state machine triggers a Lambda escalation function that flags the incident directly to department deans.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Real Serverless Backend
              </span>
              <button
                onClick={onOpenArchModal}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Inspect SAM Architecture →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Frictionless Flow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">How CampusFix AI Works</h2>
          <p className="text-sm text-slate-600">
            From scanning the QR code in your lab to automated resolution verification in 4 effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-premium transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Scan & Snap</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan the location QR code affixed in any lab, classroom, or hostel. Building and room are pre-filled automatically.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <QrCode className="w-3.5 h-3.5" /> Instant Geo-Context
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-premium transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">S3 Photo Evidence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload clear photo evidence directly to secure Amazon S3 via time-limited presigned PUT URLs with zero credentials exposed.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
              <Camera className="w-3.5 h-3.5" /> Secure Presigned S3
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-premium transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Step Functions SLA</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                An active AWS Step Functions state machine waits for the 60s demo SLA window, continually evaluating ticket status.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-violet-600">
              <Clock className="w-3.5 h-3.5" /> Active Timer Guard
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-card hover:shadow-premium transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparent Fix</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students track live timeline changes. If SLA is breached, automatic escalation forces prompt resolution with supervisor oversight.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" /> Public Accountability
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Platform Capabilities
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">Engineered for Enterprise Campus Operations</h2>
          <p className="text-sm text-slate-600">
            Every feature is backed by real AWS cloud services, designed with accessibility and speed in mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Campus Location QR Generator</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate scannable, high-res QR codes for any lecture hall, laboratory, or dorm room.
              Facilities teams can print them directly for physical signage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Automated Step Functions Escalation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminate neglected tickets forever. Configurable SLA triggers Lambda to change status to ESCALATED
              and dispatches high-priority incident notifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Campus Health Analytics</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Executive heatmaps show recurring issue hotspots across campus buildings, category breakdowns,
              and average time to resolution.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Server className="w-4 h-4" />
              AWS Serverless Architecture (Mumbai ap-south-1)
            </div>
            <h3 className="text-2xl font-bold">
              Built on SAM, DynamoDB, Lambda, and Step Functions
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Inspect the AWS SAM template, Step Functions ASL definition, DynamoDB schema,
              and least-privilege IAM policies directly within the interactive architecture viewer.
            </p>
          </div>
          <button
            onClick={onOpenArchModal}
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition whitespace-nowrap"
          >
            Explore AWS Architecture →
          </button>
        </div>
      </section>
    </div>
  );
};
