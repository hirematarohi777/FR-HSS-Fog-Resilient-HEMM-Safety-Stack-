'use client';

import React from 'react';
import { Truck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarReading } from '@/lib/types';

interface ThreatRingProps {
  readings: PillarReading[];
  size?: number; // default 200
  onClick?: () => void;
  className?: string;
  showConflictBadge?: boolean; // show magenta conflict badge
}

export function ThreatRing({ readings, size = 200, onClick, className, showConflictBadge }: ThreatRingProps) {
  const radiusInner = 75;
  const radiusOuter = 95;
  const center = 100;
  const totalArcs = 5;
  const gapDegrees = 2;
  const arcLength = 72 - gapDegrees;

  // Detect conflict: vision nominal while acoustic is alert (or vice versa)
  const visionReading = readings.find(r => r.pillarId === 'vision');
  const acousticReading = readings.find(r => r.pillarId === 'acoustic');
  const hasConflict = showConflictBadge ??
    (visionReading && acousticReading &&
      ((visionReading.state === 'nominal' && acousticReading.state === 'alert') ||
       (visionReading.state === 'alert' && acousticReading.state === 'nominal')));

  const getPillarColor = (state: string) => {
    switch (state) {
      case 'nominal': return '#22C55E';
      case 'degraded': return '#F97316';
      case 'alert': return '#EF4444';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const hasAlert = readings.some(r => r.state === 'alert');
  const avgConfidence = readings.length
    ? Math.round(readings.reduce((sum, r) => sum + r.confidence, 0) / readings.length)
    : 0;

  // Scale factor for smaller sizes
  const scale = size / 200;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-300",
        hasAlert && "animate-pulse-slow ring-4 ring-red-500/20",
        className
      )}
      onClick={onClick}
      style={{ width: size, height: size }}
      role="button"
      aria-label={`Threat Ring — ${avgConfidence}% overall confidence`}
    >
      <svg
        viewBox="0 0 200 200"
        width="100%"
        height="100%"
        className="transform transition-transform duration-500"
      >
        <style>
          {`
            @keyframes threat-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.85; transform: scale(0.98); }
            }
            .animate-pulse-slow {
              animation: threat-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes conflict-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.2); }
            }
            .conflict-badge {
              animation: conflict-pulse 1.2s ease-in-out infinite;
            }
          `}
        </style>

        {/* Background arcs */}
        {Array.from({ length: totalArcs }).map((_, i) => {
          const startAngle = i * 72 + gapDegrees / 2;
          const endAngle = startAngle + arcLength;
          return (
            <path
              key={`bg-${i}`}
              d={describeArc(center, center, (radiusInner + radiusOuter) / 2, startAngle, endAngle)}
              fill="none"
              stroke="#374151"
              strokeWidth={radiusOuter - radiusInner}
              strokeLinecap="round"
            />
          );
        })}

        {/* Foreground (confidence) arcs */}
        {readings.slice(0, 5).map((reading, i) => {
          const startAngle = i * 72 + gapDegrees / 2;
          const fillLength = (reading.confidence / 100) * arcLength;
          if (fillLength <= 0) return null;

          const endAngle = startAngle + fillLength;
          const isDashed = reading.state === 'offline';

          return (
            <path
              key={`fg-${i}`}
              d={describeArc(center, center, (radiusInner + radiusOuter) / 2, startAngle, endAngle)}
              fill="none"
              stroke={getPillarColor(reading.state)}
              strokeWidth={radiusOuter - radiusInner - 2}
              strokeLinecap="round"
              strokeDasharray={isDashed ? "5,3" : undefined}
              className="transition-all duration-700 ease-out"
            />
          );
        })}

        {/* Center content */}
        <foreignObject x="50" y="50" width="100" height="100">
          <div className="flex flex-col items-center justify-center w-full h-full text-white">
            <Truck size={Math.round(32 * Math.min(scale, 1))} className="text-gray-300 mb-1" />
            <span className="text-2xl font-bold" style={{ fontSize: Math.round(24 * Math.min(scale, 1)) }}>
              {avgConfidence}%
            </span>
          </div>
        </foreignObject>

        {/* Conflict badge */}
        {hasConflict && (
          <g className="conflict-badge" transform="translate(155, 22)">
            <polygon
              points="0,-10 8.66,5 -8.66,5"
              fill="#D946EF"
              stroke="#0A0E14"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="18"
              fill="#D946EF"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
              fontFamily="monospace"
            >
              CONFLICT
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
