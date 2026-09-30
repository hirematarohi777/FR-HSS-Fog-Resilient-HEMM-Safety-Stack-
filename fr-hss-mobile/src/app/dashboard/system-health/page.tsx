'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { PILLAR_META, PillarId } from '@/lib/types';
import { Eye, Ear, Compass, Radio, ShieldAlert, Activity, Wifi, HardDrive, AlertTriangle, CheckCircle, XCircle, WifiOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

const PILLAR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  vision: Eye, acoustic: Ear, magnetic_nav: Compass, v2v: Radio, ebs: ShieldAlert,
};

function statusConfig(s: string) {
  switch (s) {
    case 'online': return { color: '#22C55E', bg: '#14532D', label: 'ONLINE', Icon: CheckCircle };
    case 'degraded': return { color: '#F97316', bg: '#7C2D12', label: 'DEGRADED', Icon: AlertTriangle };
    case 'offline': return { color: '#EF4444', bg: '#7F1D1D', label: 'OFFLINE', Icon: XCircle };
    default: return { color: '#6B7280', bg: '#374151', label: 'UNKNOWN', Icon: WifiOff };
  }
}

interface FailureToggle {
  id: 'stale_v2v' | 'poor_mag' | 'vision_offline' | 'sensor_disagree';
  label: string;
  description: string;
}

const FAILURE_TOGGLES: FailureToggle[] = [
  { id: 'stale_v2v', label: 'Stale V2V Data', description: 'V2V readings older than 5s (sim)' },
  { id: 'poor_mag', label: 'Poor Magnetic Positioning', description: 'Magnetic nav confidence <30% (sim)' },
  { id: 'vision_offline', label: 'Vision Offline', description: 'Neuromorphic camera offline (sim)' },
  { id: 'sensor_disagree', label: 'Sensor Disagreement', description: 'Vision says clear, acoustic says alert (sim)' },
];

export default function SystemHealthPage() {
  const { state, simulateFailure } = useDemoState();
  const router = useRouter();

  const [activeFailures, setActiveFailures] = useState<Record<string, boolean>>({});

  const role = state.currentUser?.role;
  if (role !== 'supervisor' && role !== 'admin') {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px]">
        <Activity size={48} className="text-[#374151] mb-4" />
        <p className="text-[#9CA3AF]">System Health is for supervisors and admins only.</p>
      </div>
    );
  }

  const isAdmin = role === 'admin';

  const toggleFailure = (id: FailureToggle['id']) => {
    const newActive = !activeFailures[id];
    setActiveFailures(prev => ({ ...prev, [id]: newActive }));
    simulateFailure(id, newActive);
  };

  const health = state.systemHealth;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">System Health</h1>
        <span className="text-xs px-2 py-1 bg-[#1F2937] text-[#F97316] rounded border border-[#F97316]/30">
          SIMULATED
        </span>
      </div>

      {/* Network & Storage */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[#111827] border-[#374151]">
          <CardContent className="p-4 text-center">
            <Wifi size={20} className="text-[#06B6D4] mx-auto mb-2" />
            <div className="text-lg font-mono font-bold text-white">{health.networkLatency}ms</div>
            <div className="text-[10px] text-[#9CA3AF]">Network Latency</div>
            <div className="text-[9px] text-[#6B7280] italic mt-0.5">simulated</div>
          </CardContent>
        </Card>
        <Card className="bg-[#111827] border-[#374151]">
          <CardContent className="p-4 text-center">
            <HardDrive size={20} className="text-[#22C55E] mx-auto mb-2" />
            <div className="text-lg font-mono font-bold text-white">{health.storageUsed}%</div>
            <div className="text-[10px] text-[#9CA3AF]">Storage Used</div>
            <div className="w-full h-1.5 bg-[#374151] rounded-full overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${health.storageUsed}%`,
                  background: health.storageUsed > 80 ? '#EF4444' : health.storageUsed > 60 ? '#F97316' : '#22C55E',
                }}
              />
            </div>
            <div className="text-[9px] text-[#6B7280] italic mt-1">simulated</div>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Health Cards */}
      <section>
        <h2 className="text-sm font-medium text-[#9CA3AF] mb-3 uppercase tracking-wider">Pillar Software Status</h2>
        <div className="space-y-2">
          {(Object.keys(PILLAR_META) as PillarId[]).map(pillarId => {
            const meta = PILLAR_META[pillarId];
            const Icon = PILLAR_ICONS[pillarId] || Activity;
            const pillarHealth = health.pillars[pillarId];
            const sc = statusConfig(pillarHealth.softwareStatus);
            const StatusIcon = sc.Icon;
            const reading = state.pillars['dumper-01']?.find(r => r.pillarId === pillarId);

            return (
              <div
                key={pillarId}
                className="flex items-center gap-3 bg-[#111827] border border-[#374151] rounded-xl px-4 py-3 cursor-pointer hover:border-[#4B5563] transition-colors"
                onClick={() => router.push('/dashboard/pillars')}
              >
                <div className="p-2 rounded-lg bg-[#1F2937] flex-shrink-0">
                  <Icon size={18} className="text-[#9CA3AF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{meta.name}</div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">{pillarHealth.note}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${sc.color}20`, color: sc.color }}
                  >
                    <StatusIcon size={10} />
                    {sc.label}
                  </div>
                  {reading && (
                    <div className="text-[10px] text-[#6B7280] font-mono">{reading.confidence}% conf.</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EBS Hardware disclaimer */}
      <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert size={20} className="text-[#FCA5A5] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-[#EF4444] mb-1">EBS Hardware Path — Not Connected</div>
            <p className="text-xs text-[#FCA5A5] leading-relaxed">
              {health.ebsHardwareNote}<br />
              <strong>SIMULATION — Software does not control the independent hardwired braking path.</strong>
              Status shown in this prototype is entirely simulated.
            </p>
          </div>
        </div>
      </div>

      {/* Failure simulation — admin or supervisor */}
      <section>
        <h2 className="text-sm font-medium text-[#9CA3AF] mb-1 uppercase tracking-wider">Simulate Failure Conditions</h2>
        <p className="text-[11px] text-[#6B7280] mb-3">
          These toggles modify simulated pillar readings and propagate to the Threat Ring, Pillar Detail, and Map.
        </p>
        <div className="space-y-2">
          {FAILURE_TOGGLES.map(ft => {
            const isActive = !!activeFailures[ft.id];
            return (
              <button
                key={ft.id}
                onClick={() => toggleFailure(ft.id)}
                className="w-full flex items-center gap-3 bg-[#111827] border rounded-xl px-4 py-3 transition-all"
                style={{
                  borderColor: isActive ? '#EF444450' : '#374151',
                  background: isActive ? '#7F1D1D15' : '#111827',
                }}
              >
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium" style={{ color: isActive ? '#FCA5A5' : '#E5E7EB' }}>
                    {ft.label}
                  </div>
                  <div className="text-[10px] text-[#6B7280]">{ft.description}</div>
                </div>
                {isActive ? (
                  <ToggleRight size={24} className="text-[#EF4444] flex-shrink-0" />
                ) : (
                  <ToggleLeft size={24} className="text-[#374151] flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {Object.values(activeFailures).some(Boolean) && (
          <div className="mt-3 bg-[#78350F] border border-[#F97316]/30 rounded-lg p-3">
            <p className="text-[11px] text-[#FDE68A]">
              ⚠ Active failure simulation — Threat Ring and Pillar Detail will reflect these conditions.
              Check for CONFLICT badge if Sensor Disagreement is active.
            </p>
          </div>
        )}

        <p className="text-[10px] text-[#6B7280] italic mt-2 text-center">
          SIMULATED CONDITIONS — These do not reflect actual sensor or hardware states
        </p>
      </section>

      {/* Admin: Reset */}
      {isAdmin && (
        <section>
          <h2 className="text-sm font-medium text-[#9CA3AF] mb-3 uppercase tracking-wider">Admin Actions</h2>
          <button
            onClick={() => router.push('/dashboard/settings')}
            className="w-full flex items-center justify-between bg-[#111827] border border-[#374151] hover:border-[#9CA3AF]/30 rounded-xl px-4 py-3 text-sm text-[#9CA3AF] hover:text-white transition-colors"
          >
            <span>Reset Demo Data</span>
            <span className="text-[#6B7280]">→ Settings</span>
          </button>
        </section>
      )}
    </div>
  );
}
