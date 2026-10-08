import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  const session = getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak! Hanya Admin yang dapat melihat riwayat audit.' },
      { status: 403 }
    );
  }

  const logs = db.getAuditLogs();
  return NextResponse.json({ success: true, logs });
}
