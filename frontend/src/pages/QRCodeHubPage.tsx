import React, { useState } from 'react';
import {
  QrCode,
  MapPin,
  Sparkles,
  Download,
  ExternalLink,
  Plus,
  CheckCircle,
  Copy,
  Printer
} from 'lucide-react';
import { QRCodeSVG } from '../components/QRCodeGenerator';
import { PageId } from '../components/Navbar';

interface QRCodeHubPageProps {
  onScanLocation: (building: string, room: string) => void;
  setCurrentPage: (page: PageId) => void;
}

interface CampusSpot {
  id: string;
  building: string;
  room: string;
  zone: string;
  commonIssues: string;
}

const PRESET_SPOTS: CampusSpot[] = [
  {
    id: 'spot-1',
    building: 'Ramanujan Science Block',
    room: 'Physics Lab 304',
    zone: '3rd Floor South Wing',
    commonIssues: 'Galvanometers, AC cooling, sparking fan',
  },
  {
    id: 'spot-2',
    building: 'Ramanujan Science Block',
    room: 'Lecture Hall 204',
    zone: '2nd Floor Central',
    commonIssues: 'Projector HDMI, audio mic, bench screws',
  },
  {
    id: 'spot-3',
    building: 'Visvesvaraya Engineering Hall',
    room: 'Robotics Lab 102',
    zone: 'Ground Floor Tech Wing',
    commonIssues: 'Soldering bench ventilation, 3-phase power',
  },
  {
    id: 'spot-4',
    building: 'Visvesvaraya Engineering Hall',
    room: 'Restroom 2B',
    zone: '2nd Floor West Wing',
    commonIssues: 'Pipe leakage, flush valve, hand dryer',
  },
  {
    id: 'spot-5',
    building: 'Central Library',
    room: 'Reference Hall, 1st Floor',
    zone: 'Quiet Study Zone',
    commonIssues: 'Wi-Fi AP offline, desk power strips',
  },
  {
    id: 'spot-6',
    building: 'APJ Abdul Kalam Hostel A',
    room: 'Room 204, Wing B',
    zone: '2nd Floor Residential',
    commonIssues: 'Geyser element, tube light, door lock',
  },
  {
    id: 'spot-7',
    building: 'Campus Cafeteria & Food Court',
    room: 'Main Dining Section C',
    zone: 'Ground Floor Dining',
    commonIssues: 'Water cooler filtration, table wobble, exhaust',
  },
  {
    id: 'spot-8',
    building: 'Student Activity Center',
    room: 'Indoor Badminton Court',
    zone: 'Sports Wing',
    commonIssues: 'High-bay LED flickering, wooden court scuffs',
  },
];

export const QRCodeHubPage: React.FC<QRCodeHubPageProps> = ({
  onScanLocation,
  setCurrentPage,
}) => {
  const [customBuilding, setCustomBuilding] = useState('Central Library');
  const [customRoom, setCustomRoom] = useState('Reading Room 3');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getQRPayload = (building: string, room: string) => {
    return `https://campusfix.internal/report?building=${encodeURIComponent(building)}&room=${encodeURIComponent(room)}`;
  };

  const handleScanSpot = (building: string, room: string) => {
    onScanLocation(building, room);
    setCurrentPage('report');
  };

  const handleCopyLink = (id: string, building: string, room: string) => {
    const link = getQRPayload(building, room);
    navigator.clipboard?.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              Campus QR Infrastructure
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">Scan-to-Report Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Location QR Code Generator & Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Every location on campus possesses a unique QR code. When students or faculty scan the QR code with their mobile cameras,
            the CampusFix AI reporting form opens with the building and exact room prefilled automatically.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs flex items-center gap-2 transition whitespace-nowrap"
        >
          <Printer className="w-4 h-4 text-indigo-600" />
          Print Facilities Signage Sheet
        </button>
      </div>

      {/* Custom Location QR Generator */}
      <div className="bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/50 p-6 sm:p-8 rounded-3xl border border-indigo-100 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="inline-flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Dynamic On-Demand QR Code Generator
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Generate Signage for Any Campus Spot
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Specify the building name and room number. Facilities maintenance teams can generate, download,
              and stick these laminated QR signs on classroom doorways and laboratory boards.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Campus Building</label>
                <input
                  type="text"
                  value={customBuilding}
                  onChange={(e) => setCustomBuilding(e.target.value)}
                  placeholder="e.g., Visvesvaraya Engineering Hall"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Room / Area Code</label>
                <input
                  type="text"
                  value={customRoom}
                  onChange={(e) => setCustomRoom(e.target.value)}
                  placeholder="e.g., Seminar Hall 3"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleScanSpot(customBuilding, customRoom)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition"
              >
                <QrCode className="w-4 h-4" />
                Simulate Scanning This QR
              </button>
              <button
                onClick={() => handleCopyLink('custom', customBuilding, customRoom)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {copiedId === 'custom' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Copied Link
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Report Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rendered Live QR Code */}
          <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-card">
            <QRCodeSVG
              value={getQRPayload(customBuilding, customRoom)}
              size={170}
              label={customBuilding}
              sublabel={customRoom}
            />
            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              Vector SVG • Auto-Prefill Ready
            </span>
          </div>
        </div>
      </div>

      {/* Preset Hotspots Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Campus Hotspots & Verified Physical Signs
            </h2>
            <p className="text-xs text-slate-500">
              Click "Simulate Scan" to test automatic prefilling of location into the reporting engine.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRESET_SPOTS.map((spot) => (
            <div
              key={spot.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-premium transition p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 uppercase">
                    {spot.zone}
                  </span>
                  <button
                    onClick={() => handleCopyLink(spot.id, spot.building, spot.room)}
                    title="Copy QR report URL"
                    className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    {copiedId === spot.id ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex justify-center my-3">
                  <QRCodeSVG
                    value={getQRPayload(spot.building, spot.room)}
                    size={130}
                  />
                </div>

                <h3 className="text-sm font-bold text-slate-900 text-center mt-2">
                  {spot.building}
                </h3>
                <p className="text-xs text-indigo-600 font-semibold text-center mt-0.5">
                  {spot.room}
                </p>

                <p className="text-[11px] text-slate-400 text-center mt-2 italic">
                  Common: {spot.commonIssues}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleScanSpot(spot.building, spot.room)}
                  className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Simulate QR Scan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
