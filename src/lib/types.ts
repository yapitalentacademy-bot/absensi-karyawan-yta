export type UserRole = 'admin' | 'petugas';

export interface User {
  id: string;
  username: string;
  password: string; // hashed/plain for demo
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  position: string;
  department: string;
  status: 'aktif' | 'nonaktif';
  qrToken: string;
  avatarUrl?: string;
  createdAt: string;
}

export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Pulang' | 'Belum Lengkap';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD (Asia/Jakarta)
  clockIn: string | null; // ISO String or HH:mm:ss
  clockOut: string | null;
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  attendanceId: string;
  employeeName: string;
  editedByUserId: string;
  editedByName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  previousData?: Partial<AttendanceRecord>;
  newData?: Partial<AttendanceRecord>;
  reason: string;
  timestamp: string;
}

export interface AppSettings {
  workStartTime: string; // HH:mm format e.g. "08:00"
  lateThresholdMinutes: number; // e.g. 15 -> late if after 08:15
  companyName: string;
  timezone: string; // "Asia/Jakarta"
}

export interface ScanResultResponse {
  success: boolean;
  message: string;
  employee?: Employee;
  attendance?: AttendanceRecord;
  scanType?: 'IN' | 'OUT';
  timestamp?: string;
  statusType?: 'SUCCESS' | 'ALREADY_EXISTS' | 'INVALID_QR' | 'MISSING_CLOCK_IN' | 'ERROR';
}
