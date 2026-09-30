import React from 'react';
import { AlertTriangle } from 'lucide-react';

export function SimLabel() {
  return (
    <div className="sticky top-0 z-50 w-full h-[28px] bg-[#78350F] flex items-center justify-center px-4">
      <div className="flex items-center gap-2">
        <AlertTriangle size={14} className="text-[#FDE68A]" />
        <span className="text-[#FDE68A] text-[11px] uppercase tracking-wider font-semibold">
          Simulated Environment
        </span>
      </div>
    </div>
  );
}
