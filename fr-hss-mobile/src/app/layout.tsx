import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DemoStateProvider } from '@/lib/demo-context';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FR-HSS Mobile — Fog-Resilient HEMM Safety Stack',
  description: 'Simulated mine-vehicle safety intelligence demonstration',
};

// Next.js 14 layout props
type LayoutProps<T = any> = { children: React.ReactNode };

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0A0E14] text-[#E5E7EB] font-sans">
        <DemoStateProvider>
          {children}
          <Toaster />
        </DemoStateProvider>
      </body>
    </html>
  );
}
