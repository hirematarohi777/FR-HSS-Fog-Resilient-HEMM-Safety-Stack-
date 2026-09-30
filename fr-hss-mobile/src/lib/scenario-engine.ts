import { DemoState, ScenarioPhase, PillarId } from './types';

export function getPhaseDescription(phase: ScenarioPhase): { title: string; description: string; pillars: PillarId[] } {
  switch (phase) {
    case 0: return { title: 'Baseline State', description: 'Normal operations. Clear conditions.', pillars: [] };
    case 1: return { title: 'Fog Detection', description: 'Visibility drops. Vision sensor degraded.', pillars: ['vision'] };
    case 2: return { title: 'Visual Event', description: 'Edge motion detected despite fog.', pillars: ['vision'] };
    case 3: return { title: 'Acoustic Event', description: 'Engine rumble detected from blind spot.', pillars: ['acoustic'] };
    case 4: return { title: 'Magnetic Navigation', description: 'Precise location mapped to blind bend.', pillars: ['magnetic_nav'] };
    case 5: return { title: 'V2V Sharing', description: 'Received state from approaching vehicle.', pillars: ['v2v'] };
    case 6: return { title: 'Conflict Prediction', description: 'System predicts convergence. Alert generated.', pillars: ['vision', 'acoustic', 'magnetic_nav', 'v2v'] };
    case 7: return { title: 'Operator Warning', description: 'Dashboard alert presented to operator.', pillars: [] };
    case 8: return { title: 'Supervisor Occupancy', description: 'Segment marked occupied by supervisor dashboard.', pillars: [] };
    case 9: return { title: 'EBS Status', description: 'Hardwired braking path verified ready.', pillars: ['ebs'] };
    case 10: return { title: 'Event History', description: 'Incident auto-logged for review.', pillars: [] };
    default: return { title: '', description: '', pillars: [] };
  }
}

export function advanceScenario(state: DemoState, toPhase: ScenarioPhase): DemoState {
  if (toPhase <= state.scenarioPhase) {
    return state; 
  }

  const newState = structuredClone(state) as DemoState;
  const now = Date.now();

  for (let phase = state.scenarioPhase + 1; phase <= toPhase; phase++) {
    newState.scenarioPhase = phase as ScenarioPhase;

    if (phase === 1) {
      const vision = newState.pillars['dumper-01'].find(p => p.pillarId === 'vision')!;
      vision.confidence = 45;
      vision.state = 'degraded';
      vision.label = 'Fog detected — visibility below 50m (simulated)';
      vision.detail = 'Neuromorphic sensor response degraded by atmospheric scattering. Confidence reduced.';
      vision.timestamp = now;
    }
    
    if (phase === 2) {
      const vision = newState.pillars['dumper-01'].find(p => p.pillarId === 'vision')!;
      vision.confidence = 22;
      vision.label = 'Edge motion at bend (simulated)';
      vision.detail = 'Event-based camera detected edge motion signatures at bend approach. Low confidence due to fog.';
      vision.timestamp = now;
    }

    if (phase === 3) {
      const acoustic = newState.pillars['dumper-01'].find(p => p.pillarId === 'acoustic')!;
      acoustic.state = 'alert';
      acoustic.confidence = 78;
      acoustic.bearing = 310;
      acoustic.label = 'Engine rumble detected (simulated)';
      acoustic.detail = 'Microphone array detected engine rumble bearing 310° NW. Consistent with HEMM vehicle approaching from beyond bend.';
      acoustic.timestamp = now;
    }

    if (phase === 4) {
      const mag = newState.pillars['dumper-01'].find(p => p.pillarId === 'magnetic_nav')!;
      mag.confidence = 82;
      mag.label = 'Position: Segment B-7 approach (simulated)';
      mag.detail = 'Magnetic field signature matches segment B-7 blind bend approach zone.';
      mag.timestamp = now;

      const v1 = newState.vehicles.find(v => v.id === 'dumper-01')!;
      v1.position = { x: 48, y: 48 };
      v1.segment = 'B-7';
      v1.speed = 12;

      const v2 = newState.vehicles.find(v => v.id === 'dumper-02')!;
      v2.position = { x: 55, y: 40 };
      v2.segment = 'B-6';
      v2.speed = 15;
    }

    if (phase === 5) {
      const v2v = newState.pillars['dumper-01'].find(p => p.pillarId === 'v2v')!;
      v2v.state = 'nominal';
      v2v.confidence = 91;
      v2v.label = 'Dumper-02 state received (simulated)';
      v2v.detail = 'Received: Dumper-02 at segment B-6, heading 130°, speed 15 km/h (illustrative). Last update: <1s ago.';
      v2v.timestamp = now;
      
      const v2v2 = newState.pillars['dumper-02'].find(p => p.pillarId === 'v2v')!;
      v2v2.state = 'nominal';
      v2v2.confidence = 91;
      v2v2.label = 'Dumper-01 state received (simulated)';
      v2v2.timestamp = now;
    }

    if (phase === 6) {
      newState.alerts.push({
        id: 'alert-001',
        title: 'Vehicle Convergence at Bend B-7',
        description: 'Fusion of vision, acoustic, magnetic navigation, and V2V data predicts potential vehicle convergence at blind bend B-7. Advisory: Stop and confirm clearance before proceeding. (Illustrative — not an operational directive)',
        severity: 'critical',
        pillarIds: ['vision', 'acoustic', 'magnetic_nav', 'v2v'],
        vehicleIds: ['dumper-01', 'dumper-02'],
        status: 'new',
        createdAt: now,
        scenarioStep: 6,
      });

      const v1 = newState.vehicles.find(v => v.id === 'dumper-01')!;
      v1.position = { x: 50, y: 45 };

      const v2 = newState.vehicles.find(v => v.id === 'dumper-02')!;
      v2.position = { x: 53, y: 43 };
    }

    if (phase === 7) {
      newState.alerts.push({
        id: 'alert-002',
        title: 'System Advisory Issued',
        description: 'Operator Ravi Kumar (Dumper-01) has been presented with the convergence warning. Awaiting acknowledgement.',
        severity: 'info',
        pillarIds: [],
        vehicleIds: ['dumper-01'],
        status: 'new',
        createdAt: now,
        scenarioStep: 7,
      });
    }

    if (phase === 8) {
      const b7 = newState.segments.find(s => s.id === 'B-7')!;
      b7.status = 'occupied';
      b7.occupants = ['dumper-01', 'dumper-02'];

      const b6 = newState.segments.find(s => s.id === 'B-6')!;
      b6.status = 'occupied';
      b6.occupants = ['dumper-02'];
    }

    if (phase === 9) {
      const ebs = newState.pillars['dumper-01'].find(p => p.pillarId === 'ebs')!;
      ebs.confidence = 98;
      ebs.state = 'nominal';
      ebs.label = 'Armed / Ready (SIMULATED)';
      ebs.detail = 'Independent hardwired emergency braking path reports ready status. SIMULATION — Software does not control the independent hardwired braking path.';
      ebs.timestamp = now;
    }

    if (phase === 10) {
      newState.incidents.push({
        id: 'incident-001',
        title: 'Blind Bend Convergence Event — B-7',
        description: 'Two HEMM vehicles (Dumper-01, Dumper-02) detected converging at blind bend segment B-7 during reduced visibility conditions. All five pillar readings captured at time of event.',
        priority: 'critical',
        submittedBy: 'system',
        submittedAt: now,
        pillarSnapshot: structuredClone(newState.pillars['dumper-01']),
        alertIds: ['alert-001', 'alert-002'],
      });
    }
  }

  newState.lastUpdated = now;
  return newState;
}
