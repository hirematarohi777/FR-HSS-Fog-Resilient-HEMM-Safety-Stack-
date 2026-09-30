'use client'

import { useDemoState } from '@/lib/demo-context';
import { useRouter } from 'next/navigation';
import { DEMO_USERS } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Eye, Shield } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  operator: '#06B6D4',
  supervisor: '#F97316',
  admin: '#22C55E',
};

const ROLE_ICONS: Record<string, string> = {
  operator: 'R',
  supervisor: 'P',
  admin: 'A',
};

export default function LoginPage() {
  const { login } = useDemoState();
  const router = useRouter();

  const handleLogin = (userId: string) => {
    login(userId);
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0A0E14]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#06B6D4]/10 mb-4">
            <Shield className="w-8 h-8 text-[#06B6D4]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">FR-HSS</h1>
          <p className="text-sm text-gray-400">Fog-Resilient HEMM Safety Stack</p>
          <p className="mt-6 text-sm font-medium text-gray-300">Select your role to begin the demonstration</p>
        </div>

        <div className="space-y-3">
          {DEMO_USERS.map((user) => {
            const color = ROLE_COLORS[user.role];
            return (
              <Card
                key={user.id}
                className="cursor-pointer bg-[#111827] border-gray-800 hover:border-opacity-100 transition-all duration-200 active:scale-[0.98]"
                style={{ borderColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                onClick={() => handleLogin(user.id)}
              >
                <CardContent className="flex items-center p-4">
                  <div
                    className="h-12 w-12 rounded-full flex items-center justify-center text-xl font-bold mr-4 flex-shrink-0"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{user.name}</h3>
                    <div className="flex items-center mt-1 gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {user.role}
                      </span>
                      {user.vehicleId && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Truck size={12} />
                          {user.vehicleId.toUpperCase().replace('-', '-')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">Tap to log in →</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          Demo authentication — not production security
        </p>
      </div>
    </main>
  );
}
