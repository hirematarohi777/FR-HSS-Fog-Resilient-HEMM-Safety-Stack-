'use client';

import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  alert: Alert;
  onView: () => void;
  onAcknowledge: () => void;
}

export function AlertBanner({ alert, onView, onAcknowledge }: AlertBannerProps) {
  if (!alert || alert.severity !== 'critical' || alert.status !== 'new') return null;

  return (
    <div className="w-full bg-[#7F1D1D] border-l-4 border-red-500 p-4 min-h-[72px] animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start gap-3">
        <AlertOctagon className="text-white mt-1 flex-shrink-0" size={24} />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-[15px] truncate">{alert.title}</h3>
          <p className="text-red-100 text-sm line-clamp-2 mt-1">
            {alert.description}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Button 
              variant="ghost" 
              className="text-white hover:text-white hover:bg-white/10 h-8 px-3 text-sm"
              onClick={onView}
            >
              View
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-red-900 h-8 px-3 text-sm"
              onClick={onAcknowledge}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
