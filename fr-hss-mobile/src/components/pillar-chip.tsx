'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { PillarReading, PILLAR_META } from '@/lib/types';

interface PillarChipProps {
  reading: PillarReading;
  onClick?: () => void;
}

export function PillarChip({ reading, onClick }: PillarChipProps) {
  const getPillarColorClass = (state: string) => {
    switch (state) {
      case 'nominal': return 'bg-green-500';
      case 'degraded': return 'bg-orange-500';
      case 'alert': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const isNotNominal = reading.state !== 'nominal';
  const name = PILLAR_META[reading.pillarId]?.name.split(' ')[0] || reading.pillarId;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full px-3 py-1.5 min-h-[36px]",
        "bg-[#1F2937] ring-1 ring-white/5",
        "hover:bg-gray-700 transition-colors active:scale-95 flex-shrink-0"
      )}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          getPillarColorClass(reading.state),
          isNotNominal && "animate-pulse"
        )}
      />
      <span className="text-[13px] text-[#9CA3AF] font-medium tracking-wide whitespace-nowrap">
        {reading.pillarId === 'magnetic_nav' ? 'MagNav' :
         reading.pillarId === 'ebs' ? 'EBS' :
         name}
      </span>
    </button>
  );
}
