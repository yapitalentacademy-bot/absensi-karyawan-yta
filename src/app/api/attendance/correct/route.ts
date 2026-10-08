import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = getCurrentSession();

  if (!session || session.role !== 'admin') {
    return NextResponse.json(
      { success: false, message: 'Akses ditolak! Hanya Admin yang berhak melakukan koreksi absensi manual.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { attendanceId, employeeId, date, clockIn, clockOut, status, notes, reason } = body;

    if (!employeeId || !date || !reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, message: 'Alasan perubahan manual wajib diisi untuk audit keamanan!' },
        { status: 400 }
      );
    }

    const employee = db.getEmployeeById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Karyawan tidak ditemukan' },
        { status: 404 }
      );
    }

    let previousData = {};
    let updatedRecord;

    if (attendanceId) {
      const existing = db.getAttendanceRecords().find(r => r.id === attendanceId);
      if (existing) {
        previousData = { ...existing };
      }
      updatedRecord = db.updateAttendanceRecord(attendanceId, {
        clockIn: clockIn || undefined,
        clockOut: clockOut || undefined,
        status: status || undefined,
        notes: notes || undefined,
      });
    } else {
      updatedRecord = db.saveAttendanceRecord({
        employeeId,
        date,
        clockIn: clockIn || new Date().toISOString(),
        clockOut: clockOut || null,
        status: status || 'Hadir',
        notes: notes || 'Koreksi Manual Admin',
      });
    }

    // Save Audit Log
    db.createAuditLog({
      attendanceId: updatedRecord?.id || 'N/A',
      employeeName: employee.name,
      editedByUserId: session.userId,
      editedByName: session.name,
      action: attendanceId ? 'UPDATE' : 'CREATE',
      previousData,
      newData: updatedRecord || {},
      reason: reason.trim(),
    });

    return NextResponse.json({
      success: true,
      message: 'Koreksi absensi berhasil disimpan dan dicatat dalam audit log.',
      record: updatedRecord,
    });
  } catch (error) {
    console.error('Correction error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menyimpan koreksi absensi' },
      { status: 500 }
    );
  }
}
