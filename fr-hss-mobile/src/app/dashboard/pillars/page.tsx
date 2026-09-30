'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { PILLAR_META, PillarId } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Eye, Ear, Compass, Radio, ShieldAlert, ArrowUp, AlertTriangle, X } from 'lucide-react';
import { ThreatRing } from '@/components/threat-ring';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Eye, Ear, Compass, Radio, ShieldAlert,
};

function stateColor(state: string) {
  switch (state) {
    case 'nominal': return '#22C55E';
    case 'degraded': return '#F97316';
    case 'alert': return '#EF4444';
    case 'offline': return '#6B7280';
    default: return '#6B7280';
  }
}

function stateBg(state: string) {
  switch (state) {
    case 'degraded': return 'rgba(249,115,22,0.08)';
    case 'alert': return 'rgba(239,68,68,0.08)';
    case 'offline': return 'rgba(107,114,128,0.05)';
    default: return 'transparent';
  }
}

function DisclaimerBanner({ message }: { message: string }) {
  return (
    <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-lg p-3 mt-3">
      <p className="text-xs text-[#FCA5A5]">{message}</p>
    </div>
  );
}

export default function PillarsPage() {
  const { state } = useDemoState();
  const [showConflict, setShowConflict] = useState(false);

  const vehicleId = state.currentUser?.role === 'operator'
    ? (state.currentUser.vehicleId || 'dumper-01')
    : 'dumper-01';

  // readings is an array, not a record — fix the access pattern
  const readingsArray = state.pillars[vehicleId] || [];

  // Detect conflict
  const visionReading = readingsArray.find(r => r.pillarId === 'vision');
  const acousticReading = readingsArray.find(r => r.pillarId === 'acoustic');
  const hasConflict = visionReading && acousticReading &&
    ((visionReading.state === 'nominal' && acousticReading.state === 'alert') ||
     (visionReading.state === 'alert' && acousticReading.state === 'nominal'));

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4 pb-6">
      {/* Header with ring */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-white">Five-Pillar Intelligence</h1>
        <span className="px-2 py-1 bg-[#1F2937] text-[10px] font-bold text-[#F97316] rounded uppercase tracking-wider border border-[#F97316]/20">
          Simulated Data
        </span>
      </div>

      {/* Threat Ring summary */}
      <div className="flex items-center gap-5 bg-[#111827] border border-[#374151] rounded-xl p-4">
        <ThreatRing readings={readingsArray} size={100} />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-white mb-2">Overall Status</h3>
          <div className="space-y-1.5">
            {readingsArray.map(r => (
              <div key={r.pillarId} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stateColor(r.state) }} />
                <span className="text-xs text-[#9CA3AF] capitalize flex-1">
                  {PILLAR_META[r.pillarId as PillarId]?.name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-mono font-bold" style={{ color: stateColor(r.state) }}>
                  {r.confidence}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conflict badge & trigger */}
      {hasConflict && (
        <button
          onClick={() => setShowConflict(true)}
          className="w-full flex items-center gap-3 bg-[#1F2937] border border-[#D946EF]/40 rounded-xl px-4 py-3 hover:bg-[#D946EF]/5 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#D946EF]/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={16} className="text-[#D946EF]" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-bold text-[#D946EF]">Pillar Disagreement Detected</div>
            <div className="text-xs text-[#9CA3AF]">Vision and Acoustic reporting conflicting assessments</div>
          </div>
          <span className="text-[10px] bg-[#D946EF] text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
            CONFLICT
          </span>
        </button>
      )}

      {/* Accordion panels */}
      <Accordion multiple className="space-y-3">
        {(Object.keys(PILLAR_META) as PillarId[]).map(id => {
          const meta = PILLAR_META[id];
          const reading = readingsArray.find(r => r.pillarId === id);
          if (!reading) return null;

          const Icon = ICON_MAP[meta.icon] || ShieldAlert;
          const color = stateColor(reading.state);
          const bg = stateBg(reading.state);

          return (
            <AccordionItem
              key={id}
              value={id}
              className="border border-[#374151] rounded-xl overflow-hidden"
              style={{ background: '#111827' }}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#1F2937]/50 transition-colors [&>svg]:text-[#6B7280]">
                <div className="flex items-center flex-1 justify-between pr-3 gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ background: `${color}15` }}
                    >
                      <Icon size={18} className={color === '#22C55E' ? 'text-green-500' : color === '#F97316' ? 'text-orange-500' : color === '#EF4444' ? 'text-red-500' : 'text-gray-500'} />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white text-sm">{meta.name}</div>
                      <div className="text-[10px] text-[#6B7280] mt-0.5">{meta.description}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0 w-28">
                    <span className="text-[10px] uppercase font-bold" style={{ color }}>
                      {reading.state}
                    </span>
                    <div className="w-full h-1.5 bg-[#374151] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${reading.confidence}%`, background: color }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold" style={{ color }}>
                      {reading.confidence}% (sim)
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent
                className="border-t border-[#374151] px-4 py-4"
                style={{ background: bg }}
              >
                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-[#6B7280] uppercase tracking-wider mb-1">Current Reading</div>
                    <div className="text-sm font-medium text-white">{reading.label}</div>
                  </div>

                  {reading.detail && (
                    <div className="text-sm text-[#9CA3AF] leading-relaxed">{reading.detail}</div>
                  )}

                  {id === 'acoustic' && reading.bearing !== undefined && (
                    <div className="flex items-center gap-3 bg-[#1F2937] rounded-lg px-3 py-2">
                      <Compass size={14} className="text-[#9CA3AF]" />
                      <span className="text-sm text-white font-mono">Bearing: {reading.bearing}°</span>
                      <div
                        className="w-5 h-5 flex items-center justify-center"
                        style={{ transform: `rotate(${reading.bearing}deg)` }}
                      >
                        <ArrowUp size={16} className="text-[#F97316]" />
                      </div>
                      <span className="text-xs text-[#9CA3AF]">
                        {reading.bearing >= 270 || reading.bearing < 45 ? 'North' :
                         reading.bearing < 135 ? 'East' :
                         reading.bearing < 225 ? 'South' : 'West'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-[#6B7280] pt-1">
                    <div>Confidence: <span className="font-mono" style={{ color }}>{reading.confidence}%</span> (simulated)</div>
                    <div>Updated: {new Date(reading.timestamp).toLocaleTimeString()}</div>
                  </div>

                  {id === 'ebs' && (
                    <DisclaimerBanner message="SIMULATION — Software does not control the independent hardwired braking path. Status shown is entirely simulated and has no connection to actual EBS hardware." />
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Conflict split-view sheet */}
      <Sheet open={showConflict} onOpenChange={setShowConflict}>
        <SheetContent side="bottom" className="bg-[#111827] border-t border-[#374151] rounded-t-2xl px-5 py-6">
          <SheetHeader className="mb-5">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-white text-lg">Pillar Disagreement</SheetTitle>
              <button
                onClick={() => setShowConflict(false)}
                className="p-2 rounded-full bg-[#1F2937] text-[#9CA3AF]"
              >
                <X size={16} />
              </button>
            </div>
          </SheetHeader>

          <div className="space-y-4">
            <div className="bg-[#78350F] border border-[#F97316]/30 rounded-xl p-3">
              <p className="text-xs text-[#FDE68A]">
                ⚠ Two pillars are reporting conflicting assessments. This demonstrates why multi-pillar fusion matters — a single sensor could be wrong.
              </p>
              <p className="text-[10px] text-[#F97316]/70 mt-1 italic">SIMULATED CONDITION</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[visionReading, acousticReading].map(r => {
                if (!r) return null;
                const meta = PILLAR_META[r.pillarId];
                const Icon = ICON_MAP[meta.icon] || ShieldAlert;
                const color = stateColor(r.state);
                return (
                  <div
                    key={r.pillarId}
                    className="bg-[#1F2937] border rounded-xl p-4 space-y-2"
                    style={{ borderColor: `${color}40` }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={color === '#22C55E' ? 'text-green-500' : color === '#F97316' ? 'text-orange-500' : color === '#EF4444' ? 'text-red-500' : 'text-gray-500'} />
                      <span className="text-xs font-bold text-white">{meta.name.split(' ')[0]}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase" style={{ color }}>{r.state}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{r.label}</div>
                    </div>
                    <div className="w-full h-1.5 bg-[#374151] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${r.confidence}%`, background: color }} />
                    </div>
                    <div className="text-[10px] font-mono font-bold" style={{ color }}>{r.confidence}% conf.</div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-[#6B7280] text-center italic">
              FR-HSS fuses all five pillars to resolve disagreements. No single pillar is authoritative.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
