import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: string;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const s = severity.toLowerCase();
  
  let colorClass = 'bg-gray-500/20 text-gray-400 border-gray-700';
  let dotClass = 'bg-gray-500';

  if (s === 'critical' || s === 'high') {
    colorClass = 'bg-red-500/20 text-red-500 border-red-900/50';
    dotClass = 'bg-red-500';
  } else if (s === 'warning' || s === 'medium') {
    colorClass = 'bg-orange-500/20 text-orange-500 border-orange-900/50';
    dotClass = 'bg-orange-500';
  } else if (s === 'info') {
    colorClass = 'bg-cyan-500/20 text-cyan-500 border-cyan-900/50';
    dotClass = 'bg-cyan-500';
  } else if (s === 'low') {
    colorClass = 'bg-green-500/20 text-green-500 border-green-900/50';
    dotClass = 'bg-green-500';
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("uppercase text-[10px] tracking-wider px-2 py-0.5 flex items-center gap-1.5 rounded-sm font-semibold", colorClass, className)}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full", dotClass)} />
      {severity}
    </Badge>
  );
}
