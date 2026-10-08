'use client';

import React, { useState, useEffect } from 'react';
import { User, LogOut, Clock, ShieldCheck, QrCode, Building } from 'lucide-react';
import { SessionData } from '@/lib/auth';
import { formatJakartaFullDateTime } from '@/lib/date';

interface NavbarProps {
  user: SessionData | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(formatJakartaFullDateTime(new Date().toISOString()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-xl">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg lg:text-xl text-white tracking-tight flex items-center gap-2">
            Absensi Karyawan <span className="text-amber-400 font-black">YTA</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
            <Building className="w-3 h-3 text-slate-400" /> Sistem Kehadiran Berbasis QR Code
          </p>
        </div>
      </div>

      {/* Center Live Clock */}
      <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700/60 text-xs font-medium text-slate-300">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span>{timeStr || 'Memuat waktu...'}</span>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-3 bg-slate-800/70 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{user.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wide uppercase ${
                    user.role === 'admin' 
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                      : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                  }`}>
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" />
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-all duration-200"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="text-xs text-slate-400">Belum Login</div>
        )}
      </div>
    </header>
  );
};
