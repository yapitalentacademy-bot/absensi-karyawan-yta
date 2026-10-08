'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  FileText, 
  Settings, 
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface SidebarProps {
  role?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'admin' }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'petugas'],
    },
    {
      label: 'Pemindai QR',
      href: '/scanner',
      icon: QrCode,
      roles: ['admin', 'petugas'],
      highlight: true,
    },
    {
      label: 'Data Karyawan',
      href: '/employees',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Laporan & Audit',
      href: '/reports',
      icon: FileText,
      roles: ['admin'],
    },
    {
      label: 'Pengaturan Jam',
      href: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-full lg:w-64 glass-panel bg-slate-900/70 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Navigasi Utama</p>
        </div>

        <nav className="space-y-1.5">
          {filteredItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : item.highlight
                      ? 'bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 border border-amber-400/20'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? (item.highlight ? 'text-slate-950' : 'text-white') : (item.highlight ? 'text-amber-400' : 'text-slate-400 group-hover:text-blue-400')
                  }`} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-4 border-t border-slate-800 px-3">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-xs text-slate-400">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Waktu Sistem WIB
          </p>
          <p className="text-[11px] text-slate-400">Zona Waktu: Asia/Jakarta (UTC+7)</p>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">v1.0.0 • Persistent DB</p>
        </div>
      </div>
    </aside>
  );
};
