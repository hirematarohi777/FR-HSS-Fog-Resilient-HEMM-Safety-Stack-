'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Layers, Map, Bell, Menu, Users, Activity, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useDemoState } from '@/lib/demo-context';
import * as React from 'react';

const ROLE_COLORS: Record<string, string> = {
  operator: '#06B6D4',
  supervisor: '#F97316',
  admin: '#22C55E',
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, logout } = useDemoState();
  const [collapsed, setCollapsed] = React.useState(false);

  const currentUser = state.currentUser;
  if (!currentUser) return null;

  const newAlertsCount = state.alerts.filter(a => a.status === 'new').length;

  const tabs = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Pillars', href: '/dashboard/pillars', icon: Layers },
    { name: 'Map', href: '/dashboard/map', icon: Map },
    { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: newAlertsCount },
    ...(currentUser.role === 'supervisor' ? [{ name: 'Fleet', href: '/dashboard/fleet', icon: Users }] : []),
    ...(currentUser.role === 'admin' ? [{ name: 'System Health', href: '/dashboard/system-health', icon: Activity }] : []),
    { name: 'More', href: '/dashboard/more', icon: Menu },
  ];

  const roleColor = ROLE_COLORS[currentUser.role] || '#9CA3AF';

  return (
    <div className={`hidden md:flex flex-col bg-[#111827] border-r border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} min-h-screen sticky top-0`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
        {!collapsed && <span className="font-bold text-white text-lg">FR-HSS</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.name}
              onClick={() => router.push(tab.href)}
              className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                isActive 
                  ? 'bg-gray-800/50 text-[#06B6D4] border-l-2 border-[#06B6D4]' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/30 border-l-2 border-transparent'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className="w-5 h-5" />
                {tab.badge ? (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                    {tab.badge}
                  </div>
                ) : null}
              </div>
              {!collapsed && <span className="ml-3 text-sm font-medium">{tab.name}</span>}
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-800 p-4">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: `${roleColor}30`, color: roleColor }}
              >
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                <p className="text-xs uppercase" style={{ color: roleColor }}>{currentUser.role}</p>
              </div>
            </div>
            <button onClick={() => { logout(); router.push('/'); }} className="text-gray-400 hover:text-white p-1.5">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: `${roleColor}30`, color: roleColor }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <button onClick={() => { logout(); router.push('/'); }} className="text-gray-400 hover:text-white p-1">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
