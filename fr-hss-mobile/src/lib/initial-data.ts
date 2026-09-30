import { DemoState, PillarId } from './types';

const INITIAL_PILLAR_READINGS = (timestamp: number) => {
  const pillars: PillarId[] = ['vision', 'acoustic', 'magnetic_nav', 'v2v', 'ebs'];
  return pillars.map((pillarId) => ({
    pillarId,
    state: 'nominal' as const,
    confidence: 95,
    label: 'Nominal Operation',
    timestamp,
  }));
};

export function createInitialState(): DemoState {
  const now = Date.now();
  
  return {
    currentUser: null,
    scenarioPhase: 0,
    vehicles: [
      {
        id: 'dumper-01',
        label: 'Dumper-01',
        operatorId: 'op-01',
        position: { x: 25, y: 65 },
        heading: 45,
        speed: 18,
        segment: 'B-5',
      },
      {
        id: 'dumper-02',
        label: 'Dumper-02',
        operatorId: 'op-02',
        position: { x: 75, y: 30 },
        heading: 210,
        speed: 15,
        segment: 'B-9',
      },
    ],
    pillars: {
      'dumper-01': INITIAL_PILLAR_READINGS(now),
      'dumper-02': INITIAL_PILLAR_READINGS(now),
    },
    alerts: [],
    segments: [
      { id: 'B-5', label: 'Haul Road South', status: 'open', occupants: [] },
      { id: 'B-6', label: 'Approach Road East', status: 'open', occupants: [] },
      { id: 'B-7', label: 'Blind Bend Junction', status: 'open', occupants: [] },
      { id: 'B-8', label: 'Bypass Road North', status: 'open', occupants: [] },
      { id: 'B-9', label: 'Haul Road North', status: 'open', occupants: [] },
    ],
    incidents: [],
    routes: [
      {
        id: 'route-a',
        label: 'Route A — Via Blind Bend',
        description: 'Primary haul route through bend B-7. Shorter but passes through the blind bend area.',
        segments: ['B-5', 'B-6', 'B-7'],
        estimatedTime: '~12 min (illustrative)',
        riskLevel: 'high',
        advisoryNote: 'Passes through blind bend B-7. Illustrative value — not a validated operational threshold.',
        selected: false,
      },
      {
        id: 'route-b',
        label: 'Route B — Bypass',
        description: 'Bypass route avoiding blind bend. Longer but avoids the B-7 blind bend zone entirely.',
        segments: ['B-5', 'B-8', 'B-9'],
        estimatedTime: '~18 min (illustrative)',
        riskLevel: 'low',
        advisoryNote: 'Avoids blind bend area. Illustrative value — not a validated operational threshold.',
        selected: true,
      }
    ],
    sopEntries: [
      {
        id: 'sop-1',
        question: 'What is the procedure for fog operations?',
        answer: 'When visibility drops below 50m, reduce speed and engage all available sensor pillars. Maintain radio contact with supervisor. Do not proceed through blind bends without V2V confirmation of clearance.',
        isApproved: false,
        fallbackMessage: 'UNAPPROVED DEMONSTRATION CONTENT — This is sample text, not an approved NMDC procedure.',
      },
      {
        id: 'sop-2',
        question: 'What speed limit applies in fog?',
        answer: null,
        isApproved: false,
        fallbackMessage: 'No approved procedure available. Contact your Safety Administrator for current approved speed limits.',
      },
      {
        id: 'sop-3',
        question: 'How do I respond to a collision warning?',
        answer: 'Bring vehicle to a controlled stop. Acknowledge the alert on the dashboard. Do not proceed until supervisor clearance is received. Report position via radio.',
        isApproved: false,
        fallbackMessage: 'UNAPPROVED DEMONSTRATION CONTENT — This is sample text, not an approved NMDC procedure.',
      },
      {
        id: 'sop-4',
        question: 'What are the EBS activation procedures?',
        answer: null,
        isApproved: false,
        fallbackMessage: 'No approved procedure available. The EBS is an independent hardwired system. Contact your Safety Administrator.',
      },
      {
        id: 'sop-5',
        question: 'What PPE is required for HEMM operation?',
        answer: 'Operators must wear high-visibility vest, hard hat, steel-toe boots, ear protection, and safety glasses at all times during HEMM operation.',
        isApproved: false,
        fallbackMessage: 'UNAPPROVED DEMONSTRATION CONTENT — This is sample text, not an approved NMDC procedure.',
      },
    ],
    systemHealth: {
      pillars: {
        vision: { softwareStatus: 'online', lastHeartbeat: now, note: 'Normal operation' },
        acoustic: { softwareStatus: 'online', lastHeartbeat: now, note: 'Normal operation' },
        magnetic_nav: { softwareStatus: 'online', lastHeartbeat: now, note: 'Normal operation' },
        v2v: { softwareStatus: 'online', lastHeartbeat: now, note: 'Normal operation' },
        ebs: { softwareStatus: 'online', lastHeartbeat: now, note: 'Normal operation' },
      },
      networkLatency: 45,
      storageUsed: 22,
      ebsHardwareNote: 'Independent path verified.',
    },
    lastUpdated: now,
  };
}
