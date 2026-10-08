import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Absensi Karyawan YTA - Sistem Kehadiran QR Code',
  description: 'Aplikasi pencatatan absensi karyawan cepat dan responsif menggunakan pemindaian QR Code.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
