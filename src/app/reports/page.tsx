'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CorrectionModal } from '@/components/CorrectionModal';
import { AuditLogModal } from '@/components/AuditLogModal';
import { SessionData } from '@/lib/auth';
import { getJakartaDateString, formatJakartaTime, formatJakartaFullDateTime } from '@/lib/date';
import { AttendanceRecord, Employee } from '@/lib/types';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  Building, 
  Edit3, 
  ShieldAlert, 
  Plus, 
  FileSpreadsheet,
  Users
} from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState<string>(getJakartaDateString());
  const [search, setSearch] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Data
  const [records, setRecords] = useState<any[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Modals
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);

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
      await Promise.all([fetchReports(), fetchEmployeesList()]);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const query = new URLSearchParams();
      if (selectedDate) query.append('date', selectedDate);
      if (search) query.append('search', search);
      if (departmentFilter) query.append('department', departmentFilter);
      if (statusFilter) query.append('status', statusFilter);

      const res = await fetch(`/api/attendance?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error fetching attendance reports:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [selectedDate, search, departmentFilter, statusFilter]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleOpenAddManual = () => {
    setEditingRecord(null);
    setShowCorrectionModal(true);
  };

  const handleOpenEditRecord = (rec: any) => {
    setEditingRecord(rec);
    setShowCorrectionModal(true);
  };

  // Export to Excel (.xlsx)
  const exportToExcel = () => {
    const exportData = records.map((r, idx) => ({
      No: idx + 1,
      Tanggal: r.date,
      'ID Karyawan': r.employeeCode,
      Nama: r.employeeName,
      'Unit/Bagian': r.department,
      Jabatan: r.position,
      'Jam Masuk': r.clockIn ? formatJakartaTime(r.clockIn) : '-',
      'Jam Pulang': r.clockOut ? formatJakartaTime(r.clockOut) : '-',
      Status: r.status,
      Keterangan: r.notes || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Absensi');
    XLSX.writeFile(workbook, `Laporan_Absensi_YTA_${selectedDate}.xlsx`);
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = records.map((r, idx) => ({
      No: idx + 1,
      Tanggal: r.date,
      ID_Karyawan: r.employeeCode,
      Nama: r.employeeName,
      Unit_Bagian: r.department,
      Jabatan: r.position,
      Jam_Masuk: r.clockIn ? formatJakartaTime(r.clockIn) : '-',
      Jam_Pulang: r.clockOut ? formatJakartaTime(r.clockOut) : '-',
      Status: r.status,
      Keterangan: r.notes || '-',
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Absensi_YTA_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments = Array.from(new Set(employees.map(e => e.department)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Memuat Laporan Absensi...
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <FileText className="w-7 h-7 text-amber-400" /> Laporan & Rekap Kehadiran
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Filter data, ekspor rekap ke Excel/CSV, dan lakukan koreksi absensi manual.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAuditModal(true)}
                className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" /> Log Audit Keamanan
              </button>

              <button
                onClick={handleOpenAddManual}
                className="py-2.5 px-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Absen Manual
              </button>

              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <button
                  onClick={exportToExcel}
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition"
                  title="Unduh Laporan Format Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                </button>

                <button
                  onClick={exportToCSV}
                  className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition"
                  title="Unduh Laporan Format CSV"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Search className="w-3 h-3 text-amber-400" /> Cari Nama / ID
              </label>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Ketik nama / ID karyawan..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Building className="w-3 h-3 text-amber-400" /> Filter Unit / Divisi
              </label>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Unit</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-amber-400" /> Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Status</option>
                <option value="Hadir">Hadir (Tepat Waktu)</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Pulang">Pulang (Lengkap)</option>
                <option value="Belum Absen">Belum Absen</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="glass-panel rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">ID Karyawan</th>
                    <th className="py-3 px-4">Nama Lengkap</th>
                    <th className="py-3 px-4">Unit / Divisi</th>
                    <th className="py-3 px-4">Jam Masuk</th>
                    <th className="py-3 px-4">Jam Pulang</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Keterangan</th>
                    <th className="py-3 px-4 text-center">Koreksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada data pencatatan absensi yang ditemukan untuk kriteria ini.
                      </td>
                    </tr>
                  ) : (
                    records.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-mono text-xs text-slate-300">
                          {rec.date}
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-amber-300 font-bold">
                          {rec.employeeCode}
                        </td>

                        <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {rec.avatarUrl ? (
                              <img src={rec.avatarUrl} alt={rec.employeeName} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                          <span>{rec.employeeName}</span>
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {rec.department}
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-emerald-400 font-bold">
                          {rec.clockIn ? formatJakartaTime(rec.clockIn) : '-'}
                        </td>

                        <td className="py-3 px-4 font-mono text-xs text-amber-400 font-bold">
                          {rec.clockOut ? formatJakartaTime(rec.clockOut) : '-'}
                        </td>

                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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

                        <td className="py-3 px-4 text-slate-400 text-xs italic">
                          {rec.notes || '-'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenEditRecord(rec)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl transition"
                            title="Koreksi Manual Absensi Ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Manual Correction Modal */}
      {showCorrectionModal && (
        <CorrectionModal
          record={editingRecord}
          employees={employees}
          selectedDate={selectedDate}
          onClose={() => setShowCorrectionModal(false)}
          onSave={() => fetchReports()}
        />
      )}

      {/* Audit Logs Modal */}
      {showAuditModal && (
        <AuditLogModal onClose={() => setShowAuditModal(false)} />
      )}
    </div>
  );
}
