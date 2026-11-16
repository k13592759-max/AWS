import React from 'react';
import { Wrench, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import { PageId } from './Navbar';

interface FooterProps {
  setCurrentPage: (page: PageId) => void;
  onOpenArchModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, onOpenArchModal }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-white tracking-tight">
                CampusFix <span className="text-indigo-400">AI</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Report it. Track it. Fix it. Intelligent campus infrastructure issue reporting,
              transparent tracking, and automated AWS Step Functions SLA escalation.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              AWS Serverless Architecture • ap-south-1
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Campus Portals</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentPage('student')} className="hover:text-white transition">
                  Student Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('report')} className="hover:text-white transition">
                  Report Campus Issue
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('qr')} className="hover:text-white transition">
                  QR Code Location Hub
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('track')} className="hover:text-white transition">
                  Track Ticket Status
                </button>
              </li>
            </ul>
          </div>

          {/* Administration & Operations */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Facility Ops</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentPage('admin')} className="hover:text-white transition">
                  Admin Resolution Console
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('escalations')} className="hover:text-white transition">
                  SLA Escalation Queue
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('analytics')} className="hover:text-white transition">
                  Campus Health Analytics
                </button>
              </li>
              <li>
                <button onClick={onOpenArchModal} className="hover:text-white flex items-center gap-1 transition">
                  Serverless Architecture <ExternalLink className="w-3 h-3 text-indigo-400" />
                </button>
              </li>
            </ul>
          </div>

          {/* Tech Stack Summary */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Enterprise Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {['AWS Lambda', 'DynamoDB', 'Step Functions', 'API Gateway', 'Amazon S3', 'Python 3.12', 'React 18', 'TypeScript', 'Tailwind CSS'].map(
                (tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700"
                  >
                    {tech}
                  </span>
                )
              )}
            </div>
            <p className="mt-3 text-[11px] text-slate-500">
              Zero hardcoded credentials. Least-privilege IAM policies. S3 presigned PUT workflows.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} CampusFix AI. Built with precision for modern university ecosystems.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              SLA Guarantee Engine
            </span>
            <span>•</span>
            <span>Region: Mumbai (ap-south-1)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
