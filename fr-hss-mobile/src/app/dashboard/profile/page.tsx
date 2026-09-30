'use client';

import { useDemoState } from '@/lib/demo-context';
import { User, Truck, Shield, Clock, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  operator: '#06B6D4',
  supervisor: '#F97316',
  admin: '#22C55E',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  operator: 'Operates HEMM vehicles on haul roads. Receives safety alerts and advisories in real time.',
  supervisor: 'Monitors fleet status, manages segment restrictions, reviews incidents and alert acknowledgements.',
  admin: 'Full system access. Can view all data, manage demo state, and access system health diagnostics.',
};

export default function ProfilePage() {
  const { state, logout } = useDemoState();
  const router = useRouter();
  const [sessionStart] = useState(() => Date.now());

  const user = state.currentUser;
  if (!user) return null;

  const color = ROLE_COLORS[user.role] || '#9CA3AF';
  const vehicle = user.vehicleId ? state.vehicles.find(v => v.id === user.vehicleId) : null;
  const ownIncidents = state.incidents.filter(i => i.submittedBy === user.id).length;
  const ownAcks = state.alerts.filter(a => a.acknowledgedBy === user.id).length;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-5 pb-6">
      {/* Header */}
      <h1 className="text-xl font-bold text-white">Profile</h1>

      {/* User card */}
      <Card className="bg-[#111827] border-[#374151] overflow-hidden">
        <div className="h-2" style={{ background: color }} />
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: `${color}20`, color }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span
                className="inline-block text-xs px-2.5 py-0.5 rounded-full font-medium capitalize mt-1"
                style={{ background: `${color}20`, color }}
              >
                {user.role}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm text-[#9CA3AF]">
            <div className="flex items-center gap-2">
              <User size={14} className="flex-shrink-0" />
              <span>ID: <span className="font-mono text-[#E5E7EB]">{user.id}</span></span>
            </div>
            {vehicle && (
              <div className="flex items-center gap-2">
                <Truck size={14} className="flex-shrink-0" />
                <span>Vehicle: <span className="font-mono text-[#06B6D4]">{vehicle.label}</span></span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Shield size={14} className="flex-shrink-0" />
              <span className="text-xs leading-relaxed">{ROLE_DESCRIPTIONS[user.role]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session info */}
      <Card className="bg-[#111827] border-[#374151]">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-medium text-[#9CA3AF] uppercase tracking-wider">Session</h3>
          <div className="flex items-center gap-2 text-sm text-white">
            <Clock size={14} className="text-[#9CA3AF]" />
            <span>Started: {new Date(sessionStart).toLocaleTimeString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1F2937] rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-white">{ownAcks}</div>
              <div className="text-[10px] text-[#9CA3AF]">Alerts Acknowledged</div>
            </div>
            <div className="bg-[#1F2937] rounded-xl p-3 text-center">
              <div className="text-xl font-bold font-mono text-white">{ownIncidents}</div>
              <div className="text-[10px] text-[#9CA3AF]">Incidents Submitted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo auth notice */}
      <div className="bg-[#1F2937] border border-[#374151] rounded-xl p-4">
        <p className="text-xs text-[#9CA3AF] italic">
          Demo authentication — not production security. User data is not persisted to any server.
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#374151] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] hover:border-[#9CA3AF]/30 transition-all font-medium text-sm"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}
