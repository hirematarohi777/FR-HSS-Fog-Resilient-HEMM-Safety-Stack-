'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { Segment } from '@/lib/types';
import { X, MapPin, Users, Lock, Unlock } from 'lucide-react';

// SVG viewport: 0 0 400 340
// Road network: Y-shape with blind bend at B-7
const ROAD_PATHS = [
  { id: 'B-5', label: 'Haul Road South', d: 'M 60 300 L 170 195', color: 'open' },
  { id: 'B-6', label: 'Approach East',  d: 'M 320 300 L 210 195', color: 'open' },
  { id: 'B-7', label: 'Blind Bend',     d: 'M 170 195 L 210 195 L 200 120', color: 'open' },
  { id: 'B-8', label: 'Bypass North',   d: 'M 170 195 L 140 100 L 200 120', color: 'open' },
  { id: 'B-9', label: 'Haul Road North',d: 'M 200 120 L 200 40',  color: 'open' },
];

// Segment midpoints for labels and tap hit areas
const SEGMENT_CENTERS: Record<string, { x: number; y: number }> = {
  'B-5': { x: 100, y: 257 },
  'B-6': { x: 268, y: 255 },
  'B-7': { x: 200, y: 168 },
  'B-8': { x: 158, y: 148 },
  'B-9': { x: 200, y: 80 },
};

// Vehicle position: state.vehicles[].position is {x: 0-100, y: 0-100}
// Map those to SVG coords (400w x 340h)
function posToSvg(x: number, y: number): { svgX: number; svgY: number } {
  return {
    svgX: (x / 100) * 400,
    svgY: (y / 100) * 340,
  };
}

function getSegmentColor(status: string) {
  switch (status) {
    case 'restricted': return '#F97316'; // amber
    case 'occupied': return '#EF4444';   // red
    default: return '#374151';           // charcoal open
  }
}

interface SegmentDetailProps {
  segment: Segment;
  onClose: () => void;
  onRestrict: () => void;
  canRestrict: boolean;
}

function SegmentDetail({ segment, onClose, onRestrict, canRestrict }: SegmentDetailProps) {
  const statusColor = segment.status === 'occupied' ? '#EF4444' : segment.status === 'restricted' ? '#F97316' : '#22C55E';
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#111827] border-t border-[#374151] rounded-t-2xl p-5 z-30 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">{segment.id} — {segment.label}</h3>
          <span className="text-xs font-mono mt-0.5" style={{ color: statusColor }}>
            {segment.status.toUpperCase()}
          </span>
        </div>
        <button onClick={onClose} className="p-2 rounded-full bg-[#1F2937] text-[#9CA3AF] hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
          <Users size={14} />
          <span>
            {segment.occupants.length > 0
              ? `Occupants: ${segment.occupants.map(v => v.toUpperCase()).join(', ')}`
              : 'No vehicles in segment'}
          </span>
        </div>

        {segment.status === 'occupied' && (
          <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-lg p-3 text-xs text-[#EF4444]">
            ⚠ OCCUPIED × {segment.occupants.length} — Dual occupancy at bend
          </div>
        )}

        {canRestrict && segment.status !== 'occupied' && (
          <div className="pt-2 border-t border-[#374151]">
            <button
              onClick={onRestrict}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                segment.status === 'restricted'
                  ? 'bg-[#374151] text-[#9CA3AF] hover:bg-[#4B5563]'
                  : 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30 hover:bg-[#F97316]/20'
              }`}
            >
              {segment.status === 'restricted' ? <Unlock size={14} /> : <Lock size={14} />}
              {segment.status === 'restricted' ? 'Remove Restriction' : 'Restrict Segment'}
            </button>
            <p className="text-[10px] text-[#9CA3AF] text-center mt-2 italic">
              Demo state only — does not control mine infrastructure
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  const { state, restrictSegment } = useDemoState();
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const role = state.currentUser?.role;
  const canRestrict = role === 'supervisor' || role === 'admin';
  const isPhase6Plus = state.scenarioPhase >= 6;

  const segmentMap: Record<string, Segment> = {};
  state.segments.forEach(s => { segmentMap[s.id] = s; });

  const selectedSeg = selectedSegment ? segmentMap[selectedSegment] : null;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-28px-56px)] bg-[#0A0E14]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-white">Mine Map</h1>
        <div className="flex items-center gap-2 mt-1">
          <MapPin size={12} className="text-[#F97316]" />
          <span className="text-[11px] text-[#F97316]">
            ILLUSTRATIVE — Not actual mine roads. Geometry is not real mine data.
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mb-3 flex gap-3 flex-wrap">
        {[
          { color: '#374151', label: 'Open' },
          { color: '#F97316', label: 'Restricted' },
          { color: '#EF4444', label: 'Occupied' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            <span className="text-[11px] text-[#9CA3AF]">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]" />
          <span className="text-[11px] text-[#9CA3AF]">Dumper-01</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
          <span className="text-[11px] text-[#9CA3AF]">Dumper-02</span>
        </div>
      </div>

      {/* SVG Map */}
      <div className="relative flex-1 mx-4 mb-4 bg-[#111827] border border-[#374151] rounded-xl overflow-hidden">
        <svg
          viewBox="0 0 400 340"
          className="w-full h-full"
          style={{ minHeight: 280 }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1F2937" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="400" height="340" fill="url(#grid)" />

          {/* Road segments — outer thick stroke */}
          {ROAD_PATHS.map(road => {
            const seg = segmentMap[road.id];
            const color = seg ? getSegmentColor(seg.status) : '#374151';
            const isSelected = selectedSegment === road.id;
            return (
              <g key={road.id}>
                <path
                  d={road.d}
                  fill="none"
                  stroke={color}
                  strokeWidth={isSelected ? 18 : 14}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color}80)` : undefined }}
                  className="transition-all duration-300"
                />
                {/* Center line */}
                <path
                  d={road.d}
                  fill="none"
                  stroke="#0A0E14"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6,4"
                />
                {/* Tap hit area */}
                <path
                  d={road.d}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={32}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedSegment(selectedSegment === road.id ? null : road.id)}
                />
              </g>
            );
          })}

          {/* Segment labels */}
          {ROAD_PATHS.map(road => {
            const center = SEGMENT_CENTERS[road.id];
            if (!center) return null;
            const seg = segmentMap[road.id];
            const color = seg ? getSegmentColor(seg.status) : '#374151';
            return (
              <g key={`label-${road.id}`}>
                <rect
                  x={center.x - 14}
                  y={center.y - 9}
                  width={28}
                  height={18}
                  rx={4}
                  fill="#111827"
                  stroke={color}
                  strokeWidth="1"
                />
                <text
                  x={center.x}
                  y={center.y + 4}
                  fill={color}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {road.id}
                </text>
              </g>
            );
          })}

          {/* Conflict zone (phase 6+) */}
          {isPhase6Plus && (
            <g>
              <circle
                cx={200}
                cy={168}
                r={32}
                fill="#EF4444"
                fillOpacity={0.15}
                stroke="#EF4444"
                strokeWidth={1.5}
                strokeDasharray="4,3"
              >
                <animate attributeName="r" values="28;36;28" dur="2s" repeatCount="indefinite" />
                <animate attributeName="fillOpacity" values="0.1;0.25;0.1" dur="2s" repeatCount="indefinite" />
              </circle>
              <text
                x={200}
                y={168}
                fill="#EF4444"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                CONFLICT
              </text>
            </g>
          )}

          {/* Vehicle markers */}
          {state.vehicles.map(vehicle => {
            const { svgX, svgY } = posToSvg(vehicle.position.x, vehicle.position.y);
            const isOwn = vehicle.id === state.currentUser?.vehicleId;
            const color = isOwn ? '#06B6D4' : '#F59E0B';
            const headingRad = ((vehicle.heading - 90) * Math.PI) / 180;
            const arrowLen = 18;
            const ax = svgX + Math.cos(headingRad) * arrowLen;
            const ay = svgY + Math.sin(headingRad) * arrowLen;

            // Only show dumper-02 if phase >= 5 (V2V sharing revealed it)
            if (vehicle.id === 'dumper-02' && state.scenarioPhase < 5) return null;

            return (
              <g key={vehicle.id}>
                {/* Pulse ring for own vehicle */}
                {isOwn && (
                  <circle cx={svgX} cy={svgY} r={16} fill="none" stroke={color} strokeWidth={1} strokeOpacity={0.4}>
                    <animate attributeName="r" values="12;22;12" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="strokeOpacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Vehicle body */}
                <circle cx={svgX} cy={svgY} r={10} fill={color} stroke="#0A0E14" strokeWidth={2} />
                {/* Truck icon (simplified) */}
                <rect x={svgX - 5} y={svgY - 4} width={10} height={8} rx={2} fill="#0A0E14" fillOpacity={0.5} />
                {/* Heading arrow */}
                <line
                  x1={svgX}
                  y1={svgY}
                  x2={ax}
                  y2={ay}
                  stroke={color}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle cx={ax} cy={ay} r={3} fill={color} />
                {/* Label */}
                <text
                  x={svgX}
                  y={svgY + 22}
                  fill={color}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {vehicle.label.toUpperCase()}
                </text>
                <text
                  x={svgX}
                  y={svgY + 31}
                  fill={color}
                  fontSize="7"
                  textAnchor="middle"
                  fillOpacity={0.7}
                >
                  {vehicle.speed} km/h
                </text>
              </g>
            );
          })}

          {/* Map watermark */}
          <text
            x={200}
            y={330}
            fill="#374151"
            fontSize="8"
            textAnchor="middle"
            fontStyle="italic"
          >
            ILLUSTRATIVE MINE MAP — Not actual mine road data
          </text>
        </svg>

        {/* Segment detail sheet */}
        {selectedSeg && (
          <SegmentDetail
            segment={selectedSeg}
            onClose={() => setSelectedSegment(null)}
            onRestrict={() => restrictSegment(selectedSeg.id)}
            canRestrict={canRestrict}
          />
        )}
      </div>

      {/* Phase info */}
      {state.scenarioPhase > 0 && (
        <div className="mx-4 mb-4 bg-[#1F2937] border border-[#374151] rounded-lg px-4 py-3">
          <p className="text-xs text-[#9CA3AF]">
            Scenario Phase <span className="text-[#06B6D4] font-mono font-bold">{state.scenarioPhase}/10</span>
            {state.scenarioPhase >= 5 && ' — Dumper-02 visible via V2V'}
            {state.scenarioPhase >= 6 && ' · Conflict zone active'}
            {state.scenarioPhase >= 8 && ' · Segment B-7 occupied'}
          </p>
        </div>
      )}
    </div>
  );
}
