'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, Lock, User, ShieldCheck, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(data.user.role === 'petugas' ? '/scanner' : '/dashboard');
        router.refresh();
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setError('Terjadi kesalahan koneksi atau sistem');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (userType: 'admin' | 'petugas') => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('petugas');
      setPassword('petugas123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Logo & Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-400 p-0.5 shadow-2xl shadow-blue-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <QrCode className="w-9 h-9 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Absensi Karyawan <span className="text-amber-400">YTA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sistem Kehadiran & Pemindaian QR Code Terintegrasi
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" /> Masuk ke Akun
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan kredensial Admin atau Petugas Absensi Anda.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username Akun
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin atau petugas"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Uji Coba Kredensial Demo:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('admin')}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-amber-300 font-medium flex items-center justify-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Auto Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo('petugas')}
                className="py-2 px-3 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-emerald-300 font-medium flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" /> Auto Petugas
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          © {new Date().getFullYear()} PT YTA Corporate Indonesia. Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  );
}
