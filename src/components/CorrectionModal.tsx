'use client';

import React, { useState } from 'react';
import { X, Save, AlertTriangle, Clock, Calendar, FileText } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee } from '@/lib/types';

interface CorrectionModalProps {
  record?: AttendanceRecord | null;
  employees: Employee[];
  selectedDate: string;
  onClose: () => void;
  onSave: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  record,
  employees,
  selectedDate,
  onClose,
  onSave,
}) => {
  const [employeeId, setEmployeeId] = useState<string>(record?.employeeId || employees[0]?.id || '');
  const [date, setDate] = useState<string>(record?.date || selectedDate);
  const [clockInTime, setClockInTime] = useState<string>(
    record?.clockIn ? new Date(record.clockIn).toISOString().slice(11, 16) : '08:00'
  );
  const [clockOutTime, setClockOutTime] = useState<string>(
    record?.clockOut ? new Date(record.clockOut).toISOString().slice(11, 16) : '17:00'
  );
  const [hasClockOut, setHasClockOut] = useState<boolean>(!!record?.clockOut);
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'Hadir');
  const [notes, setNotes] = useState<string>(record?.notes || 'Koreksi Manual Admin');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg('Alasan perubahan wajib diisi untuk catatan audit keamanan!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // Build ISO strings
      const clockInISO = new Date(`${date}T${clockInTime}:00`).toISOString();
      const clockOutISO = hasClockOut ? new Date(`${date}T${clockOutTime}:00`).toISOString() : null;

      const res = await fetch('/api/attendance/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendanceId: record?.id,
          employeeId,
          date,
          clockIn: clockInISO,
          clockOut: clockOutISO,
          status,
          notes,
          reason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSave();
        onClose();
      } else {
        setErrorMsg(data.message || 'Gagal menyimpan koreksi absensi');
      }
    } catch (err) {
      console.error('Correction submit error:', err);
      setErrorMsg('Terjadi kesalahan jaringan/sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              {record ? 'Koreksi Catatan Absensi' : 'Tambah Absensi Manual'}
            </h3>
            <p className="text-xs text-slate-400">
              Perubahan ini akan dicatat dalam Log Audit Keamanan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pilih Karyawan</label>
            <select
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              disabled={!!record}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeCode}) - {emp.department}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Absensi
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kehadiran</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as AttendanceStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Hadir">Hadir (Tepat Waktu)</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Pulang">Pulang (Lengkap)</option>
                <option value="Belum Lengkap">Belum Lengkap</option>
              </select>
            </div>
          </div>

          {/* Clock In & Clock Out */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/50">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-300 mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Jam Masuk (WIB)
              </label>
              <input
                type="time"
                value={clockInTime}
                onChange={e => setClockInTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-400"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Jam Pulang (WIB)
                </label>
                <label className="inline-flex items-center text-[10px] text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasClockOut}
                    onChange={e => setHasClockOut(e.target.checked)}
                    className="mr-1 rounded"
                  />
                  Sudah Pulang
                </label>
              </div>
              <input
                type="time"
                value={clockOutTime}
                onChange={e => setClockOutTime(e.target.value)}
                disabled={!hasClockOut}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
              />
            </div>
          </div>

          {/* Mandatory Reason for Correction */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl space-y-2">
            <label className="flex items-center gap-1 text-xs font-bold text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Alasan Koreksi Manual (Wajib Isi)
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Contoh: Kamera rusak saat scan, atau koreksi surat izin dokter yang terlampir..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              required
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
            >
              <Save className="w-4 h-4" /> {loading ? 'Menyimpan...' : 'Simpan Koreksi'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
