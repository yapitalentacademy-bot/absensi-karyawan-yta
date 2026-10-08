'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { SessionData } from '@/lib/auth';
import { sounds } from '@/lib/audio';
import confetti from 'canvas-confetti';
import { 
  QrCode, 
  Camera, 
  SwitchCamera, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  LogIn, 
  LogOut, 
  User, 
  Building,
  Volume2,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Employee, ScanResultResponse } from '@/lib/types';

export default function ScannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Scan Settings
  const [scanMode, setScanMode] = useState<'IN' | 'OUT'>('IN');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');

  // Scan Result State
  const [processing, setProcessing] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanResultResponse | null>(null);

  // Manual Backup Search Input
  const [manualQuery, setManualQuery] = useState<string>('');
  const [manualEmployees, setManualEmployees] = useState<Employee[]>([]);
  const [searchingManual, setSearchingManual] = useState<boolean>(false);

  const scannerRef = useRef<any>(null);

  useEffect(() => {
    checkSession();
    return () => {
      stopCamera();
    };
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
      initCameraList();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const initCameraList = async () => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        setCameras(devices);
        setSelectedCameraId(devices[0].id);
      } else {
        setCameraError('Kamera tidak terdeteksi pada perangkat ini. Silakan gunakan fitur pencarian manual.');
      }
    } catch (err) {
      console.error('Camera init error:', err);
      setCameraError('Izin akses kamera ditolak atau tidak didukung. Gunakan pencarian manual di bawah.');
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setScanResult(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      if (scannerRef.current) {
        await stopCamera();
      }

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      const cameraIdOrConfig = selectedCameraId || { facingMode: 'environment' };

      await html5QrCode.start(
        cameraIdOrConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onQrCodeScanned,
        () => {} // silent scan failures
      );

      setCameraActive(true);
    } catch (err: any) {
      console.error('Error starting camera:', err);
      setCameraError('Gagal membuka kamera. Pastikan memberikan izin akses kamera di browser.');
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera:', err);
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  const onQrCodeScanned = async (decodedText: string) => {
    if (processing) return;
    setProcessing(true);

    // Pause scanner briefly to avoid double reading
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        scannerRef.current.pause(true);
      } catch {}
    }

    await processAttendance(decodedText);

    // Resume scanner after 3 seconds
    setTimeout(() => {
      setProcessing(false);
      if (scannerRef.current) {
        try {
          scannerRef.current.resume();
        } catch {}
      }
    }, 3000);
  };

  const processAttendance = async (code: string) => {
    try {
      const res = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code, mode: scanMode }),
      });

      const data: ScanResultResponse = await res.json();
      setScanResult(data);

      if (data.success) {
        sounds.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } else if (data.statusType === 'ALREADY_EXISTS') {
        sounds.playWarning();
      } else {
        sounds.playError();
      }
    } catch (err) {
      console.error('Error processing attendance:', err);
      sounds.playError();
      setScanResult({
        success: false,
        statusType: 'ERROR',
        message: 'Terjadi kesalahan sistem saat menghubungi server',
      });
    }
  };

  // Manual Employee Backup Search
  const handleManualSearch = async (queryStr: string) => {
    setManualQuery(queryStr);
    if (!queryStr.trim()) {
      setManualEmployees([]);
      return;
    }
    setSearchingManual(true);
    try {
      const res = await fetch(`/api/employees?search=${encodeURIComponent(queryStr)}`);
      const data = await res.json();
      if (data.success) {
        setManualEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Manual search error:', err);
    } finally {
      setSearchingManual(false);
    }
  };

  const handleManualSubmit = (emp: Employee) => {
    processAttendance(emp.qrToken);
    setManualQuery('');
    setManualEmployees([]);
  };

  const handleLogout = async () => {
    await stopCamera();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Memuat Pemindai QR...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar role={user?.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Top Title Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <QrCode className="w-7 h-7 text-amber-400" /> Pemindai Absensi QR Code
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Dekatkan Kartu QR Karyawan ke kamera perangkat untuk mencatat absensi.
              </p>
            </div>

            {/* Mode Toggle Buttons: ABSEN MASUK vs ABSEN PULANG */}
            <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-lg">
              <button
                onClick={() => {
                  setScanMode('IN');
                  setScanResult(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all duration-200 ${
                  scanMode === 'IN'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-4 h-4" /> ABSEN MASUK
              </button>
              <button
                onClick={() => {
                  setScanMode('OUT');
                  setScanResult(null);
                }}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all duration-200 ${
                  scanMode === 'OUT'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-105'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogOut className="w-4 h-4" /> ABSEN PULANG
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Camera Viewport Area */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl text-center relative overflow-hidden">
                {/* Camera Control Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Area Kamera Pemindai
                    </span>
                  </div>

                  {cameras.length > 1 && (
                    <select
                      value={selectedCameraId}
                      onChange={e => setSelectedCameraId(e.target.value)}
                      className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-amber-400"
                    >
                      {cameras.map(cam => (
                        <option key={cam.id} value={cam.id}>
                          {cam.label || `Kamera ${cam.id.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Viewport Box */}
                <div className="relative bg-slate-950 rounded-2xl border-2 border-slate-800 min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
                  <div id="qr-reader" className="w-full max-w-sm"></div>

                  {!cameraActive && (
                    <div className="p-8 text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-inner">
                        <QrCode className="w-8 h-8 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">Kamera Belum Aktif</h4>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                          Klik tombol di bawah untuk mengaktifkan kamera depan/belakang perangkat Anda.
                        </p>
                      </div>
                      <button
                        onClick={startCamera}
                        className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 transition"
                      >
                        <Camera className="w-4 h-4" /> Aktifkan Kamera Pemindai
                      </button>
                    </div>
                  )}

                  {cameraActive && (
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px]">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                        Kamera Aktif • Siap Memindai
                      </span>
                      <button
                        onClick={stopCamera}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Matikan Kamera
                      </button>
                    </div>
                  )}
                </div>

                {cameraError && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs text-left">
                    {cameraError}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Scan Results & Manual Backup Search */}
            <div className="lg:col-span-5 space-y-4">
              {/* Scan Result Feedback Card */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl min-h-[260px] flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Hasil Pemindaian Absensi
                  </h3>

                  {!scanResult ? (
                    <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                      <QrCode className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                      <p>Menunggu hasil pemindaian QR Code...</p>
                      <p className="text-[10px] text-slate-600">Pilih mode Absen Masuk atau Absen Pulang terlebih dahulu.</p>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-2xl border space-y-3 transition-all ${
                      scanResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                        : scanResult.statusType === 'ALREADY_EXISTS'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        {scanResult.success ? (
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                        ) : scanResult.statusType === 'ALREADY_EXISTS' ? (
                          <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                        ) : (
                          <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-extrabold text-sm leading-tight">{scanResult.message}</h4>
                          {scanResult.timestamp && (
                            <p className="text-[11px] font-mono mt-0.5 opacity-80">
                              Waktu: {scanResult.timestamp} WIB
                            </p>
                          )}
                        </div>
                      </div>

                      {scanResult.employee && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {scanResult.employee.avatarUrl ? (
                              <img src={scanResult.employee.avatarUrl} alt={scanResult.employee.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="text-xs">
                            <p className="font-bold text-white text-sm">{scanResult.employee.name}</p>
                            <p className="text-amber-300 font-mono font-semibold">{scanResult.employee.employeeCode} • {scanResult.employee.position}</p>
                            <p className="text-slate-400 text-[11px] flex items-center gap-1">
                              <Building className="w-3 h-3" /> {scanResult.employee.department}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                    <Volume2 className="w-3 h-3 text-amber-400" /> Indikator suara otomatis aktif
                  </span>
                </div>
              </div>

              {/* Manual Backup Input Form */}
              <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-amber-400" /> Pencarian Backup Manual
                  </h3>
                  <p className="text-[11px] text-slate-400">Gunakan jika kamera mengalami kendala atau tidak tersedia.</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={e => handleManualSearch(e.target.value)}
                    placeholder="Ketik Nama Karyawan atau Kode ID (cth: YTA-101)..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {manualEmployees.length > 0 && (
                  <div className="bg-slate-900 border border-slate-700 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-800">
                    {manualEmployees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => handleManualSubmit(emp)}
                        className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <p className="font-bold text-white">{emp.name}</p>
                          <p className="text-[10px] text-amber-300 font-mono">{emp.employeeCode} • {emp.department}</p>
                        </div>
                        <span className="py-1 px-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[10px]">
                          PILIH ABSEN
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
