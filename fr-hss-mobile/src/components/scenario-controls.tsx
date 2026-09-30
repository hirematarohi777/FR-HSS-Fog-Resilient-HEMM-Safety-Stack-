'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useDemoState } from '@/lib/demo-context';
import { getPhaseDescription } from '@/lib/scenario-engine';
import { Badge } from '@/components/ui/badge';
import { ScenarioPhase } from '@/lib/types';

export function ScenarioControls() {
  const [open, setOpen] = useState(false);
  const { state, advanceToPhase, resetScenario } = useDemoState();
  const currentPhase = state.scenarioPhase;
  const maxPhase = 10;
  
  const handleNextStep = () => {
    if (currentPhase < maxPhase) {
      advanceToPhase((currentPhase + 1) as ScenarioPhase);
    }
  };

  const handleReset = () => {
    resetScenario();
    setOpen(false);
  };

  return (
    <>
      {/* FAB — opens sheet; using a plain div to avoid nested <button> inside SheetTrigger */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Open Scenario Controls"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-[#06B6D4] rounded-full flex items-center justify-center shadow-lg text-white hover:bg-cyan-600 transition-colors z-40 cursor-pointer active:scale-95 select-none"
      >
        <Play size={24} className="ml-1" fill="currentColor" />
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" className="bg-gray-900 border-t border-gray-800 text-gray-100 rounded-t-xl px-4 pb-8 pt-6">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-gray-100">Scenario Controls</SheetTitle>
            <Badge variant="outline" className="bg-cyan-950 text-cyan-400 border-cyan-800">
              Phase {currentPhase}/{maxPhase}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            <span className="font-medium text-gray-200">{getPhaseDescription(state.scenarioPhase).title}</span>
            {' — '}
            {getPhaseDescription(state.scenarioPhase).description}
          </p>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#06B6D4] h-full transition-all duration-300"
              style={{ width: `${(currentPhase / maxPhase) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 bg-[#06B6D4] hover:bg-cyan-600 text-white font-medium text-base"
              onClick={handleNextStep}
              disabled={currentPhase >= maxPhase}
            >
              Next Step
            </Button>
            <Button 
              variant="outline"
              className="w-full h-11 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              onClick={handleReset}
            >
              Reset Scenario
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 italic">
            Deterministic simulation — each step applies fixed state changes
          </p>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}
