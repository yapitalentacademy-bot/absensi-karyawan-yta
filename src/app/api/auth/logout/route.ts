import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.set({
    name: 'absensi_yta_session',
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
