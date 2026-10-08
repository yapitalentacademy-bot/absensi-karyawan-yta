import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getJakartaDateString } from '@/lib/date';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getJakartaDateString();
    const search = searchParams.get('search')?.toLowerCase() || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const employees = db.getEmployees();
    const activeEmployees = employees.filter(e => e.status === 'aktif');
    const allRecords = db.getAttendanceRecords();

    // Stats for specific date (defaults to today)
    const dateRecords = allRecords.filter(r => r.date === date);

    // Map employee details into attendance records
    let enriched: any[] = dateRecords.map(record => {
      const emp = employees.find(e => e.id === record.employeeId);
      return {
        ...record,
        employeeCode: emp?.employeeCode || 'N/A',
        employeeName: emp?.name || 'Tidak Dikenal',
        department: emp?.department || 'N/A',
        position: emp?.position || 'N/A',
        avatarUrl: emp?.avatarUrl,
      };
    });

    // Apply filters
    if (search) {
      enriched = enriched.filter(
        item =>
          item.employeeName.toLowerCase().includes(search) ||
          item.employeeCode.toLowerCase().includes(search) ||
          item.position.toLowerCase().includes(search)
      );
    }

    if (department) {
      enriched = enriched.filter(item => item.department === department);
    }

    if (status) {
      if (status === 'Belum Absen') {
        // Special case: Employees with NO record today
        const checkedInEmpIds = new Set(dateRecords.map(r => r.employeeId));
        const notCheckedIn = activeEmployees
          .filter(e => !checkedInEmpIds.has(e.id))
          .map(e => ({
            id: `absent-${e.id}`,
            employeeId: e.id,
            employeeCode: e.employeeCode,
            employeeName: e.name,
            department: e.department,
            position: e.position,
            avatarUrl: e.avatarUrl,
            date,
            clockIn: null,
            clockOut: null,
            status: 'Belum Absen' as const,
            notes: 'Belum melakukan absensi hari ini',
            createdAt: '-',
            updatedAt: '-',
          }));
        enriched = notCheckedIn;
      } else {
        enriched = enriched.filter(item => item.status === status);
      }
    }

    // Calculate live stats summary for the selected date
    const clockedInEmpIds = new Set(dateRecords.filter(r => r.clockIn).map(r => r.employeeId));
    
    const stats = {
      totalActiveEmployees: activeEmployees.length,
      hadirToday: dateRecords.filter(r => r.status === 'Hadir' || r.status === 'Pulang').length,
      terlambatToday: dateRecords.filter(r => r.status === 'Terlambat').length,
      belumAbsenToday: Math.max(0, activeEmployees.length - clockedInEmpIds.size),
      belumAbsenPulangToday: dateRecords.filter(r => r.clockIn && !r.clockOut).length,
    };

    return NextResponse.json({
      success: true,
      stats,
      records: enriched,
    });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat mengambil laporan absensi' },
      { status: 500 }
    );
  }
}
