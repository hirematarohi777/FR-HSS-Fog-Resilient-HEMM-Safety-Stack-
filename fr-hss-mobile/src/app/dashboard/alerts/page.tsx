'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { PILLAR_META } from '@/lib/types';
import { Eye, Ear, Compass, Radio, ShieldAlert, CheckCircle, AlertTriangle, XCircle, WifiOff } from 'lucide-react';
import { ThreatRing } from '@/components/threat-ring';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const PILLAR_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  vision: Eye,
  acoustic: Ear,
  magnetic_nav: Compass,
  v2v: Radio,
  ebs: ShieldAlert,
};

function StateIcon({ state }: { state: string }) {
  switch (state) {
    case 'nominal': return <CheckCircle size={14} className="text-[#22C55E]" />;
    case 'degraded': return <AlertTriangle size={14} className="text-[#F97316]" />;
    case 'alert': return <XCircle size={14} className="text-[#EF4444]" />;
    case 'offline': return <WifiOff size={14} className="text-[#6B7280]" />;
    default: return null;
  }
}

function stateColor(state: string) {
  switch (state) {
    case 'nominal': return '#22C55E';
    case 'degraded': return '#F97316';
    case 'alert': return '#EF4444';
    case 'offline': return '#6B7280';
    default: return '#6B7280';
  }
}

export default function AlertsPage() {
  const { state, acknowledgeAlert } = useDemoState();
  const router = useRouter();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const alerts = [...state.alerts].sort((a, b) => b.createdAt - a.createdAt);
  const newCount = alerts.filter(a => a.status === 'new').length;

  const confirmingAlert = alerts.find(a => a.id === confirmingId);

  const handleConfirmAck = () => {
    if (confirmingId) {
      acknowledgeAlert(confirmingId);
      setConfirmingId(null);
    }
  };

  const vehicleId = state.currentUser?.role === 'operator'
    ? (state.currentUser.vehicleId || 'dumper-01')
    : 'dumper-01';
  const readings = state.pillars[vehicleId] || [];

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          Alert Center
          {newCount > 0 && (
            <span className="bg-[#EF4444] text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {newCount} New
            </span>
          )}
        </h1>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#1F2937] border-l-4 border-[#F97316] p-3 rounded-r-lg">
        <p className="text-xs text-[#9CA3AF]">
          <span className="text-[#F97316] font-medium">Important: </span>
          Acknowledging an alert records your awareness. It does <strong className="text-white">NOT</strong> resolve the underlying hazard. The Threat Ring will remain unchanged.
        </p>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3 bg-[#111827] rounded-xl border border-[#374151]">
            <div className="w-16 h-16 rounded-full bg-[#1F2937] flex items-center justify-center">
              <ShieldAlert size={32} className="text-[#374151]" />
            </div>
            <p className="text-[#9CA3AF] max-w-xs text-sm">
              No active alerts. All pillar readings are nominal.
            </p>
            <p className="text-xs text-[#374151]">
              Start the scenario demo to see alerts in action.
            </p>
          </div>
        ) : (
          alerts.map(alert => {
            const isNew = alert.status === 'new';
            const isCritical = alert.severity === 'critical';
            const isWarning = alert.severity === 'warning';
            const borderColor = isCritical ? '#EF4444' : isWarning ? '#F97316' : '#06B6D4';
            const bgColor = isCritical ? '#7F1D1D20' : isWarning ? '#7C2D1220' : '#164E6320';

            return (
              <Card
                key={alert.id}
                className="overflow-hidden border-[#374151]"
                style={{ background: bgColor, borderLeft: `4px solid ${borderColor}` }}
              >
                <div className="p-4 space-y-3">
                  {/* Alert header */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        {isCritical ? (
                          <XCircle size={16} className="text-[#EF4444]" />
                        ) : isWarning ? (
                          <AlertTriangle size={16} className="text-[#F97316]" />
                        ) : (
                          <CheckCircle size={16} className="text-[#06B6D4]" />
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm leading-snug">{alert.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                        style={{
                          background: isNew ? `${borderColor}30` : '#37415150',
                          color: isNew ? borderColor : '#9CA3AF',
                        }}
                      >
                        {isNew ? 'NEW' : 'ACKNOWLEDGED'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{alert.description}</p>

                  {/* Pillar tags */}
                  {alert.pillarIds && alert.pillarIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {alert.pillarIds.map(pid => {
                        const Icon = PILLAR_ICONS[pid];
                        return (
                          <span
                            key={pid}
                            className="flex items-center gap-1 text-[10px] bg-[#374151] text-[#9CA3AF] px-2 py-0.5 rounded border border-[#4B5563] uppercase"
                          >
                            {Icon && <Icon size={10} />}
                            {PILLAR_META[pid]?.name.split(' ')[0] || pid}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Vehicle tags */}
                  {alert.vehicleIds && alert.vehicleIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {alert.vehicleIds.map(vid => (
                        <span key={vid} className="text-[10px] text-[#06B6D4] font-mono bg-[#164E6330] px-2 py-0.5 rounded">
                          {vid.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#374151]">
                    <div className="text-xs text-[#6B7280]">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                      {!isNew && alert.acknowledgedAt && (
                        <span className="ml-2">
                          · Ack by <span className="text-[#9CA3AF]">{alert.acknowledgedBy}</span> at{' '}
                          {new Date(alert.acknowledgedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>

                    {isNew && (
                      <button
                        onClick={() => setConfirmingId(alert.id)}
                        className="text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        style={{ background: `${borderColor}20`, color: borderColor, border: `1px solid ${borderColor}40` }}
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Threat Ring snapshot */}
      {readings.length > 0 && (
        <div className="bg-[#111827] border border-[#374151] rounded-xl p-4">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-3">Current Threat Ring Status</h3>
          <div className="flex items-center gap-4">
            <ThreatRing readings={readings} size={80} onClick={() => router.push('/dashboard/pillars')} />
            <div className="flex-1 space-y-1.5">
              {readings.map(r => {
                const Icon = PILLAR_ICONS[r.pillarId];
                return (
                  <div key={r.pillarId} className="flex items-center gap-2">
                    <StateIcon state={r.state} />
                    {Icon && <Icon size={12} className="text-[#6B7280]" />}
                    <span className="text-xs text-[#9CA3AF] capitalize">{r.pillarId.replace('_', ' ')}</span>
                    <div className="flex-1 h-1 bg-[#374151] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${r.confidence}%`, background: stateColor(r.state) }}
                      />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: stateColor(r.state) }}>
                      {r.confidence}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-[#6B7280] mt-3 italic text-center">
            Threat Ring does not change on acknowledgement — hazard persists until scenario resolves
          </p>
        </div>
      )}

      {/* Acknowledgement confirmation sheet */}
      <Sheet open={!!confirmingId} onOpenChange={open => !open && setConfirmingId(null)}>
        <SheetContent side="bottom" className="bg-[#111827] border-t border-[#374151] rounded-t-2xl px-5 py-6">
          <SheetHeader className="mb-5 text-left">
            <SheetTitle className="text-white text-lg">Confirm Acknowledgement</SheetTitle>
          </SheetHeader>

          {confirmingAlert && (
            <div className="space-y-4">
              <div
                className="p-3 rounded-lg border-l-4"
                style={{
                  borderColor: confirmingAlert.severity === 'critical' ? '#EF4444' : '#F97316',
                  background: confirmingAlert.severity === 'critical' ? '#7F1D1D20' : '#7C2D1220',
                }}
              >
                <p className="text-white font-medium text-sm">{confirmingAlert.title}</p>
              </div>

              <div className="bg-[#78350F] border border-[#F97316]/30 rounded-xl p-4 space-y-2">
                <p className="text-[#FDE68A] text-sm font-medium">⚠ Before you acknowledge:</p>
                <ul className="space-y-1.5">
                  {[
                    'This records your awareness of the alert.',
                    'It does NOT resolve the underlying hazard.',
                    'The Threat Ring will remain in its current state.',
                    'The conflict zone will remain on the map.',
                    'Supervisor can see your acknowledgement.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#FDE68A]/80">
                      <span className="text-[#F97316] mt-0.5 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white h-12"
                  onClick={() => setConfirmingId(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-[#EF4444] hover:bg-red-700 text-white h-12 font-semibold"
                  onClick={handleConfirmAck}
                >
                  Confirm Acknowledge
                </Button>
              </div>

              <p className="text-[10px] text-[#6B7280] text-center italic">
                SIMULATED ENVIRONMENT — Demo state only
              </p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
