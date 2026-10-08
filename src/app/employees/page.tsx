'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { QRModal } from '@/components/QRModal';
import { Employee, UserRole } from '@/lib/types';
import { SessionData } from '@/lib/auth';
import { 
  Users, 
  UserPlus, 
  Search, 
  QrCode, 
  Edit, 
  Building, 
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Plus
} from 'lucide-react';

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [selectedQRRecord, setSelectedQRRecord] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeCode: '',
    position: '',
    department: 'IT & Technology',
    status: 'aktif' as 'aktif' | 'nonaktif',
    avatarUrl: '',
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
      await fetchEmployees();
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (departmentFilter) query.append('department', departmentFilter);
      if (statusFilter) query.append('status', statusFilter);

      const res = await fetch(`/api/employees?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [search, departmentFilter, statusFilter]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      employeeCode: `YTA-${Math.floor(100 + Math.random() * 900)}`,
      position: '',
      department: 'IT & Technology',
      status: 'aktif',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      employeeCode: emp.employeeCode,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      avatarUrl: emp.avatarUrl || '',
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : '/api/employees';
      const method = editingEmployee ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        await fetchEmployees();
      } else {
        setFormError(data.message || 'Gagal menyimpan data karyawan');
      }
    } catch (err) {
      console.error('Save employee error:', err);
      setFormError('Terjadi kesalahan sistem saat menyimpan');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === 'aktif' ? 'nonaktif' : 'aktif';
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const departments = Array.from(new Set(employees.map(e => e.department)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm animate-pulse">
        Memuat Data Karyawan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col lg:flex-row">
        <Sidebar role={user?.role} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Users className="w-7 h-7 text-amber-400" /> Kelola Data Karyawan
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Tambah, edit, cetak kartu QR Code, dan atur status aktif karyawan.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center gap-2 transition"
            >
              <UserPlus className="w-4 h-4" /> Tambah Karyawan Baru
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama, ID, atau jabatan..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Unit / Divisi</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Semua Status (Aktif & Nonaktif)</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-aktif</option>
              </select>
            </div>
          </div>

          {/* Employee Grid / Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Karyawan</th>
                    <th className="py-3 px-4">ID Karyawan</th>
                    <th className="py-3 px-4">Jabatan</th>
                    <th className="py-3 px-4">Unit / Divisi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">QR Code & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        Tidak ada data karyawan yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {emp.avatarUrl ? (
                              <img src={emp.avatarUrl} alt={emp.name} className="w-full h-full object-cover" />
                            ) : (
                              <Users className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-tight">{emp.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">Token: {emp.qrToken}</p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-xs text-amber-300 font-bold">
                          {emp.employeeCode}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">
                          {emp.position}
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 text-xs flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500" /> {emp.department}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(emp)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                              emp.status === 'aktif'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                            }`}
                            title="Klik untuk mengubah status aktif/non-aktif"
                          >
                            {emp.status === 'aktif' ? (
                              <><CheckCircle2 className="w-3 h-3" /> Aktif</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> Non-aktif</>
                            )}
                          </button>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedQRRecord(emp)}
                              className="py-1.5 px-3 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                              title="Lihat & Cetak Kartu QR Code"
                            >
                              <QrCode className="w-3.5 h-3.5 text-amber-400" /> Kartu QR
                            </button>
                            <button
                              onClick={() => handleOpenEdit(emp)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition"
                              title="Edit Data Karyawan"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* QR Code Printable Modal */}
      {selectedQRRecord && (
        <QRModal employee={selectedQRRecord} onClose={() => setSelectedQRRecord(null)} />
      )}

      {/* Add / Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                {editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Ahmad Subagyo"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ID / Kode Karyawan</label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={e => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="YTA-109"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status Karyawan</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'aktif' | 'nonaktif' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Jabatan / Posisi</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={e => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Software Engineer / HR Admin..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit / Bagian / Divisi</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  placeholder="IT & Technology / Operations..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition"
                >
                  <Plus className="w-4 h-4" /> {formLoading ? 'Memproses...' : 'Simpan Data'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
