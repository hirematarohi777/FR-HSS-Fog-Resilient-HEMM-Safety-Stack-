'use client';

import { useDemoState } from '@/lib/demo-context';
import { useRouter } from 'next/navigation';
import { Play, Route, FileText, BookOpen, User, Settings, ChevronRight, Activity, Users } from 'lucide-react';

export default function MorePage() {
  const { state } = useDemoState();
  const router = useRouter();

  const role = state.currentUser?.role;

  const menuItems = [
    { icon: Play, label: 'Scenario Demo', href: '/dashboard/scenario', roles: ['operator', 'supervisor', 'admin'] },
    { icon: Route, label: 'Routes', href: '/dashboard/routes', roles: ['operator', 'supervisor', 'admin'] },
    { icon: FileText, label: 'Incidents', href: '/dashboard/incidents', roles: ['operator', 'supervisor', 'admin'] },
    { icon: BookOpen, label: 'SOP Assistant', href: '/dashboard/sop', roles: ['operator', 'supervisor', 'admin'] },
    { icon: Activity, label: 'System Health', href: '/dashboard/system-health', roles: ['supervisor', 'admin'] },
    { icon: Users, label: 'Fleet View', href: '/dashboard/fleet', roles: ['supervisor', 'admin'] },
    { icon: User, label: 'Profile', href: '/dashboard/profile', roles: ['operator', 'supervisor', 'admin'] },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings', roles: ['operator', 'supervisor', 'admin'] },
  ].filter(item => !role || item.roles.includes(role));

  return (
    <div className="p-4 max-w-md mx-auto space-y-2 pb-6">
      <h1 className="text-xl font-bold text-white mb-5">More</h1>

      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            onClick={() => router.push(item.href)}
            className="w-full flex items-center justify-between p-4 bg-[#111827] hover:bg-[#1F2937] border border-[#374151] hover:border-[#4B5563] transition-all rounded-xl h-14"
          >
            <div className="flex items-center space-x-3 text-[#E5E7EB]">
              <div className="w-8 h-8 rounded-lg bg-[#1F2937] flex items-center justify-center">
                <Icon size={18} className="text-[#9CA3AF]" />
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-[#6B7280]" />
          </button>
        );
      })}
    </div>
  );
}
