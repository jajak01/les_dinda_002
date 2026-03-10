# Les Dinda - Aplikasi Pelacakan Les Privat

Aplikasi Next.js untuk mengelola data siswa, jadwal les privat, dan pembayaran.

## Fitur Utama

### 1. Dashboard
- Statistik total siswa, sesi hari ini, sesi minggu ini, pendapatan bulanan
- Agenda sesi mendatang
- Informasi pendapatan dan total sesi

### 2. Manajemen Siswa (CRUD)
- Tambah, edit, hapus siswa
- Data siswa: nama, sekolah, tingkat, kontak, alamat

### 3. Manajemen Sesi
- Tambah sesi les per siswa
- Edit dan jadwal ulang sesi (reschedule)
- Filter sesi berdasarkan:
  - Tanggal (Hari ini, Minggu ini, Bulan ini, Custom)
  - Status pembayaran (Pending, Lunas, Overdue)
  - Status jadwal (Jadwal, Selesai, Batal)
- Search sesi berdasarkan nama siswa
- Catat status pembayaran dan tanggal pembayaran
- Harga variabel per sesi (20.000 - 100.000 IDR)

### 4. Tracking Pembayaran
- Status pembayaran: Pending, Lunas, Overdue
- Badge warna untuk status pembayaran
- Quick mark as paid untuk sesi yang jadwal

## Stack Technology

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Database & Auth)
- **Deployment**: Vercel

## Setup Local

### 1. Clone Repository
```bash
git clone <repository-url>
cd les_dinda
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database (Supabase)

1. Buka [supabase.com](https://supabase.com) dan buat project baru
2. Import migration SQL dari file `supabase/migration.sql`
3. Copy URL dan API keys dari project settings
4. Update file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Deployment ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka [vercel.com](https://vercel.com) dan sign in
2. Import project dari GitHub
3. Add environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Database Schema

### Tabel: students
- `id`: UUID primary key
- `name`: Nama siswa
- `school`: Sekolah
- `grade`: Tingkat/kelas
- `contact`: Kontak (telepon/email)
- `address`: Alamat
- `created_at`, `updated_at`: Timestamps

### Tabel: sessions
- `id`: UUID primary key
- `student_id`: Foreign key ke students
- `date`: Tanggal sesi
- `time`: Waktu sesi
- `subject`: Subjek
- `notes`: Catatan
- `status`: scheduled, completed, cancelled
- `payment_status`: pending, paid, overdue
- `payment_date`: Tanggal pembayaran
- `price`: Harga per sesi
- `created_at`, `updated_at`: Timestamps

## Penggunaan

### Menambah Siswa
1. Klik tombol "Tambah Siswa" di dashboard
2. Isi data siswa (nama wajib diisi)
3. Klik "Simpan"

### Menambah Sesi
1. Buka tab "Sesi"
2. Klik tombol "Tambah Sesi"
3. Pilih siswa, tanggal, dan waktu
4. Atur harga dan status pembayaran
5. Klik "Simpan"

### Edit/Reschedule Sesi
1. Buka tab "Sesi"
2. Klik tombol edit pada sesi yang ingin diubah
3. Ubah tanggal, waktu, atau data lainnya
4. Klik "Simpan"

### Filter Sesi
1. Buka tab "Sesi"
2. Gunakan filter di atas:
   - Cari siswa
   - Filter status pembayaran
   - Filter status jadwal
3. Klik "Terapkan Filter"

## Kontribusi

Untuk development:
1. Buat branch baru: `git checkout -b feature/nama-fitur`
2. Commit perubahan: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/nama-fitur`
4. Buat Pull Request

## License

Dibuat untuk tujuan pribadi.

---

Dibuat dengan ❤️ menggunakan Next.js dan Supabase
