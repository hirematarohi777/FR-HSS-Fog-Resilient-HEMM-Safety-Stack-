// Enums
export type Role = 'operator' | 'supervisor' | 'admin';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'new' | 'acknowledged';
export type PillarId = 'vision' | 'acoustic' | 'magnetic_nav' | 'v2v' | 'ebs';
export type PillarState = 'nominal' | 'degraded' | 'alert' | 'offline';
export type SegmentStatus = 'open' | 'restricted' | 'occupied';
export type ScenarioPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical';

// Core entities
export interface DemoUser {
  id: string;            // 'op-01' | 'sv-01' | 'admin-01'
  name: string;
  role: Role;
  vehicleId?: string;    // Only for operators
}

export interface Vehicle {
  id: string;
  label: string;
  operatorId: string;
  position: { x: number; y: number };
  heading: number;
  speed: number;
  segment: string;
}

export interface PillarReading {
  pillarId: PillarId;
  state: PillarState;
  confidence: number;
  label: string;
  detail?: string;
  bearing?: number;      // For acoustic
  timestamp: number;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  pillarIds: PillarId[];
  vehicleIds: string[];
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  createdAt: number;
  scenarioStep?: ScenarioPhase;
}

export interface Segment {
  id: string;
  label: string;
  status: SegmentStatus;
  occupants: string[];
  restrictedBy?: string;
  restrictedAt?: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  submittedBy: string;
  submittedAt: number;
  vehicleId?: string;
  segment?: string;
  pillarSnapshot: PillarReading[];
  alertIds: string[];
  supervisorNotes?: string;
}

export interface RouteOption {
  id: string;
  label: string;
  description: string;
  segments: string[];
  estimatedTime: string;
  riskLevel: 'low' | 'medium' | 'high';
  advisoryNote: string;
  selected: boolean;
}

export interface SOPEntry {
  id: string;
  question: string;
  answer: string | null;
  isApproved: boolean;
  fallbackMessage: string;
}

export interface SystemHealthState {
  pillars: Record<PillarId, {
    softwareStatus: 'online' | 'degraded' | 'offline';
    lastHeartbeat: number;
    note: string;
  }>;
  networkLatency: number;
  storageUsed: number;
  ebsHardwareNote: string;
}

export interface DemoState {
  currentUser: DemoUser | null;
  scenarioPhase: ScenarioPhase;
  vehicles: Vehicle[];
  pillars: Record<string, PillarReading[]>;
  alerts: Alert[];
  segments: Segment[];
  incidents: Incident[];
  routes: RouteOption[];
  sopEntries: SOPEntry[];
  systemHealth: SystemHealthState;
  lastUpdated: number;
}

// Pillar metadata for display
export const PILLAR_META: Record<PillarId, { name: string; icon: string; description: string }> = {
  vision: { name: 'Neuromorphic Vision', icon: 'Eye', description: 'Event-based camera for fog-penetrating visual detection' },
  acoustic: { name: 'Acoustic Detection', icon: 'Ear', description: 'Microphone array for around-the-corner engine detection' },
  magnetic_nav: { name: 'Magnetic Navigation', icon: 'Compass', description: 'GPS-free positioning using magnetic field signatures' },
  v2v: { name: 'V2V Communication', icon: 'Radio', description: 'High-rate vehicle-to-vehicle state sharing' },
  ebs: { name: 'EBS Safety Path', icon: 'ShieldAlert', description: 'Independent hardwired emergency braking status' },
};

export const DEMO_USERS: DemoUser[] = [
  { id: 'op-01', name: 'Ravi Kumar', role: 'operator', vehicleId: 'dumper-01' },
  { id: 'sv-01', name: 'Priya Sharma', role: 'supervisor' },
  { id: 'admin-01', name: 'Arjun Patel', role: 'admin' },
];
