'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { SessionData } from '@/lib/auth';
import { getJakartaDateString, formatJakartaTime } from '@/lib/date';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  UserX, 
  LogOut, 
  QrCode, 
  ArrowUpRight, 
  Sparkles,
  Search,
  Building
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalActiveEmployees: 0,
    hadirToday: 0,
    terlambatToday: 0,
    belumAbsenToday: 0,
    belumAbsenPulangToday: 0,
  });

  const [recentRecords, setRecentRecords] = useState<any[]>([]);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated) {
        router.push('/login');
        return;
      }
      setUser(data.user);
      await fetchDashboardData();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const today = getJakartaDateString();
      const res = await fetch(`/api/attendance?date=${today}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Memuat Dashboard Absensi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar role={user?.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Welcome Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Ringkasan Kehadiran Realtime
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Selamat Datang, {user?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pemantauan data kehadiran karyawan berbasis QR Code zona waktu <strong className="text-slate-300">Asia/Jakarta (WIB)</strong>.
              </p>
            </div>

            <button
              onClick={() => router.push('/scanner')}
              className="py-3 px-5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-400/20 flex items-center gap-2 transition hover:scale-[1.02]"
            >
              <QrCode className="w-5 h-5" />
              <span>Buka Pemindai QR</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Karyawan Aktif"
              value={stats.totalActiveEmployees}
              subtitle="Total Terdaftar"
              icon={Users}
              colorScheme="blue"
            />
            <StatCard
              title="Hadir Hari Ini"
              value={stats.hadirToday}
              subtitle="Absen Tepat Waktu / Pulang"
              icon={CheckCircle2}
              colorScheme="emerald"
            />
            <StatCard
              title="Terlambat Hari Ini"
              value={stats.terlambatToday}
              subtitle="Melebihi Jam Masuk"
              icon={Clock}
              colorScheme="amber"
            />
            <StatCard
              title="Belum Absen"
              value={stats.belumAbsenToday}
              subtitle="Belum Absen Masuk"
              icon={UserX}
              colorScheme="rose"
            />
            <StatCard
              title="Belum Absen Pulang"
              value={stats.belumAbsenPulangToday}
              subtitle="Belum Tap Out"
              icon={LogOut}
              colorScheme="purple"
            />
          </div>

          {/* Recent Activity Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" /> Aktivitas Kehadiran Hari Ini
                </h3>
                <p className="text-xs text-slate-400">Daftar transaksi absensi terkini yang berhasil diproses.</p>
              </div>

              <button
                onClick={() => router.push('/reports')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
              >
                Lihat Selengkapnya <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">Kode ID</th>
                    <th className="py-3 px-4">Unit / Divisi</th>
                    <th className="py-3 px-4">Jam Masuk</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        Belum ada aktivitas pencatatan absensi hari ini.
                      </td>
                    </tr>
                  ) : (
                    recentRecords.slice(0, 7).map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {rec.avatarUrl ? (
                              <img src={rec.avatarUrl} alt={rec.employeeName} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{rec.employeeName}</p>
                            <p className="text-[11px] text-slate-400">{rec.position}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-amber-300 font-bold">{rec.employeeCode}</td>
                        <td className="py-3 px-4 text-slate-300 text-xs flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500" /> {rec.department}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-emerald-400">
                          {rec.clockIn ? formatJakartaTime(rec.clockIn) : '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-amber-400">
                          {rec.clockOut ? formatJakartaTime(rec.clockOut) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            rec.status === 'Hadir'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : rec.status === 'Terlambat'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : rec.status === 'Pulang'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
