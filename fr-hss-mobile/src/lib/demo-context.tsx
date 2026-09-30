'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { DemoState, ScenarioPhase, Incident, DEMO_USERS, PillarId } from './types';
import { createInitialState } from './initial-data';
import { advanceScenario } from './scenario-engine';

interface DemoContextValue {
  state: DemoState;
  login: (userId: string) => void;
  logout: () => void;
  advanceToPhase: (phase: ScenarioPhase) => void;
  resetScenario: () => void;
  acknowledgeAlert: (alertId: string) => void;
  selectRoute: (routeId: string) => void;
  restrictSegment: (segmentId: string) => void;
  submitIncident: (incident: Omit<Incident, 'id' | 'submittedBy' | 'submittedAt' | 'pillarSnapshot' | 'alertIds'>) => void;
  resetDemoData: () => void;
  addSupervisorNotes: (incidentId: string, notes: string) => void;
  simulateFailure: (failureType: 'stale_v2v' | 'poor_mag' | 'vision_offline' | 'sensor_disagree', active: boolean) => void;
  autoAdvance: boolean;
  setAutoAdvance: (on: boolean) => void;
}

const DemoStateContext = createContext<DemoContextValue | undefined>(undefined);

export function DemoStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null);
  const [autoAdvance, setAutoAdvanceState] = useState(false);
  const autoAdvanceRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('fr-hss-state');
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        setState(createInitialState());
      }
    } else {
      setState(createInitialState());
    }
  }, []);

  useEffect(() => {
    if (state) {
      localStorage.setItem('fr-hss-state', JSON.stringify(state));
    }
  }, [state]);

  // Auto-advance interval
  useEffect(() => {
    autoAdvanceRef.current = autoAdvance;
    if (autoAdvance) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (!prev) return prev;
          if (prev.scenarioPhase >= 10) {
            // Stop auto-advance
            autoAdvanceRef.current = false;
            setAutoAdvanceState(false);
            return prev;
          }
          return advanceScenario(prev, (prev.scenarioPhase + 1) as ScenarioPhase);
        });
      }, 5000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoAdvance]);

  if (!state) {
    return null;
  }

  const login = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setState(prev => ({ ...prev!, currentUser: user, lastUpdated: Date.now() }));
    }
  };

  const logout = () => {
    setState(prev => ({ ...prev!, currentUser: null, lastUpdated: Date.now() }));
  };

  const advanceToPhase = (phase: ScenarioPhase) => {
    setState(prev => advanceScenario(prev!, phase));
  };

  const resetScenario = () => {
    setState(prev => {
      const fresh = createInitialState();
      fresh.currentUser = prev!.currentUser;
      return fresh;
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      const alert = next.alerts.find(a => a.id === alertId);
      if (alert) {
        alert.status = 'acknowledged';
        alert.acknowledgedBy = next.currentUser?.id;
        alert.acknowledgedAt = Date.now();
      }
      next.lastUpdated = Date.now();
      return next;
    });
  };

  const selectRoute = (routeId: string) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      next.routes.forEach(r => {
        r.selected = r.id === routeId;
      });
      next.lastUpdated = Date.now();
      return next;
    });
  };

  const restrictSegment = (segmentId: string) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      const segment = next.segments.find(s => s.id === segmentId);
      if (segment) {
        if (segment.status === 'occupied') return next; // can't restrict occupied
        segment.status = segment.status === 'restricted' ? 'open' : 'restricted';
        if (segment.status === 'restricted') {
          segment.restrictedBy = next.currentUser?.id;
          segment.restrictedAt = Date.now();
        } else {
          delete segment.restrictedBy;
          delete segment.restrictedAt;
        }
      }
      next.lastUpdated = Date.now();
      return next;
    });
  };

  const submitIncident = (incidentData: Omit<Incident, 'id' | 'submittedBy' | 'submittedAt' | 'pillarSnapshot' | 'alertIds'>) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      const activeAlertIds = next.alerts.filter(a => a.status === 'new').map(a => a.id);
      const newIncident: Incident = {
        ...incidentData,
        id: `incident-${Date.now()}`,
        submittedBy: next.currentUser?.id || 'unknown',
        submittedAt: Date.now(),
        pillarSnapshot: structuredClone(next.pillars['dumper-01'] || []),
        alertIds: activeAlertIds,
      };
      next.incidents.push(newIncident);
      next.lastUpdated = Date.now();
      return next;
    });
  };

  const resetDemoData = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setAutoAdvanceState(false);
    const fresh = createInitialState();
    const currentUser = state.currentUser;
    fresh.currentUser = currentUser;
    localStorage.setItem('fr-hss-state', JSON.stringify(fresh));
    setState(fresh);
  };

  const addSupervisorNotes = (incidentId: string, notes: string) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      const incident = next.incidents.find(i => i.id === incidentId);
      if (incident) {
        incident.supervisorNotes = notes;
      }
      next.lastUpdated = Date.now();
      return next;
    });
  };

  const simulateFailure = (failureType: 'stale_v2v' | 'poor_mag' | 'vision_offline' | 'sensor_disagree', active: boolean) => {
    setState(prev => {
      const next = structuredClone(prev) as DemoState;
      const now = Date.now();

      if (failureType === 'stale_v2v') {
        const v2v = next.pillars['dumper-01']?.find(p => p.pillarId === 'v2v');
        if (v2v) {
          v2v.state = active ? 'degraded' : 'nominal';
          v2v.label = active ? 'STALE (sim) — Data older than 5s' : 'Nominal Operation';
          v2v.confidence = active ? 30 : 95;
        }
        next.systemHealth.pillars.v2v.softwareStatus = active ? 'degraded' : 'online';
        next.systemHealth.pillars.v2v.note = active ? 'Simulated stale data condition' : 'Normal operation';
      }

      if (failureType === 'poor_mag') {
        const mag = next.pillars['dumper-01']?.find(p => p.pillarId === 'magnetic_nav');
        if (mag) {
          mag.state = active ? 'degraded' : 'nominal';
          mag.label = active ? 'Low confidence (sim) — Position uncertain ±50m' : 'Nominal Operation';
          mag.confidence = active ? 25 : 95;
        }
        next.systemHealth.pillars.magnetic_nav.softwareStatus = active ? 'degraded' : 'online';
        next.systemHealth.pillars.magnetic_nav.note = active ? 'Simulated poor magnetic positioning' : 'Normal operation';
      }

      if (failureType === 'vision_offline') {
        const vision = next.pillars['dumper-01']?.find(p => p.pillarId === 'vision');
        if (vision) {
          vision.state = active ? 'offline' : 'nominal';
          vision.label = active ? 'OFFLINE (sim) — No sensor data' : 'Nominal Operation';
          vision.confidence = active ? 0 : 95;
        }
        next.systemHealth.pillars.vision.softwareStatus = active ? 'offline' : 'online';
        next.systemHealth.pillars.vision.note = active ? 'Simulated sensor offline' : 'Normal operation';
      }

      if (failureType === 'sensor_disagree') {
        const vision = next.pillars['dumper-01']?.find(p => p.pillarId === 'vision');
        const acoustic = next.pillars['dumper-01']?.find(p => p.pillarId === 'acoustic');
        if (vision && acoustic) {
          if (active) {
            vision.state = 'nominal';
            vision.label = 'All Clear (sim) — No obstacles detected';
            vision.confidence = 88;
            acoustic.state = 'alert';
            acoustic.label = 'Engine rumble detected (sim) — conflict with Vision';
            acoustic.confidence = 79;
            acoustic.bearing = 270;
          } else {
            vision.state = 'nominal';
            vision.label = 'Nominal Operation';
            vision.confidence = 95;
            acoustic.state = 'nominal';
            acoustic.label = 'Nominal Operation';
            acoustic.confidence = 95;
          }
        }
      }

      next.lastUpdated = now;
      return next;
    });
  };

  const setAutoAdvance = (on: boolean) => {
    setAutoAdvanceState(on);
  };

  const value: DemoContextValue = {
    state,
    login,
    logout,
    advanceToPhase,
    resetScenario,
    acknowledgeAlert,
    selectRoute,
    restrictSegment,
    submitIncident,
    resetDemoData,
    addSupervisorNotes,
    simulateFailure,
    autoAdvance,
    setAutoAdvance,
  };

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);
  if (context === undefined) {
    throw new Error('useDemoState must be used within a DemoStateProvider');
  }
  return context;
}
