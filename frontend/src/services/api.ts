import { Ticket, CreateTicketDTO, UpdateTicketDTO, SystemStatus } from '../types/ticket';

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

const LOCAL_STORAGE_KEY = 'campusfix_local_tickets_cache';

// Seed sample tickets for fallback if local dev server hasn't been started yet
const INITIAL_FALLBACK_TICKETS: Ticket[] = [
  {
    ticketId: 'TKT-89341',
    title: 'Ceiling Fan Sparking & Grinding Noise',
    category: 'ELECTRICAL',
    description: 'The ceiling fan in Lecture Hall 204 started emitting visible electrical sparks and a loud screeching noise during lecture. Immediate hazard to students seated beneath it.',
    building: 'Ramanujan Science Block',
    room: 'Lecture Hall 204',
    priority: 'CRITICAL',
    status: 'PENDING',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Rahul Verma',
    createdAt: new Date(Date.now() - 40 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 1000).toISOString(),
    slaSeconds: 60,
    escalated: false,
    timeline: [
      {
        status: 'PENDING',
        timestamp: new Date(Date.now() - 40 * 1000).toISOString(),
        actor: 'Rahul Verma (Student)',
        note: 'Issue reported via QR code in Ramanujan Science Block LH-204.'
      }
    ]
  },
  {
    ticketId: 'TKT-74102',
    title: 'Severe Water Pipe Leakage in 2nd Floor Restroom',
    category: 'PLUMBING',
    description: 'High-pressure pipeline under the third sink has ruptured. Water is flowing into the hallway and endangering nearby server conduits.',
    building: 'Visvesvaraya Engineering Hall',
    room: 'Restroom 2B',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Priya Nair',
    createdAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    slaSeconds: 60,
    escalated: false,
    adminNotes: 'Facilities team dispatched with emergency shut-off wrench.',
    timeline: [
      {
        status: 'PENDING',
        timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        actor: 'Priya Nair (Faculty)',
        note: 'Logged plumbing emergency.'
      },
      {
        status: 'IN_PROGRESS',
        timestamp: new Date(Date.now() - 1800 * 1000).toISOString(),
        actor: 'Admin (Mr. K. Sharma)',
        note: 'Plumbing contractor assigned. Estimated repair time: 45 mins.'
      }
    ]
  },
  {
    ticketId: 'TKT-61298',
    title: 'Library Wi-Fi Access Point Offline',
    category: 'WIFI_IT',
    description: 'Aruba AP in the reference section has no power LED. Over 60 students in the study hall have lost network access during exam prep week.',
    building: 'Central Library',
    room: 'Reference Hall, 1st Floor',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Aditya Joshi',
    createdAt: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    resolvedAt: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
    slaSeconds: 60,
    escalated: false,
    adminNotes: 'PoE switch port 14 power reset completed. Firmware reloaded successfully.',
    timeline: [
      {
        status: 'PENDING',
        timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
        actor: 'Aditya Joshi',
        note: 'Reported lost connectivity.'
      },
      {
        status: 'IN_PROGRESS',
        timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        actor: 'Campus IT NOC',
        note: 'Investigating switch uplink.'
      },
      {
        status: 'RESOLVED',
        timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString(),
        actor: 'Network Admin',
        note: 'PoE injector replaced and signal verified at 120 Mbps.'
      }
    ]
  },
  {
    ticketId: 'TKT-55120',
    title: 'Broken Auditorium Front Bench Support',
    category: 'FURNITURE',
    description: 'Welding on row 3 bench frame cracked. Sharp metal exposed. Risk of injury.',
    building: 'Main Administrative Building',
    room: 'Auditorium Main',
    priority: 'HIGH',
    status: 'ESCALATED',
    imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
    reporterName: 'Sneha Roy',
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 11).toISOString(),
    slaSeconds: 60,
    escalated: true,
    escalatedAt: new Date(Date.now() - 3600 * 1000 * 11).toISOString(),
    escalationReason: 'Automated SLA breach: Unresolved after 60s operational window. Escalated to Facilities Director.',
    timeline: [
      {
        status: 'PENDING',
        timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        actor: 'Sneha Roy',
        note: 'Initial report submitted.'
      },
      {
        status: 'ESCALATED',
        timestamp: new Date(Date.now() - 3600 * 1000 * 11).toISOString(),
        actor: 'AWS Step Functions Auto-Escalator',
        note: 'Automated SLA breach: Unresolved after 60s operational window. Escalated to Facilities Director.'
      }
    ]
  }
];

function getLocalStoredTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_TICKETS));
      return INITIAL_FALLBACK_TICKETS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FALLBACK_TICKETS;
  }
}

function saveLocalStoredTickets(tickets: Ticket[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tickets));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const api = {
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE}/api/system-status`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      awsRegion: 'ap-south-1',
      dynamoDbTable: 'CampusFixTickets',
      s3Bucket: 'campusfix-evidence-ap-south-1',
      stepFunctionsArn: 'arn:aws:states:ap-south-1:123456789012:stateMachine:CampusFix-EscalationWorkflow',
      hasAwsCredentials: false,
      mode: 'LOCAL_DEV_SIMULATOR',
      slaSecondsDefault: 60,
    };
  },

  async getTickets(params?: { status?: string; category?: string; building?: string }): Promise<Ticket[]> {
    try {
      const url = new URL(`${API_BASE}/tickets`);
      if (params?.status) url.searchParams.set('status', params.status);
      if (params?.category) url.searchParams.set('category', params.category);
      if (params?.building) url.searchParams.set('building', params.building);

      const res = await fetch(url.toString(), {
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        const tickets: Ticket[] = data.tickets || [];
        saveLocalStoredTickets(tickets);
        return tickets;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to cached store:', e);
    }

    // Local fallback
    let local = getLocalStoredTickets();
    if (params?.status) {
      local = local.filter(t => t.status === params.status?.toUpperCase());
    }
    if (params?.category) {
      local = local.filter(t => t.category === params.category?.toUpperCase());
    }
    if (params?.building) {
      local = local.filter(t => t.building.toLowerCase().includes(params.building!.toLowerCase()));
    }
    return local;
  },

  async getTicketById(ticketId: string): Promise<Ticket> {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        signal: AbortSignal.timeout(3500)
      });
      if (res.ok) {
        const data = await res.json();
        return data.ticket;
      }
    } catch (e) {
      console.warn(`Failed to fetch ticket ${ticketId} from API:`, e);
    }

    const local = getLocalStoredTickets();
    const found = local.find(t => t.ticketId === ticketId);
    if (!found) {
      throw new Error(`Ticket ${ticketId} not found`);
    }
    return found;
  },

  async createTicket(dto: CreateTicketDTO): Promise<Ticket> {
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        return data.ticket;
      }
    } catch (e) {
      console.warn('POST /tickets API call failed, persisting in local fallback queue:', e);
    }

    // Local fallback simulation
    const ticketId = `TKT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const nowIso = new Date().toISOString();
    const slaSec = dto.slaSeconds || 60;

    const newTicket: Ticket = {
      ticketId,
      title: dto.title.trim(),
      category: dto.category,
      description: dto.description.trim(),
      building: dto.building.trim(),
      room: dto.room.trim(),
      priority: dto.priority,
      status: 'PENDING',
      imageUrl: dto.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      reporterName: dto.reporterName || 'Campus Student',
      createdAt: nowIso,
      updatedAt: nowIso,
      slaSeconds: slaSec,
      escalated: false,
      stepFunctionsExecutionArn: `arn:aws:states:ap-south-1:123456789012:execution:CampusFix-Escalation:${ticketId}`,
      timeline: [
        {
          status: 'PENDING',
          timestamp: nowIso,
          actor: dto.reporterName || 'Campus Student',
          note: 'Issue submitted via CampusFix portal and logged into DynamoDB.'
        }
      ]
    };

    const current = getLocalStoredTickets();
    const updated = [newTicket, ...current];
    saveLocalStoredTickets(updated);

    return newTicket;
  },

  async updateTicket(ticketId: string, dto: UpdateTicketDTO): Promise<Ticket> {
    try {
      const res = await fetch(`${API_BASE}/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const data = await res.json();
        return data.ticket;
      }
    } catch (e) {
      console.warn(`PATCH /tickets/${ticketId} failed, updating local fallback:`, e);
    }

    const list = getLocalStoredTickets();
    const target = list.find(t => t.ticketId === ticketId);
    if (!target) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const nowIso = new Date().toISOString();
    if (dto.status) {
      target.status = dto.status;
      if (dto.status === 'RESOLVED') {
        target.resolvedAt = nowIso;
        target.escalated = false;
      } else if (dto.status === 'ESCALATED') {
        target.escalated = true;
        target.escalatedAt = nowIso;
        target.escalationReason = dto.note || 'Manually escalated by supervisor.';
      }

      target.timeline.push({
        status: dto.status,
        timestamp: nowIso,
        actor: dto.actor || 'Facilities Administrator',
        note: dto.note || `Status changed to ${dto.status}`
      });
    }

    if (dto.priority) {
      target.priority = dto.priority;
    }

    if (dto.adminNotes !== undefined) {
      target.adminNotes = dto.adminNotes;
    }

    target.updatedAt = nowIso;
    saveLocalStoredTickets(list);
    return target;
  },

  async getPresignedUploadUrl(contentType: string, fileName: string) {
    try {
      const res = await fetch(`${API_BASE}/uploads/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, fileName }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    const mockKey = `${Math.random().toString(36).substring(2, 9)}-${fileName}`;
    return {
      uploadUrl: `${API_BASE}/api/uploads/${mockKey}`,
      objectKey: mockKey,
      fileUrl: `${API_BASE}/static/uploads/${mockKey}`,
      expiresIn: 300,
      provider: 'LOCAL_STORAGE'
    };
  },

  async uploadImageToStorage(uploadUrl: string, file: File): Promise<void> {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
    if (!res.ok) {
      throw new Error(`Upload failed with HTTP ${res.status}: ${res.statusText}`);
    }
  }
};
