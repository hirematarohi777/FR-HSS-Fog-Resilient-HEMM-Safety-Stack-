import React from 'react';
import { Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisclaimerBannerProps {
  text: string;
  variant?: 'warning' | 'danger' | 'info';
  className?: string;
}

export function DisclaimerBanner({ text, variant = 'info', className }: DisclaimerBannerProps) {
  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  
  return (
    <div className={cn(
      "flex items-start gap-2 p-2.5 rounded-md border",
      isDanger ? "bg-red-950/30 border-red-900/50 text-red-400" : 
      isWarning ? "bg-amber-950/30 border-amber-900/50 text-amber-400" : 
      "bg-cyan-950/30 border-cyan-900/50 text-cyan-400",
      className
    )}>
      {isDanger || isWarning ? (
        <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
      ) : (
        <Info size={14} className="mt-0.5 flex-shrink-0" />
      )}
      <span className="text-[11px] italic leading-tight">{text}</span>
    </div>
  );
}
