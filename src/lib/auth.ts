import { cookies } from 'next/headers';
import { User, UserRole } from './types';
import { db } from './db';

const SESSION_COOKIE_NAME = 'absensi_yta_session';

export interface SessionData {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
}

export function getCurrentSession(): SessionData | null {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;

    const parsed = JSON.parse(decodeURIComponent(sessionCookie.value)) as SessionData;
    return parsed;
  } catch {
    return null;
  }
}

export function isAuthorizedRole(session: SessionData | null, requiredRole?: UserRole): boolean {
  if (!session) return false;
  if (!requiredRole) return true;
  if (requiredRole === 'admin') return session.role === 'admin';
  return true; // petugas or admin
}
