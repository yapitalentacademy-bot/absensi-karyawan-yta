import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  const settings = db.getSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  const session = getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak! Hanya Admin yang dapat mengubah pengaturan.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Pengaturan sistem berhasil diperbarui',
      settings: updated,
    });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui pengaturan' },
      { status: 500 }
    );
  }
}
