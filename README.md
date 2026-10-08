# Absensi Karyawan YTA - Sistem Kehadiran Berbasis QR Code

Aplikasi web modern, terintegrasi, dan responsif untuk pencatatan absensi karyawan menggunakan pemindaian **QR Code** berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **Database Persisten (JSON/SQLite)**.

---

## 🚀 Fitur Utama

1. **Hak Akses & Keamanan Berbasis Peran (RBAC)**
   - **Admin**: Mengelola data karyawan, melihat & mencetak kartu QR Code, memantau dashboard realtime, mengatur jam kerja/keterlambatan, serta melakukan koreksi absensi manual dengan pencatatan Log Audit wajib alasan.
   - **Petugas Absensi**: Membuka pemindai QR Code kamera (depan/belakang) untuk memproses Absen Masuk dan Absen Pulang karyawan.

2. **Pengelolaan Data Karyawan & Cetak QR Code**
   - Tambah, edit, cari, serta ubah status aktif/non-aktif karyawan.
   - Setiap karyawan memperoleh token QR Code unik (keamanan: tidak menyimpan identitas mentah sensitif dalam QR).
   - Fitur cetak kartu identitas resmi dilengkapi QR Code SVG siap cetak.

3. **Pemindaian QR Code (Kamera & Backup Manual)**
   - Mendukung pemindaian langsung dari kamera HP, tablet, maupun webcam PC dengan switcher kamera.
   - Mode tombol **Absen Masuk** dan **Absen Pulang**.
   - Indikator **Audio (Web Audio API)**: Suara chime saat sukses, serta buzz saat terjadi kesalahan/duplikasi.
   - Fitur **Pencarian Backup Manual** jika kamera tidak tersedia.

4. **Aturan Absensi Ketat & Zona Waktu Asia/Jakarta (WIB)**
   - Membatasi 1 catatan Absen Masuk & 1 Absen Pulang per karyawan per hari.
   - Mencegah Absen Masuk ganda dan Mencegah Absen Pulang ganda.
   - **Mencegah Absen Pulang sebelum Absen Masuk**.
   - Kalkulasi otomatis status: `Hadir` (tepat waktu), `Terlambat` (jika melewati batas toleransi), `Pulang`, dan `Belum Lengkap`.

5. **Dashboard & Ekspor Laporan**
   - Ringkasan metrik statistik realtime: Total Aktif, Hadir, Terlambat, Belum Absen, dan Belum Absen Pulang.
   - Tabel laporan kehadiran dengan filter tanggal, pencarian nama/ID, unit/bagian, serta status.
   - Ekspor rekap laporan ke format **Excel (.xlsx)** dan **CSV**.
   - Audit Trail: Semua perubahan manual absensi oleh Admin mewajibkan pengisian alasan dan tersimpan dalam Log Audit Keamanan.

---

## 🛠️ Petunjuk Instalasi & Menjalankan Aplikasi

### Prasyarat
- Node.js versi 18.x atau lebih baru (disarankan v20+ / v24+).
- npm (Node Package Manager).

### 1. Instalasi Dependensi
Jalankan perintah berikut pada terminal di folder proyek:
```bash
npm install
```

### 2. Menjalankan Server Pengembang (Development)
```bash
npm run dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

### 3. Membangun & Menjalankan Mode Produksi (Production)
```bash
npm run build
npm start
```

---

## 🔑 Akun Uji Coba (Demo Credentials)

Aplikasi telah dilengkapi dengan data contoh (*Seed Data*) yang otomatis diinisialisasi pada database persisten `data/db.json`:

| Role | Username | Password | Fitur & Akses Utama |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Akses penuh (Dashboard, Karyawan, Laporan, Koreksi Manual, Log Audit, Pengaturan Jam) |
| **Petugas** | `petugas` | `petugas123` | Akses halaman Pemindai QR Code Absensi & Dashboard Ringkas |

*Catatan: Tersedia tombol "Auto Admin" dan "Auto Petugas" 1-klik di halaman Login untuk mempermudah pengujian.*

---

## 📂 Struktur Database Persisten
Database tersimpan secara otomatis pada direktori `data/db.json` dengan tabel:
- `users`: Pengguna aplikasi & role.
- `employees`: Data karyawan & token QR unik.
- `attendance`: Catatan absensi masuk/pulang harian.
- `auditLogs`: Catatan riwayat koreksi manual Admin & alasan perubahan.
- `settings`: Jam kerja standar & toleransi keterlambatan.
