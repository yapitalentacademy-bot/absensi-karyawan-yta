import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';

  let employees = db.getEmployees();

  if (search) {
    employees = employees.filter(
      e =>
        e.name.toLowerCase().includes(search) ||
        e.employeeCode.toLowerCase().includes(search) ||
        e.position.toLowerCase().includes(search)
    );
  }

  if (department) {
    employees = employees.filter(e => e.department === department);
  }

  if (status) {
    employees = employees.filter(e => e.status === status);
  }

  return NextResponse.json({ success: true, employees });
}

export async function POST(req: NextRequest) {
  const session = getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak! Hanya Admin yang dapat menambah karyawan.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { name, employeeCode, position, department, status, avatarUrl } = body;

    if (!name || !employeeCode || !position || !department) {
      return NextResponse.json(
        { success: false, message: 'Harap lengkapi semua bidang yang wajib diisi!' },
        { status: 400 }
      );
    }

    // Check code duplication
    const existing = db.getEmployees().find(e => e.employeeCode.toLowerCase() === employeeCode.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kode Karyawan "${employeeCode}" sudah digunakan!` },
        { status: 400 }
      );
    }

    // Generate unique secure QR token (contains no sensitive personal info)
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    const qrToken = `QR-YTA-${employeeCode.replace(/\s+/g, '')}-${randomHash}`;

    const newEmployee = db.createEmployee({
      name,
      employeeCode,
      position,
      department,
      status: status || 'aktif',
      qrToken,
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    });

    return NextResponse.json({
      success: true,
      message: 'Data karyawan berhasil ditambahkan',
      employee: newEmployee,
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem' },
      { status: 500 }
    );
  }
}
