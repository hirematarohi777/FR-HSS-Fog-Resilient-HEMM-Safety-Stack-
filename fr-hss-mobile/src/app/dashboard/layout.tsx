'use client';

import { useDemoState } from '@/lib/demo-context';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { Sidebar } from '@/components/sidebar';
import { SimLabel } from '@/components/sim-label';
import { ScenarioControls } from '@/components/scenario-controls';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { state } = useDemoState();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) {
      router.push('/');
    }
  }, [state.currentUser, router]);

  if (!state.currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#0A0E14] flex-col md:flex-row">
      {/* Sidebar — desktop only */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col relative w-full pb-[72px] md:pb-0 overflow-x-hidden min-h-screen">
        {/* Persistent sim label */}
        <SimLabel />

        {/* Page content */}
        <div className="flex-1 w-full max-w-[600px] md:max-w-none mx-auto">
          {children}
        </div>

        {/* Scenario controls — floating button */}
        <ScenarioControls />
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
}
