import fs from 'fs';
import path from 'path';
import os from 'os';
import { User, Employee, AttendanceRecord, AuditLog, AppSettings } from './types';
import { getJakartaDateString } from './date';

interface DatabaseSchema {
  users: User[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLog[];
  settings: AppSettings;
}

function getDatabaseFilePath(): string {
  const primaryDir = path.join(process.cwd(), 'data');
  const primaryFile = path.join(primaryDir, 'db.json');

  try {
    if (!fs.existsSync(primaryDir)) {
      fs.mkdirSync(primaryDir, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(primaryDir, '.write_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return primaryFile;
  } catch {
    // Fallback to OS temp directory (works on Vercel & read-only filesystems)
    const tmpDir = path.join(os.tmpdir(), 'absensi_yta_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
    } catch {}
    return path.join(tmpDir, 'db.json');
  }
}

class JsonDB {
  private data: DatabaseSchema;
  private filePath: string;

  constructor() {
    this.filePath = getDatabaseFilePath();
    this.data = this.readDb();
  }

  private readDb(): DatabaseSchema {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
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
    this.data = data;
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Warning: Failed to persist database to disk, keeping in-memory:', err);
    }
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
