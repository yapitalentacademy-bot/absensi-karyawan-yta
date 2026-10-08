'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { SessionData } from '@/lib/auth';
import { 
  Settings, 
  Clock, 
  Building, 
  Globe, 
  Save, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const [workStartTime, setWorkStartTime] = useState('08:00');
  const [lateThresholdMinutes, setLateThresholdMinutes] = useState(15);
  const [companyName, setCompanyName] = useState('PT YTA Corporate Indonesia');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (!data.authenticated || data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(data.user);
      await fetchSettings();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setWorkStartTime(data.settings.workStartTime || '08:00');
        setLateThresholdMinutes(data.settings.lateThresholdMinutes || 15);
        setCompanyName(data.settings.companyName || 'PT YTA Corporate Indonesia');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workStartTime,
          lateThresholdMinutes: Number(lateThresholdMinutes),
          companyName,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Pengaturan jam kerja dan keterlambatan berhasil diperbarui!');
      } else {
        setMessage(data.message || 'Gagal menyimpan pengaturan');
      }
    } catch (err) {
      console.error('Save settings error:', err);
      setMessage('Terjadi kesalahan jaringan/sistem');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Memuat Pengaturan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar role={user?.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Settings className="w-7 h-7 text-amber-400" /> Pengaturan Jam Kerja & Sistem
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Konfigurasi jam masuk standar, batas menit keterlambatan, dan profil perusahaan.
            </p>
          </div>

          <div className="max-w-2xl">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-6 shadow-xl">
              {message && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-amber-400" /> Nama Perusahaan / Instansi
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {/* Work Start Time & Late Threshold */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" /> Jam Masuk Kerja Standar (WIB)
                    </label>
                    <input
                      type="time"
                      value={workStartTime}
                      onChange={e => setWorkStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Karyawan absen setelah jam ini ditambah batas toleransi dianggap Terlambat.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> Toleransi Keterlambatan (Menit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={lateThresholdMinutes}
                      onChange={e => setLateThresholdMinutes(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Contoh: 15 menit berarti jam 08:15 WIB masih dianggap tepat waktu.</p>
                  </div>
                </div>

                {/* Timezone Status Info */}
                <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Globe className="w-4 h-4 text-blue-400" /> Waktu & Zona Waktu Server
                  </div>
                  <p className="text-xs text-slate-400">
                    Sistem secara otomatis mengunci perhitungan waktu dan tanggal pada zona waktu <strong className="text-amber-300">Asia/Jakarta (WIB - UTC+7)</strong>.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
