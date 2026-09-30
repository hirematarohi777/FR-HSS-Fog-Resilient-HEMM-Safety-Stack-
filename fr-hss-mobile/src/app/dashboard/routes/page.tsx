'use client';

import { useDemoState } from '@/lib/demo-context';
import { Route, CheckCircle, AlertTriangle, ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const configs = {
    low: { bg: '#14532D', text: '#22C55E', border: '#22C55E30', label: 'LOW RISK' },
    medium: { bg: '#78350F', text: '#F59E0B', border: '#F59E0B30', label: 'MEDIUM RISK' },
    high: { bg: '#7F1D1D', text: '#EF4444', border: '#EF444430', label: 'HIGH RISK' },
  };
  const c = configs[level];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded border uppercase"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {c.label}
    </span>
  );
}

export default function RoutesPage() {
  const { state, selectRoute } = useDemoState();

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Advisory Routes</h1>
        <p className="text-xs text-[#9CA3AF] mt-1">Illustrative route options for the current scenario</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#1F2937] border border-[#F97316]/30 border-l-4 border-l-[#F97316] rounded-r-lg p-3">
        <p className="text-xs text-[#9CA3AF]">
          <span className="text-[#F97316] font-medium">Advisory comparison only — </span>
          selecting a route does not authorize vehicle movement or configure mine infrastructure.
        </p>
      </div>

      {/* Route Cards */}
      <div className="space-y-4">
        {state.routes.map(route => {
          const isSelected = route.selected;
          const borderColor = isSelected ? '#06B6D4' : '#374151';

          return (
            <Card
              key={route.id}
              className="overflow-hidden transition-all duration-300"
              style={{
                background: isSelected ? '#164E6315' : '#111827',
                border: `2px solid ${borderColor}`,
                boxShadow: isSelected ? `0 0 0 1px ${borderColor}30` : 'none',
              }}
            >
              <CardContent className="p-5 space-y-4">
                {/* Route header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Route size={16} className={isSelected ? 'text-[#06B6D4]' : 'text-[#9CA3AF]'} />
                      <h3 className="font-bold text-white text-sm">{route.label}</h3>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">{route.description}</p>
                  </div>
                  <RiskBadge level={route.riskLevel} />
                </div>

                {/* Segment path */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {route.segments.map((seg, i) => (
                    <div key={seg} className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-mono font-bold px-2 py-1 rounded"
                        style={{
                          background: seg === 'B-7' ? '#7F1D1D' : '#1F2937',
                          color: seg === 'B-7' ? '#EF4444' : '#E5E7EB',
                          border: `1px solid ${seg === 'B-7' ? '#EF444440' : '#374151'}`,
                        }}
                      >
                        {seg}
                        {seg === 'B-7' && ' ⚠'}
                      </span>
                      {i < route.segments.length - 1 && (
                        <ChevronRight size={12} className="text-[#374151]" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Info row */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <Clock size={12} />
                    <span>{route.estimatedTime}</span>
                  </div>
                  {route.riskLevel === 'low' && (
                    <div className="flex items-center gap-1 text-xs text-[#22C55E]">
                      <ShieldCheck size={12} />
                      <span>Avoids blind bend</span>
                    </div>
                  )}
                  {route.riskLevel === 'high' && (
                    <div className="flex items-center gap-1 text-xs text-[#EF4444]">
                      <AlertTriangle size={12} />
                      <span>Passes through B-7</span>
                    </div>
                  )}
                </div>

                {/* Advisory note */}
                <div className="bg-[#1F2937] rounded-lg p-3 text-xs text-[#9CA3AF] italic">
                  {route.advisoryNote}
                </div>

                {/* Select button */}
                <button
                  onClick={() => selectRoute(route.id)}
                  className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                  style={{
                    background: isSelected ? '#06B6D4' : '#1F2937',
                    color: isSelected ? 'white' : '#9CA3AF',
                    border: `1px solid ${isSelected ? '#06B6D4' : '#374151'}`,
                  }}
                >
                  {isSelected ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Selected for Advisory
                    </span>
                  ) : (
                    'Select for Advisory'
                  )}
                </button>

                {isSelected && (
                  <p className="text-[10px] text-[#06B6D4]/70 text-center italic">
                    This selection is advisory only — it does not authorize vehicle movement
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conflict warning (phase 6+) */}
      {state.scenarioPhase >= 6 && (
        <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-[#EF4444]" />
            <span className="text-[#EF4444] font-bold text-sm">Route A — B-7 Conflict Active</span>
          </div>
          <p className="text-xs text-[#FCA5A5]">
            Conflict zone detected at segment B-7. Route A passes through the predicted convergence point. Route B (bypass) is recommended.
          </p>
          <p className="text-[10px] text-[#EF4444]/60 mt-2 italic">
            Illustrative advisory — not an operational directive
          </p>
        </div>
      )}
    </div>
  );
}
