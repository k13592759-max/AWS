export type TicketCategory =
  | 'ELECTRICAL'
  | 'PLUMBING'
  | 'WIFI_IT'
  | 'FURNITURE'
  | 'HVAC'
  | 'CLEANLINESS'
  | 'SAFETY_STRUCTURAL'
  | 'OTHER';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';

export interface TimelineEntry {
  status: TicketStatus | string;
  timestamp: string;
  actor: string;
  note: string;
}

export interface Ticket {
  ticketId: string;
  title: string;
  category: TicketCategory;
  description: string;
  building: string;
  room: string;
  priority: TicketPriority;
  status: TicketStatus;
  imageUrl?: string;
  reporterName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaSeconds?: number;
  escalated?: boolean;
  escalatedAt?: string;
  escalationReason?: string;
  adminNotes?: string;
  stepFunctionsExecutionArn?: string;
  timeline: TimelineEntry[];
}

export interface CreateTicketDTO {
  title: string;
  category: TicketCategory;
  description: string;
  building: string;
  room: string;
  priority: TicketPriority;
  imageUrl?: string;
  reporterName?: string;
  slaSeconds?: number;
}

export interface UpdateTicketDTO {
  status?: TicketStatus;
  priority?: TicketPriority;
  adminNotes?: string;
  actor?: string;
  note?: string;
}

export interface SystemStatus {
  awsRegion: string;
  dynamoDbTable: string;
  s3Bucket: string;
  stepFunctionsArn: string;
  hasAwsCredentials: boolean;
  mode: string;
  slaSecondsDefault: number;
}
