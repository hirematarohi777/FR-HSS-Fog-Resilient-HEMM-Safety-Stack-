'use client';

import { useDemoState } from '@/lib/demo-context';
import { ThreatRing } from '@/components/threat-ring';
import { Users, Lock, Unlock, Truck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

function statusColor(status: string) {
  switch (status) {
    case 'occupied': return '#EF4444';
    case 'restricted': return '#F97316';
    default: return '#22C55E';
  }
}

function statusBg(status: string) {
  switch (status) {
    case 'occupied': return '#7F1D1D30';
    case 'restricted': return '#7C2D1230';
    default: return '#14532D30';
  }
}

export default function FleetPage() {
  const { state, restrictSegment } = useDemoState();
  const router = useRouter();

  const role = state.currentUser?.role;
  if (role !== 'supervisor' && role !== 'admin') {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[400px]">
        <Users size={48} className="text-[#374151] mb-4" />
        <p className="text-[#9CA3AF]">Fleet view is for supervisors and admins only.</p>
      </div>
    );
  }

  const canRestrict = role === 'supervisor' || role === 'admin';

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Fleet Overview</h1>
        <span className="text-xs px-2 py-1 bg-[#1F2937] text-[#F97316] rounded border border-[#F97316]/30">
          SIMULATED
        </span>
      </div>

      {/* Vehicle Cards */}
      <section>
        <h2 className="text-sm font-medium text-[#9CA3AF] mb-3 uppercase tracking-wider">Vehicles</h2>
        <div className="space-y-3">
          {state.vehicles.map(vehicle => {
            const vehicleReadings = state.pillars[vehicle.id] || [];
            const hasAlert = vehicleReadings.some(r => r.state === 'alert');
            const hasDegradation = vehicleReadings.some(r => r.state === 'degraded');
            const operatorName = vehicle.id === 'dumper-01' ? 'Ravi Kumar' : 'Demo Operator';
            const seg = state.segments.find(s => s.id === vehicle.segment);

            // Only show dumper-02 once V2V connects (phase 5+)
            const isVisible = vehicle.id === 'dumper-01' || state.scenarioPhase >= 5;
            if (!isVisible) return null;

            return (
              <Card
                key={vehicle.id}
                className="bg-[#111827] border-[#374151] overflow-hidden"
                style={{ borderLeft: `3px solid ${hasAlert ? '#EF4444' : hasDegradation ? '#F97316' : '#22C55E'}` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Mini Threat Ring */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/dashboard/pillars')}>
                      <ThreatRing readings={vehicleReadings} size={64} />
                    </div>

                    {/* Vehicle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={14} className="text-[#06B6D4]" />
                        <span className="font-bold text-white font-mono">{vehicle.label}</span>
                        {hasAlert && <XCircle size={14} className="text-[#EF4444]" />}
                        {!hasAlert && hasDegradation && <AlertTriangle size={14} className="text-[#F97316]" />}
                        {!hasAlert && !hasDegradation && <CheckCircle size={14} className="text-[#22C55E]" />}
                      </div>
                      <p className="text-xs text-[#9CA3AF]">Operator: {operatorName}</p>

                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="bg-[#1F2937] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#6B7280]">Segment</div>
                          <div className="text-xs font-mono text-white font-bold">{vehicle.segment}</div>
                        </div>
                        <div className="bg-[#1F2937] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#6B7280]">Speed</div>
                          <div className="text-xs font-mono text-[#06B6D4] font-bold">{vehicle.speed} km/h</div>
                        </div>
                        <div className="bg-[#1F2937] rounded-lg p-2 text-center">
                          <div className="text-[10px] text-[#6B7280]">Heading</div>
                          <div className="text-xs font-mono text-white font-bold">{vehicle.heading}°</div>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#6B7280] italic mt-2">
                        Speed/heading are illustrative — not measured data
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {state.scenarioPhase < 5 && (
            <div className="text-center py-6 bg-[#111827] border border-dashed border-[#374151] rounded-xl">
              <p className="text-[#9CA3AF] text-sm">
                Dumper-02 not yet visible — advance to Phase 5 (V2V Sharing)
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Segment Status */}
      <section>
        <h2 className="text-sm font-medium text-[#9CA3AF] mb-3 uppercase tracking-wider">Segment Status</h2>
        <div className="space-y-2">
          {state.segments.map(seg => {
            const color = statusColor(seg.status);
            const bg = statusBg(seg.status);

            return (
              <div
                key={seg.id}
                className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: bg, borderColor: `${color}30` }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold"
                  style={{ background: `${color}20`, color }}
                >
                  {seg.id}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{seg.label}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase" style={{ color }}>
                      {seg.status}
                    </span>
                    {seg.occupants.length > 0 && (
                      <span className="text-[10px] text-[#9CA3AF]">
                        × {seg.occupants.length}: {seg.occupants.map(v => v.replace('dumper-', 'D').toUpperCase()).join(', ')}
                      </span>
                    )}
                    {seg.status === 'occupied' && seg.occupants.length >= 2 && (
                      <span className="text-[10px] bg-[#EF4444] text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                        DUAL
                      </span>
                    )}
                  </div>
                </div>

                {/* Restriction toggle — supervisor/admin only */}
                {canRestrict && seg.status !== 'occupied' && (
                  <button
                    onClick={() => restrictSegment(seg.id)}
                    className="flex-shrink-0 p-2 rounded-lg transition-colors"
                    style={{
                      background: seg.status === 'restricted' ? '#F97316' + '20' : '#37415150',
                      color: seg.status === 'restricted' ? '#F97316' : '#9CA3AF',
                    }}
                    title={seg.status === 'restricted' ? 'Remove restriction' : 'Restrict segment'}
                  >
                    {seg.status === 'restricted' ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {canRestrict && (
          <p className="text-[10px] text-[#6B7280] italic mt-2 text-center">
            Demo state only — segment restrictions do not control mine infrastructure
          </p>
        )}
      </section>

      {/* Phase indicator */}
      {state.scenarioPhase >= 8 && (
        <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-[#EF4444]" />
            <span className="text-[#EF4444] font-bold text-sm">Segment B-7 — DUAL OCCUPANCY</span>
          </div>
          <p className="text-xs text-[#FCA5A5]">
            Both Dumper-01 and Dumper-02 are detected in segment B-7 (Blind Bend). Supervisor action recommended.
          </p>
        </div>
      )}
    </div>
  );
}
