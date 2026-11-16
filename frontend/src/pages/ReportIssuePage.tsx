import React, { useState, useEffect } from 'react';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  ArrowRight,
  Layers,
  Sparkles,
  X,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TicketCategory, TicketPriority, CreateTicketDTO } from '../types/ticket';
import { api } from '../services/api';
import { PageId } from '../components/Navbar';

interface ReportIssuePageProps {
  prefilledBuilding?: string;
  prefilledRoom?: string;
  setCurrentPage: (page: PageId) => void;
  setSelectedTicketId: (id: string) => void;
  onTicketCreated: (ticket: any) => void;
}

const CAMPUS_BUILDINGS = [
  'Ramanujan Science Block',
  'Visvesvaraya Engineering Hall',
  'Central Library',
  'APJ Abdul Kalam Hostel A',
  'Sarojini Hostel B',
  'Student Activity Center',
  'Main Administrative Building',
  'Campus Cafeteria & Food Court',
  'Sports Complex & Gymnasium'
];

const CATEGORIES: { id: TicketCategory; label: string; desc: string }[] = [
  { id: 'ELECTRICAL', label: 'Electrical', desc: 'Fans, lights, sparks, sockets, wiring' },
  { id: 'PLUMBING', label: 'Plumbing & Water', desc: 'Leaking pipes, tap damage, water supply' },
  { id: 'WIFI_IT', label: 'Wi-Fi & IT', desc: 'Routers, AP offline, projector, LAN port' },
  { id: 'FURNITURE', label: 'Furniture & Desks', desc: 'Broken benches, desk welding, chairs' },
  { id: 'HVAC', label: 'HVAC & Cooling', desc: 'AC failure, ventilation, thermostat' },
  { id: 'CLEANLINESS', label: 'Cleanliness', desc: 'Sanitation, spills, waste overflow' },
  { id: 'SAFETY_STRUCTURAL', label: 'Structural Safety', desc: 'Cracked stairs, handrails, door locks' },
  { id: 'OTHER', label: 'Other Infrastructure', desc: 'Miscellaneous facility repairs' },
];

export const ReportIssuePage: React.FC<ReportIssuePageProps> = ({
  prefilledBuilding = '',
  prefilledRoom = '',
  setCurrentPage,
  setSelectedTicketId,
  onTicketCreated,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TicketCategory>('ELECTRICAL');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(prefilledBuilding || CAMPUS_BUILDINGS[0]);
  const [room, setRoom] = useState(prefilledRoom || '');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [reporterName, setReporterName] = useState('Ananya Sharma');
  const [slaSeconds, setSlaSeconds] = useState<number>(60);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);

  useEffect(() => {
    if (prefilledBuilding) setBuilding(prefilledBuilding);
    if (prefilledRoom) setRoom(prefilledRoom);
  }, [prefilledBuilding, prefilledRoom]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const removeImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title.trim() || !description.trim() || !building.trim() || !room.trim()) {
      setFormError('Please fill in all required fields (Title, Description, Building, and Room).');
      return;
    }

    setSubmitting(true);
    let finalImageUrl = previewUrl;

    try {
      // Step 1: Secure presigned S3 / storage upload
      if (selectedFile) {
        setIsUploading(true);
        try {
          const presignRes = await api.getPresignedUploadUrl(selectedFile.type, selectedFile.name);
          if (presignRes?.uploadUrl) {
            await api.uploadImageToStorage(presignRes.uploadUrl, selectedFile);
            finalImageUrl = presignRes.fileUrl;
          }
        } catch (err) {
          console.warn('Presigned upload error, using local preview reference:', err);
          if (!finalImageUrl) finalImageUrl = previewUrl;
        } finally {
          setIsUploading(false);
        }
      }

      // If no photo attached, provide a realistic contextual placeholder
      if (!finalImageUrl) {
        finalImageUrl = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80';
      }

      // Step 2: Post ticket to API
      const payload: CreateTicketDTO = {
        title,
        category,
        description,
        building,
        room,
        priority,
        imageUrl: finalImageUrl,
        reporterName,
        slaSeconds,
      };

      const ticket = await api.createTicket(payload);
      onTicketCreated(ticket);
      setCreatedTicket(ticket);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      setFormError(`Failed to submit ticket: ${err?.message || 'Network error occurred. Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // If ticket was just submitted, show victory confirmation screen
  if (createdTicket) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-floating p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Ticket Successfully Created
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Issue Logged in DynamoDB
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your report has been entered into the live facilities queue with ticket ID:
            </p>
            <div className="inline-block mt-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-mono text-lg font-bold tracking-wider shadow-sm">
              {createdTicket.ticketId}
            </div>
          </div>

          {/* SLA Escalation Warning Box */}
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-left space-y-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4 text-indigo-600" />
              AWS Step Functions SLA Timer Active
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              An automated state machine is monitoring this ticket with a <strong>{slaSeconds}s</strong> resolution window.
              If campus facilities do not resolve the issue before the SLA expires, it will automatically escalate to the Facilities Director.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSelectedTicketId(createdTicket.ticketId);
                setCurrentPage('track');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              Track Ticket Status in Real-Time
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCreatedTicket(null);
                setTitle('');
                setDescription('');
                setRoom('');
                removeImage();
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              New Complaint
            </span>
            {prefilledBuilding && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Prefilled from QR Scan
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Report a Campus Infrastructure Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Provide details and photographic evidence. Every report is SLA-tracked via AWS Step Functions.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('qr')}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200 flex items-center gap-1.5 whitespace-nowrap"
        >
          <Camera className="w-4 h-4" /> Scan QR to Prefill
        </button>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
        {formError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-rose-500 hover:text-rose-800 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Issue Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Issue Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Sparks emitting from ceiling fan / Water leak under sink"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Category Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-2xs font-semibold ring-1 ring-indigo-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{cat.label}</span>
                  <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{cat.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Building & Room Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Campus Building <span className="text-rose-500">*</span>
            </label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            >
              {CAMPUS_BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Room / Lab / Specific Area <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Lab 304, Room 201, 2nd Floor Corridor"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Priority & SLA duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Priority Urgency <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-2 text-xs font-bold rounded-xl border text-center transition ${
                    priority === p
                      ? p === 'CRITICAL'
                        ? 'bg-red-600 text-white border-red-700 shadow-sm'
                        : p === 'HIGH'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : p === 'MEDIUM'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-700 text-white border-slate-800'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                SLA Escalation Window
              </label>
              <span className="text-xs font-mono font-bold text-indigo-600">{slaSeconds} Seconds</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min="30"
                max="180"
                step="15"
                value={slaSeconds}
                onChange={(e) => setSlaSeconds(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Demonstration SLA timer for live Step Functions automatic escalation testing.
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Detailed Problem Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Explain what is broken, when it started, and whether it poses a safety risk to students or staff..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
          />
        </div>

        {/* Image Evidence Upload (S3 Presigned Flow) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Photographic Evidence (Secure S3 Upload)
          </label>

          {previewUrl ? (
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
              <img
                src={previewUrl}
                alt="Evidence Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="p-2 text-[11px] text-slate-600 font-medium bg-white border-t border-slate-100 flex items-center justify-between">
                <span>{selectedFile?.name || 'Selected Image'}</span>
                <span className="text-emerald-600 font-bold">Ready to upload</span>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-indigo-600">Click to upload photo</span> or drag & drop
              </div>
              <p className="text-[11px] text-slate-400">
                JPEG, PNG, WebP up to 5MB (S3 presigned PUT with least-privilege IAM)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {uploadError && (
            <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {uploadError}
            </p>
          )}
        </div>

        {/* Reporter Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Student / Reporter Name
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            Automatic Step Functions SLA triggers upon submission.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center gap-2 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Ticket...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Campus Issue Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
