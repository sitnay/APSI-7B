# Sistem Informasi Pelayanan Kopi OZ

Aplikasi internal Kopi OZ menggunakan Next.js, React, Prisma ORM, dan PostgreSQL. Autentikasi yang tersedia saat ini adalah untuk Pemilik dan Kasir. Barista dan Supervisor Stok tetap ditampilkan sebagai pilihan, tetapi belum dapat masuk.

## Persyaratan

- Node.js versi yang didukung Next.js 16
- Database Kopi OZ yang sudah tersedia di Neon PostgreSQL
- Nilai `DATABASE_URL` Neon dengan SSL aktif
- `SESSION_SECRET` acak dengan panjang minimal 32 byte

Jangan membuat database baru untuk menjalankan aplikasi ini. Simpan URL koneksi Neon pada `.env.local` yang tidak dilacak Git, bukan pada `.env`. URL harus memakai host `*.neon.tech`, port PostgreSQL Neon, nama database, username, password, dan `sslmode=require`. Contoh format (gunakan nilai dari proyek Neon yang sudah ada, jangan salin contoh sebagai kredensial):

```env
DATABASE_URL="postgresql://<username>:<password>@<host-neon>:5432/<database>?sslmode=require"
```

Karakter khusus pada username atau password harus di-URL-encode. Buat nilai rahasia sesi, misalnya dengan PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Simpan hasilnya sebagai `SESSION_SECRET` di `.env.local` bersama `DATABASE_URL`. Jangan masukkan rahasia tersebut ke repository.

## Instalasi dan menjalankan

```powershell
npm install
npx prisma generate
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Database dan migration

Skema Prisma berada di `prisma/schema.prisma`. Migration `20261109170000_require_unique_pengguna_username` menetapkan `pengguna.username` wajib diisi dan unik. Migration ini melakukan pemeriksaan awal dan berhenti dengan pesan yang jelas jika ada username kosong atau duplikat.

Migration belum diterapkan otomatis oleh aplikasi. Setelah memastikan `DATABASE_URL` menunjuk ke database yang benar dan membuat backup, terapkan migration secara eksplisit:

```powershell
npx prisma migrate deploy
npx prisma generate
```

Jangan menjalankan `prisma migrate reset` atau membuat ulang database untuk menyiapkan aplikasi ini.

## Autentikasi

- Login Pemilik dan Kasir memeriksa username, kata sandi, serta role di backend.
- Kata sandi baru disimpan dengan bcrypt. Hash SHA-256 lama yang valid akan ditingkatkan ke bcrypt ketika login berhasil.
- Session ditandatangani dengan `SESSION_SECRET` dan disimpan pada cookie `httpOnly`, `sameSite=lax`.
- Formulir login, logout, pembayaran, dan perubahan transaksi memakai token CSRF yang ditandatangani server.
- Akun contoh tidak dibuat atau ditimpa otomatis oleh aplikasi.

## Route utama

- `/` — splash screen, pemilihan aktor, dan formulir login.
- `/dashboard/kasir` — ringkasan Kasir dengan jumlah pesanan belum/sudah lunas.
- `/dashboard/kasir/pembayaran` — daftar pesanan yang dapat difilter antara belum lunas dan lunas.
- `/dashboard/kasir/detail` — detail pesanan Kasir.
- `/dashboard/kasir/receipt` — daftar transaksi lunas dan bukti yang dapat dicetak.
- `/dashboard/owner` — ringkasan performa penjualan Pemilik.
- `/dashboard/owner/reports` — filter periode, laporan, detail/edit/hapus transaksi.
- `/api/login`, `/api/logout` — autentikasi dan pengakhiran sesi.
- `/api/payments` — pemrosesan pembayaran.
- `/api/owner/transactions` — perubahan transaksi oleh Pemilik.

Tampilan menggunakan frame Figma Kopi OZ untuk splash, pemilihan aktor, dashboard Pemilik/Kasir, laporan, pembayaran, bukti transaksi, dan konfirmasi logout. Alur Pelanggan, Barista, serta Supervisor Stok tetap tidak tersedia. Semua angka, transaksi, pesanan, dan detail menu diambil dari database yang telah dikonfigurasi.
