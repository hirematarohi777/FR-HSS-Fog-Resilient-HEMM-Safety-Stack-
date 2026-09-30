'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Layers, Map, Bell, Menu } from 'lucide-react';
import { useDemoState } from '@/lib/demo-context';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useDemoState();

  const newAlertsCount = state.alerts.filter(a => a.status === 'new').length;

  const tabs = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Pillars', href: '/dashboard/pillars', icon: Layers },
    { name: 'Map', href: '/dashboard/map', icon: Map },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: newAlertsCount },
    { name: 'More', href: '/dashboard/more', icon: Menu },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#111827] border-t border-gray-800 z-40 flex justify-between items-center px-2">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.name}
            onClick={() => router.push(tab.href)}
            className={`flex-1 h-full flex flex-col items-center justify-center relative ${isActive ? 'text-[#06B6D4]' : 'text-gray-400 hover:text-gray-300'}`}
          >
            {isActive && <div className="absolute top-1 w-1 h-1 rounded-full bg-[#06B6D4]" />}
            <div className="relative mt-1">
              <Icon className="w-5 h-5" />
              {tab.badge ? (
                <div className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {tab.badge}
                </div>
              ) : null}
            </div>
            <span className="text-[11px] mt-1">{tab.name}</span>
          </button>
        );
      })}
    </div>
  );
}
