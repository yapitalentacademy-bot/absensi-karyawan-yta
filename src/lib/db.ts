import fs from 'fs';
import path from 'path';
import { User, Employee, AttendanceRecord, AuditLog, AppSettings } from './types';
import { getJakartaDateString } from './date';

interface DatabaseSchema {
  users: User[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLog[];
  settings: AppSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: AppSettings = {
  workStartTime: '08:00',
  lateThresholdMinutes: 15,
  companyName: 'PT YTA Corporate Indonesia',
  timezone: 'Asia/Jakarta',
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Utama',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-2',
    username: 'petugas',
    password: 'petugas123',
    name: 'Petugas Absensi Siska',
    role: 'petugas',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    employeeCode: 'YTA-101',
    name: 'Budi Santoso',
    position: 'Software Engineer',
    department: 'IT & Technology',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP001-SECURE99',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-2',
    employeeCode: 'YTA-102',
    name: 'Siti Nurhaliza',
    position: 'HR Specialist',
    department: 'Human Resources',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP002-SECURE88',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-3',
    employeeCode: 'YTA-103',
    name: 'Ahmad Dahlan',
    position: 'Finance Manager',
    department: 'Finance & Accounting',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP003-SECURE77',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-4',
    employeeCode: 'YTA-104',
    name: 'Dewi Sartika',
    position: 'UI/UX Designer',
    department: 'Product & Design',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP004-SECURE66',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-5',
    employeeCode: 'YTA-105',
    name: 'Eko Prasetyo',
    position: 'Operations Staff',
    department: 'Operations',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP005-SECURE55',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-6',
    employeeCode: 'YTA-106',
    name: 'Rina Melati',
    position: 'Marketing Lead',
    department: 'Marketing & Sales',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP006-SECURE44',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-7',
    employeeCode: 'YTA-107',
    name: 'Fajar Hidayat',
    position: 'DevOps Engineer',
    department: 'IT & Technology',
    status: 'aktif',
    qrToken: 'QR-YTA-EMP007-SECURE33',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'emp-8',
    employeeCode: 'YTA-108',
    name: 'Gita Gutawa',
    position: 'Customer Support',
    department: 'Operations',
    status: 'nonaktif',
    qrToken: 'QR-YTA-EMP008-SECURE22',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString(),
  },
];

function getInitialAttendance(): AttendanceRecord[] {
  const today = getJakartaDateString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getJakartaDateString(yesterdayDate);

  return [
    // Yesterday completed records
    {
      id: 'att-101',
      employeeId: 'emp-1',
      date: yesterday,
      clockIn: `${yesterday}T07:55:00.000Z`,
      clockOut: `${yesterday}T17:05:00.000Z`,
      status: 'Pulang',
      notes: 'Absen tepat waktu',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'att-102',
      employeeId: 'emp-2',
      date: yesterday,
      clockIn: `${yesterday}T08:20:00.000Z`,
      clockOut: `${yesterday}T17:15:00.000Z`,
      status: 'Pulang',
      notes: 'Terlambat 20 menit',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    // Today ongoing records
    {
      id: 'att-201',
      employeeId: 'emp-1',
      date: today,
      clockIn: `${today}T07:48:10.000Z`,
      clockOut: null,
      status: 'Hadir',
      notes: 'Absen Masuk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'att-202',
      employeeId: 'emp-2',
      date: today,
      clockIn: `${today}T08:22:15.000Z`,
      clockOut: null,
      status: 'Terlambat',
      notes: 'Terlambat karena kendala lalu lintas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'att-203',
      employeeId: 'emp-3',
      date: today,
      clockIn: `${today}T07:59:00.000Z`,
      clockOut: null,
      status: 'Hadir',
      notes: 'Absen Masuk',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

class JsonDB {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.readDb();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private readDb(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent) as DatabaseSchema;
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }

    const initialDb: DatabaseSchema = {
      users: INITIAL_USERS,
      employees: INITIAL_EMPLOYEES,
      attendance: getInitialAttendance(),
      auditLogs: [],
      settings: DEFAULT_SETTINGS,
    };

    this.saveDb(initialDb);
    return initialDb;
  }

  private saveDb(data: DatabaseSchema) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    this.data = data;
  }

  // Users
  getUsers(): User[] {
    return this.data.users;
  }

  getUserByUsername(username: string): User | undefined {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  // Employees
  getEmployees(): Employee[] {
    return this.data.employees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.data.employees.find(e => e.id === id);
  }

  getEmployeeByQRToken(token: string): Employee | undefined {
    return this.data.employees.find(e => e.qrToken === token || e.employeeCode === token || e.id === token);
  }

  createEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Employee {
    const id = `emp-${Date.now()}`;
    const newEmp: Employee = {
      ...employee,
      id,
      createdAt: new Date().toISOString(),
    };
    this.data.employees.push(newEmp);
    this.saveDb(this.data);
    return newEmp;
  }

  updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
    const index = this.data.employees.findIndex(e => e.id === id);
    if (index === -1) return null;

    this.data.employees[index] = {
      ...this.data.employees[index],
      ...updates,
    };
    this.saveDb(this.data);
    return this.data.employees[index];
  }

  // Attendance
  getAttendanceRecords(): AttendanceRecord[] {
    return this.data.attendance;
  }

  getAttendanceByDate(dateStr: string): AttendanceRecord[] {
    return this.data.attendance.filter(a => a.date === dateStr);
  }

  getAttendanceForEmployeeOnDate(employeeId: string, dateStr: string): AttendanceRecord | undefined {
    return this.data.attendance.find(a => a.employeeId === employeeId && a.date === dateStr);
  }

  saveAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
    const existing = this.getAttendanceForEmployeeOnDate(record.employeeId, record.date);

    if (existing) {
      const updated: AttendanceRecord = {
        ...existing,
        ...record,
        updatedAt: new Date().toISOString(),
      };
      const idx = this.data.attendance.findIndex(a => a.id === existing.id);
      this.data.attendance[idx] = updated;
      this.saveDb(this.data);
      return updated;
    } else {
      const newRec: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.attendance.push(newRec);
      this.saveDb(this.data);
      return newRec;
    }
  }

  updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
    const index = this.data.attendance.findIndex(a => a.id === id);
    if (index === -1) return null;

    this.data.attendance[index] = {
      ...this.data.attendance[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDb(this.data);
    return this.data.attendance[index];
  }

  // Audit Logs
  createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog); // latest first
    this.saveDb(this.data);
    return newLog;
  }

  getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  // Settings
  getSettings(): AppSettings {
    return this.data.settings || DEFAULT_SETTINGS;
  }

  updateSettings(updates: Partial<AppSettings>): AppSettings {
    this.data.settings = {
      ...this.getSettings(),
      ...updates,
    };
    this.saveDb(this.data);
    return this.data.settings;
  }
}

export const db = new JsonDB();
