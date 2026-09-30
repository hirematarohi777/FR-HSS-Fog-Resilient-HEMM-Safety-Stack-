'use client';

import { useDemoState } from '@/lib/demo-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Compass, Gauge, Navigation, Users, Activity, ChevronRight, AlertTriangle } from 'lucide-react';
import { ThreatRing } from '@/components/threat-ring';
import { PillarChip } from '@/components/pillar-chip';
import { AlertBanner } from '@/components/alert-banner';

// Mini SVG map (matches the full map page layout)
const MINI_ROAD_PATHS = [
  { id: 'B-5', d: 'M 15 85 L 48 53' },
  { id: 'B-6', d: 'M 85 85 L 58 53' },
  { id: 'B-7', d: 'M 48 53 L 58 53 L 53 28' },
  { id: 'B-8', d: 'M 48 53 L 36 25 L 53 28' },
  { id: 'B-9', d: 'M 53 28 L 53 8' },
];

function getSegmentColor(segId: string, segments: { id: string; status: string }[]) {
  const seg = segments.find(s => s.id === segId);
  if (!seg) return '#374151';
  if (seg.status === 'occupied') return '#EF4444';
  if (seg.status === 'restricted') return '#F97316';
  return '#4B5563';
}

function posToMiniSvg(x: number, y: number) {
  return { svgX: (x / 100) * 100, svgY: (y / 100) * 100 };
}

function MiniMap() {
  const { state } = useDemoState();
  const router = useRouter();
  const isPhase6Plus = state.scenarioPhase >= 6;

  return (
    <div
      className="w-full h-[150px] bg-[#0A0E14] rounded-lg overflow-hidden cursor-pointer relative"
      onClick={() => router.push('/dashboard/map')}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid */}
        <defs>
          <pattern id="mini-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1F2937" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mini-grid)" />

        {/* Road paths */}
        {MINI_ROAD_PATHS.map(road => (
          <path
            key={road.id}
            d={road.d}
            fill="none"
            stroke={getSegmentColor(road.id, state.segments)}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-colors duration-300"
          />
        ))}

        {/* Conflict zone */}
        {isPhase6Plus && (
          <circle cx={53} cy={40} r={10} fill="#EF4444" fillOpacity={0.2} stroke="#EF4444" strokeWidth={0.8}>
            <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Vehicles */}
        {state.vehicles.map(vehicle => {
          if (vehicle.id === 'dumper-02' && state.scenarioPhase < 5) return null;
          const { svgX, svgY } = posToMiniSvg(vehicle.position.x, vehicle.position.y);
          const isOwn = vehicle.id === state.currentUser?.vehicleId;
          const color = isOwn ? '#06B6D4' : '#F59E0B';
          return (
            <g key={vehicle.id}>
              {isOwn && (
                <circle cx={svgX} cy={svgY} r={6} fill="none" stroke={color} strokeWidth={0.5} strokeOpacity={0.4}>
                  <animate attributeName="r" values="4;9;4" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="strokeOpacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={svgX} cy={svgY} r={3.5} fill={color} stroke="#0A0E14" strokeWidth={0.8} />
            </g>
          );
        })}

        {/* "ILLUS." label */}
        <text x={50} y={98} fill="#374151" fontSize="4" textAnchor="middle" fontStyle="italic">
          ILLUSTRATIVE MAP
        </text>
      </svg>

      {/* Tap overlay */}
      <div className="absolute bottom-2 right-2 bg-[#1F2937]/80 px-2 py-1 rounded text-[10px] text-[#06B6D4]">
        Full Map →
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { state, acknowledgeAlert } = useDemoState();
  const router = useRouter();

  const currentUser = state.currentUser;
  if (!currentUser) return null;

  // ── Supervisor View ──────────────────────────────────────────────
  if (currentUser.role === 'supervisor') {
    const criticalAlert = state.alerts.find(a => a.severity === 'critical' && a.status === 'new');
    const b7 = state.segments.find(s => s.id === 'B-7');

    return (
      <div className="p-4 space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Fleet Overview</h1>
            <p className="text-xs text-[#9CA3AF]">Supervisor — {currentUser.name}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-[#F97316]/10 text-[#F97316] rounded border border-[#F97316]/30">
            SIMULATED
          </span>
        </div>

        {/* Dual occupancy warning */}
        {b7 && b7.status === 'occupied' && b7.occupants.length >= 2 && (
          <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#EF4444]" />
              <span className="text-[#EF4444] font-bold text-sm">Segment B-7 — DUAL OCCUPANCY</span>
            </div>
            <p className="text-xs text-[#FCA5A5] mt-1">
              Both Dumper-01 and Dumper-02 detected converging at blind bend.
            </p>
          </div>
        )}

        {/* Vehicles */}
        <div className="space-y-3">
          {state.vehicles.map(vehicle => {
            if (vehicle.id === 'dumper-02' && state.scenarioPhase < 5) return null;
            const vehicleReadings = state.pillars[vehicle.id] || [];
            const hasAlert = vehicleReadings.some(r => r.state === 'alert');
            const seg = state.segments.find(s => s.id === vehicle.segment);
            return (
              <Card
                key={vehicle.id}
                className="bg-[#111827] border-[#374151] overflow-hidden cursor-pointer hover:border-[#4B5563] transition-colors"
                style={{ borderLeft: `3px solid ${hasAlert ? '#EF4444' : '#22C55E'}` }}
                onClick={() => router.push('/dashboard/fleet')}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <ThreatRing readings={vehicleReadings} size={52} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white font-mono">{vehicle.label}</div>
                    <div className="text-xs text-[#9CA3AF]">
                      Seg: <span className="text-[#06B6D4] font-mono">{vehicle.segment}</span>
                      {' · '}
                      <span className="font-mono">{vehicle.speed} km/h</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#374151]" />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <button
          onClick={() => router.push('/dashboard/fleet')}
          className="w-full py-3 bg-[#111827] border border-[#374151] rounded-xl text-sm text-[#06B6D4] hover:bg-[#1F2937] transition-colors"
        >
          Full Fleet View →
        </button>
      </div>
    );
  }

  // ── Admin View ──────────────────────────────────────────────────
  if (currentUser.role === 'admin') {
    return (
      <div className="p-4 space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">System Health</h1>
            <p className="text-xs text-[#9CA3AF]">Admin — {currentUser.name}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-[#22C55E]/10 text-[#22C55E] rounded border border-[#22C55E]/30">
            SIMULATED
          </span>
        </div>

        {/* Pillar status grid */}
        <div className="grid grid-cols-1 gap-2">
          {(['vision', 'acoustic', 'magnetic_nav', 'v2v', 'ebs'] as const).map(pillarId => {
            const health = state.systemHealth.pillars[pillarId];
            const statusColor = health.softwareStatus === 'online' ? '#22C55E' : health.softwareStatus === 'degraded' ? '#F97316' : '#EF4444';
            return (
              <div key={pillarId} className="flex items-center gap-3 bg-[#111827] border border-[#374151] rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor }} />
                <span className="text-sm text-white capitalize flex-1">{pillarId.replace('_', ' ')}</span>
                <span className="text-xs font-bold uppercase" style={{ color: statusColor }}>{health.softwareStatus}</span>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => router.push('/dashboard/system-health')}
          className="w-full py-3 bg-[#111827] border border-[#374151] rounded-xl text-sm text-[#06B6D4] hover:bg-[#1F2937] transition-colors"
        >
          Full System Health →
        </button>
      </div>
    );
  }

  // ── Operator View ──────────────────────────────────────────────
  const vehicleId = currentUser.vehicleId || 'dumper-01';
  const vehicle = state.vehicles.find(v => v.id === vehicleId);
  const readings = state.pillars[vehicleId] || [];
  const newCriticalAlert = state.alerts.find(a => a.status === 'new' && a.severity === 'critical');
  const recentAlerts = [...state.alerts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 2);

  const getHeadingLabel = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  return (
    <div className="flex flex-col space-y-4 pb-6">
      {/* App header bar */}
      <div className="h-12 bg-[#1F2937] flex items-center justify-between px-4 sticky top-[28px] z-10">
        <span className="font-bold text-white text-lg">FR-HSS</span>
        <span className="text-sm font-mono text-[#9CA3AF]">{vehicle?.label || vehicleId.toUpperCase()}</span>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          <span className="text-xs text-[#9CA3AF]">Connected</span>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Threat Ring */}
        <div className="py-4 flex justify-center">
          <ThreatRing
            readings={readings}
            size={200}
            onClick={() => router.push('/dashboard/pillars')}
          />
        </div>

        {/* Pillar Chips Row */}
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {readings.map((reading) => (
            <PillarChip
              key={reading.pillarId}
              reading={reading}
              onClick={() => router.push('/dashboard/pillars')}
            />
          ))}
        </div>

        {/* Alert Banner */}
        {newCriticalAlert && (
          <AlertBanner
            alert={newCriticalAlert}
            onView={() => router.push('/dashboard/alerts')}
            onAcknowledge={() => {}}
          />
        )}

        {/* Position Card */}
        <Card className="bg-[#1F2937] border-[#374151]">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center space-y-1">
                <Navigation className="text-[#9CA3AF]" size={20} />
                <span className="text-xs text-[#9CA3AF]">Segment</span>
                <span className="font-mono text-white text-sm">{vehicle?.segment || 'B-5'}</span>
              </div>
              <div className="flex flex-col items-center space-y-1 border-x border-[#374151] px-2">
                <Gauge className="text-[#9CA3AF]" size={20} />
                <span className="text-xs text-[#9CA3AF]">Speed</span>
                <span className="font-mono text-white text-sm">{vehicle?.speed || 0} km/h</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <Compass className="text-[#9CA3AF]" size={20} />
                <span className="text-xs text-[#9CA3AF]">Heading</span>
                <span className="font-mono text-white text-sm">{vehicle?.heading || 0}° {getHeadingLabel(vehicle?.heading || 0)}</span>
              </div>
            </div>
            <div className="mt-3 text-center text-[10px] text-[#9CA3AF] italic">
              All values are simulated / illustrative — not measured data
            </div>
          </CardContent>
        </Card>

        {/* Mini-map — live SVG */}
        <Card
          className="bg-[#1F2937] border-[#374151] cursor-pointer hover:border-[#9CA3AF]/30 transition-colors overflow-hidden"
          onClick={() => router.push('/dashboard/map')}
        >
          <MiniMap />
          <CardContent className="p-2">
            <div className="text-center text-xs text-[#06B6D4]">Tap to open full map →</div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white">Recent Alerts ({state.alerts.length})</h3>
            <button onClick={() => router.push('/dashboard/alerts')} className="text-xs text-[#06B6D4] hover:underline">
              See All →
            </button>
          </div>

          <div className="space-y-2">
            {recentAlerts.length > 0 ? (
              recentAlerts.map(alert => (
                <div key={alert.id} className="bg-[#1F2937] border border-[#374151] rounded-lg p-3 flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        alert.severity === 'critical' ? 'bg-[#EF4444]' :
                        alert.severity === 'warning' ? 'bg-[#F97316]' : 'bg-[#06B6D4]'
                      }`} />
                      <span className="text-sm font-medium text-white truncate">{alert.title}</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-1 line-clamp-1">{alert.description}</p>
                  </div>
                  <div className="flex flex-col items-end ml-2 flex-shrink-0">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      alert.status === 'new' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#374151] text-[#9CA3AF]'
                    }`}>
                      {alert.status === 'new' ? 'NEW' : 'ACK'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-[#1F2937] rounded-lg border border-[#374151]">
                <span className="text-sm text-[#9CA3AF]">No active alerts. All pillar readings are nominal.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
