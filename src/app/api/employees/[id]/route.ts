import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak! Hanya Admin yang dapat mengubah data karyawan.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = db.updateEmployee(params.id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Karyawan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data karyawan berhasil diperbarui',
      employee: updated,
    });
  } catch (err) {
    console.error('Error updating employee:', err);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memperbarui karyawan' },
      { status: 500 }
    );
  }
}
