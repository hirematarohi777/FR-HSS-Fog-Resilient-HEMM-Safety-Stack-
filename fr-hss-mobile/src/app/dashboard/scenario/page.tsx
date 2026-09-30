'use client';

import { useDemoState } from '@/lib/demo-context';
import { getPhaseDescription } from '@/lib/scenario-engine';
import { ScenarioPhase, PILLAR_META, PillarId } from '@/lib/types';
import { CheckCircle, Circle, Play, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

const TOTAL_PHASES = 10;

function pillarDotColor(pillarId: PillarId, phase: number, currentPhase: number) {
  if (phase > currentPhase) return '#374151'; // future
  const colors: Record<PillarId, string> = {
    vision: '#06B6D4',
    acoustic: '#F97316',
    magnetic_nav: '#22C55E',
    v2v: '#8B5CF6',
    ebs: '#EF4444',
  };
  return colors[pillarId] || '#9CA3AF';
}

export default function ScenarioPage() {
  const { state, advanceToPhase, resetScenario } = useDemoState();
  const currentPhase = state.scenarioPhase;
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [currentPhase]);

  const handleNext = () => {
    if (currentPhase < TOTAL_PHASES) {
      advanceToPhase((currentPhase + 1) as ScenarioPhase);
    }
  };

  const handleReset = () => {
    resetScenario();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Scenario Walkthrough</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">
          Two-dumper blind-bend event — 10-step demonstration
        </p>
      </div>

      {/* Scenario controls */}
      <div className="bg-[#111827] border border-[#374151] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">
            Phase {currentPhase} / {TOTAL_PHASES}
          </span>
          <div className="flex items-center gap-2">
            {currentPhase > 0 && (
              <span className="text-xs font-mono text-[#06B6D4]">
                {getPhaseDescription(currentPhase as ScenarioPhase).title}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-[#1F2937] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#06B6D4] to-[#22C55E] h-full transition-all duration-700 ease-out rounded-full"
            style={{ width: `${(currentPhase / TOTAL_PHASES) * 100}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-[#374151] text-[#9CA3AF] hover:bg-[#1F2937] hover:text-white h-11"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentPhase >= TOTAL_PHASES}
            className="flex-1 bg-[#06B6D4] hover:bg-cyan-600 text-white h-11 font-semibold"
          >
            <Play size={16} className="mr-2" fill="currentColor" />
            {currentPhase >= TOTAL_PHASES ? 'Complete' : 'Play Next Step'}
          </Button>
        </div>

        <p className="text-[10px] text-[#6B7280] italic text-center">
          Deterministic simulation — each step applies fixed, reproducible state changes
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-3 bottom-3 w-0.5 bg-[#374151]" />

        <div className="space-y-3">
          {Array.from({ length: TOTAL_PHASES }, (_, i) => {
            const phase = (i + 1) as ScenarioPhase;
            const info = getPhaseDescription(phase);
            const isCompleted = currentPhase >= phase;
            const isActive = currentPhase === phase;
            const isFuture = currentPhase < phase;

            return (
              <div
                key={phase}
                ref={isActive ? activeRef : undefined}
                className="relative flex gap-4 transition-all duration-500"
              >
                {/* Step indicator */}
                <div
                  className="relative z-10 flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                  style={{
                    background: isCompleted
                      ? isActive
                        ? '#06B6D4'
                        : '#14532D'
                      : '#111827',
                    borderColor: isCompleted
                      ? isActive
                        ? '#06B6D4'
                        : '#22C55E'
                      : '#374151',
                    boxShadow: isActive ? '0 0 16px rgba(6,182,212,0.4)' : 'none',
                  }}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle size={18} className="text-[#22C55E]" />
                  ) : isActive ? (
                    <Zap size={18} className="text-white" />
                  ) : (
                    <span className="text-xs font-mono text-[#6B7280] font-bold">{phase}</span>
                  )}
                </div>

                {/* Card */}
                <div
                  className="flex-1 mb-1 rounded-xl border p-4 transition-all duration-300"
                  style={{
                    background: isActive
                      ? '#164E6320'
                      : isCompleted
                      ? '#14532D10'
                      : '#0A0E14',
                    borderColor: isActive
                      ? '#06B6D4'
                      : isCompleted
                      ? '#22C55E30'
                      : '#374151',
                    borderLeft: isActive ? '3px solid #06B6D4' : isCompleted ? '3px solid #22C55E50' : '3px solid #374151',
                    opacity: isFuture ? 0.55 : 1,
                  }}
                >
                  {/* Step title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3
                        className="text-sm font-bold"
                        style={{ color: isActive ? '#06B6D4' : isCompleted ? '#E5E7EB' : '#6B7280' }}
                      >
                        {info.title}
                      </h3>
                      <p className="text-xs text-[#9CA3AF] mt-0.5">{info.description}</p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] bg-[#06B6D4] text-white px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0">
                        Active
                      </span>
                    )}
                    {isCompleted && !isActive && (
                      <span className="text-[9px] bg-[#14532D] text-[#22C55E] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0">
                        Done
                      </span>
                    )}
                  </div>

                  {/* Pillar involvement dots */}
                  {info.pillars.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-[#6B7280]">Pillars:</span>
                      {info.pillars.map((pillarId) => (
                        <div
                          key={pillarId}
                          className="flex items-center gap-1"
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                            style={{ background: pillarDotColor(pillarId, phase, currentPhase) }}
                          />
                          <span
                            className="text-[10px] capitalize"
                            style={{ color: pillarDotColor(pillarId, phase, currentPhase) }}
                          >
                            {PILLAR_META[pillarId]?.name.split(' ')[0] || pillarId}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phase-specific detail blocks */}
                  {isCompleted && phase === 6 && (
                    <div className="mt-3 bg-[#7F1D1D] border border-[#EF4444]/30 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-[#FCA5A5]">
                        🔴 CRITICAL alert generated — Vehicle Convergence at Bend B-7
                      </p>
                    </div>
                  )}
                  {isCompleted && phase === 9 && (
                    <div className="mt-3 bg-[#1F2937] border border-[#374151] rounded-lg px-3 py-2">
                      <p className="text-[11px] text-[#9CA3AF] italic">
                        SIMULATION — EBS status shown. Software does not control the independent hardwired braking path.
                      </p>
                    </div>
                  )}
                  {isCompleted && phase === 10 && (
                    <div className="mt-3 bg-[#164E63] border border-[#06B6D4]/30 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-[#06B6D4]">
                        ✓ Incident auto-logged to history with full pillar snapshot
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion banner */}
      {currentPhase >= TOTAL_PHASES && (
        <div className="bg-[#14532D] border border-[#22C55E]/30 rounded-xl p-5 text-center">
          <CheckCircle size={32} className="text-[#22C55E] mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg mb-1">Scenario Complete</h3>
          <p className="text-xs text-[#9CA3AF] mb-4">
            All 10 phases demonstrated. The incident has been logged. Check Incident History for the full event record.
          </p>
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-[#22C55E]/50 text-[#22C55E] hover:bg-[#22C55E]/10"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset & Run Again
          </Button>
        </div>
      )}
    </div>
  );
}
