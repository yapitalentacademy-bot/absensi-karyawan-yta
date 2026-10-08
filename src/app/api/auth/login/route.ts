import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi!' },
        { status: 400 }
      );
    }

    const user = db.getUserByUsername(username);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Username atau password tidak cocok!' },
        { status: 401 }
      );
    }

    const sessionData = {
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      user: sessionData,
    });

    // Set cookie
    response.cookies.set({
      name: 'absensi_yta_session',
      value: encodeURIComponent(JSON.stringify(sessionData)),
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem saat login' },
      { status: 500 }
    );
  }
}
