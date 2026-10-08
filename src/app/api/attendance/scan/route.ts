import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getJakartaDateString, formatJakartaTime, calculateIsLate } from '@/lib/date';
import { ScanResultResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { qrCode, mode = 'IN', notes } = body; // qrCode can be token, code, or id

    if (!qrCode) {
      return NextResponse.json<ScanResultResponse>(
        {
          success: false,
          statusType: 'INVALID_QR',
          message: 'Kode QR tidak boleh kosong!',
        },
        { status: 400 }
      );
    }

    // 1. Validate employee from server database (Security Rule: Do NOT trust client identity)
    const employee = db.getEmployeeByQRToken(qrCode.trim());

    if (!employee) {
      return NextResponse.json<ScanResultResponse>(
        {
          success: false,
          statusType: 'INVALID_QR',
          message: 'QR Code tidak dikenal! Kartu identitas ini tidak terdaftar dalam sistem.',
        },
        { status: 404 }
      );
    }

    if (employee.status === 'nonaktif') {
      return NextResponse.json<ScanResultResponse>(
        {
          success: false,
          statusType: 'ERROR',
          message: `Absensi ditolak! Karyawan ${employee.name} (${employee.employeeCode}) berstatus NON-AKTIF.`,
          employee,
        },
        { status: 400 }
      );
    }

    const todayDateStr = getJakartaDateString();
    const nowISO = new Date().toISOString();
    const settings = db.getSettings();

    // Check existing attendance for today
    const existingRecord = db.getAttendanceForEmployeeOnDate(employee.id, todayDateStr);

    // MODE: ABSEN MASUK (IN)
    if (mode === 'IN') {
      if (existingRecord && existingRecord.clockIn) {
        const existingTime = formatJakartaTime(existingRecord.clockIn);
        return NextResponse.json<ScanResultResponse>(
          {
            success: false,
            statusType: 'ALREADY_EXISTS',
            message: `Karyawan ${employee.name} sudah melakukan Absen Masuk hari ini pada pukul ${existingTime}.`,
            employee,
            attendance: existingRecord,
            scanType: 'IN',
          },
          { status: 400 }
        );
      }

      // Calculate if late
      const isLate = calculateIsLate(new Date(), settings.workStartTime, settings.lateThresholdMinutes);
      const attendanceStatus = isLate ? 'Terlambat' : 'Hadir';

      const savedRecord = db.saveAttendanceRecord({
        employeeId: employee.id,
        date: todayDateStr,
        clockIn: nowISO,
        clockOut: null,
        status: attendanceStatus,
        notes: notes || (isLate ? `Absen Masuk (Terlambat)` : 'Absen Masuk (Tepat Waktu)'),
      });

      const clockInTimeStr = formatJakartaTime(savedRecord.clockIn);

      return NextResponse.json<ScanResultResponse>({
        success: true,
        statusType: 'SUCCESS',
        message: `Absen Masuk Berhasil! ${employee.name} (${attendanceStatus}) pada pukul ${clockInTimeStr}.`,
        employee,
        attendance: savedRecord,
        scanType: 'IN',
        timestamp: clockInTimeStr,
      });
    }

    // MODE: ABSEN PULANG (OUT)
    if (mode === 'OUT') {
      if (!existingRecord || !existingRecord.clockIn) {
        return NextResponse.json<ScanResultResponse>(
          {
            success: false,
            statusType: 'MISSING_CLOCK_IN',
            message: `Absensi Pulang ditolak! Karyawan ${employee.name} belum melakukan Absen Masuk hari ini. Harap Absen Masuk terlebih dahulu.`,
            employee,
            scanType: 'OUT',
          },
          { status: 400 }
        );
      }

      if (existingRecord.clockOut) {
        const existingOutTime = formatJakartaTime(existingRecord.clockOut);
        return NextResponse.json<ScanResultResponse>(
          {
            success: false,
            statusType: 'ALREADY_EXISTS',
            message: `Karyawan ${employee.name} sudah melakukan Absen Pulang hari ini pada pukul ${existingOutTime}.`,
            employee,
            attendance: existingRecord,
            scanType: 'OUT',
          },
          { status: 400 }
        );
      }

      // Update record with clock-out time and set status to Pulang
      const updatedRecord = db.saveAttendanceRecord({
        employeeId: employee.id,
        date: todayDateStr,
        clockIn: existingRecord.clockIn,
        clockOut: nowISO,
        status: 'Pulang',
        notes: existingRecord.notes ? `${existingRecord.notes} | Absen Pulang` : 'Absen Pulang',
      });

      const clockOutTimeStr = formatJakartaTime(updatedRecord.clockOut!);

      return NextResponse.json<ScanResultResponse>({
        success: true,
        statusType: 'SUCCESS',
        message: `Absen Pulang Berhasil! ${employee.name} telah menyelesaikan jam kerja pada pukul ${clockOutTimeStr}.`,
        employee,
        attendance: updatedRecord,
        scanType: 'OUT',
        timestamp: clockOutTimeStr,
      });
    }

    return NextResponse.json<ScanResultResponse>(
      { success: false, statusType: 'ERROR', message: 'Mode pemindaian tidak valid' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Scan attendance error:', error);
    return NextResponse.json<ScanResultResponse>(
      {
        success: false,
        statusType: 'ERROR',
        message: 'Terjadi kesalahan sistem saat memproses pemindaian absensi',
      },
      { status: 500 }
    );
  }
}
