'use client';

import { useState } from 'react';
import { useDemoState } from '@/lib/demo-context';
import { Settings, RotateCcw, Play, Pause, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}

function ToggleRow({ label, description, checked, onChange, accentColor = '#06B6D4' }: ToggleRowProps) {
  return (
    <div className="flex items-center gap-4 py-3">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-[#9CA3AF] mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: checked ? accentColor : '#374151' }}
        role="switch"
        aria-checked={checked}
      >
        <div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(24px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { state, autoAdvance, setAutoAdvance, resetDemoData } = useDemoState();
  const router = useRouter();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleThemeToggle = () => {
    showToast('Theme switching available in a future release');
  };

  const handleSoundToggle = () => {
    showToast('Alert sounds will be configurable in a future release');
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    showToast('Demo data reset successfully');
    setTimeout(() => router.push('/dashboard'), 500);
  };

  const isAdmin = state.currentUser?.role === 'admin';

  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-white">Settings</h1>

      {/* Toast */}
      {toast && (
        <div className="fixed top-12 left-4 right-4 z-50 bg-[#1F2937] border border-[#374151] rounded-xl px-4 py-3 text-sm text-white shadow-2xl max-w-md mx-auto">
          {toast}
        </div>
      )}

      {/* Display */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="px-4 divide-y divide-[#374151]">
          <h3 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider py-3">Display</h3>
          <ToggleRow
            label="Dark Theme"
            description="Dark interface optimised for bright environments"
            checked={true}
            onChange={handleThemeToggle}
          />
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="px-4 divide-y divide-[#374151]">
          <h3 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider py-3">Notifications</h3>
          <ToggleRow
            label="Alert Sounds"
            description="Audio chime on critical alerts (sim)"
            checked={false}
            onChange={handleSoundToggle}
            accentColor="#F97316"
          />
        </CardContent>
      </Card>

      {/* Demo controls */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="px-4 divide-y divide-[#374151]">
          <h3 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider py-3">Demo Controls</h3>
          <ToggleRow
            label="Auto-Advance Scenario"
            description="Automatically advance one phase every 5 seconds (hands-free demo)"
            checked={autoAdvance}
            onChange={setAutoAdvance}
            accentColor="#22C55E"
          />
          {autoAdvance && (
            <div className="py-3">
              <div className="bg-[#14532D] border border-[#22C55E]/30 rounded-lg px-3 py-2 flex items-center gap-2">
                <Play size={12} className="text-[#22C55E]" />
                <span className="text-[11px] text-[#22C55E]">
                  Auto-advancing scenario — phase {state.scenarioPhase}/10
                  {state.scenarioPhase >= 10 ? ' (complete)' : ''}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin: Reset Demo Data */}
      {isAdmin && (
        <Card className="bg-[#111827] border-[#374151]">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">Admin</h3>

            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#7F1D1D20] border border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors font-medium text-sm"
              >
                <RotateCcw size={16} />
                Reset Demo Data
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-[#7F1D1D] border border-[#EF4444]/30 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#EF4444] mb-1">Reset all demo data?</p>
                      <p className="text-xs text-[#FCA5A5]">
                        This will clear all scenarios, alerts, incidents, segment restrictions, and route selections.
                        Your login session will be preserved.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2.5 rounded-lg border border-[#374151] text-[#9CA3AF] text-sm hover:bg-[#1F2937]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 py-2.5 rounded-lg bg-[#EF4444] text-white text-sm font-semibold hover:bg-red-700"
                    >
                      Confirm Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
            <p className="text-[10px] text-[#6B7280] italic text-center">
              Admin only — resets all simulated state to initial values
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
