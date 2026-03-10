# Panduan Instalasi Les Dinda

## ✅ Tahap 1: Setup Project (SELESAI)

Project Next.js telah berhasil dibuat di:
`C:\Users\desen\Documents\les_dinda`

Server development sudah berjalan di:
http://localhost:3000

## 📋 Langkah Selanjutnya

### 1. Setup Supabase Database

1. **Buka Supabase**
   - Login ke https://supabase.com
   - Klik "New Project"

2. **Isi Project Details**
   - Name: `les_dinda`
   - Database Password: Buat password kuat (PENTING: ingat password ini!)
   - Region: Pilih terdekat

3. **Import Migration**
   - Buka SQL Editor
   - Copy isi file `supabase/migration.sql`
   - Paste dan klik "Run"
   - Tunggu status "Success"

4. **Cek Tabel**
   - Buka Table Editor
   - Pastikan ada `students` dan `sessions`

### 2. Setup Environment Variables

API keys yang sudah ada di project:
- URL: `https://ipekwfgmcobdsqggtmkl.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZWt3ZmdtY29iZHNxZ2d0bWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDM1NjQsImV4cCI6MjA4NjcxOTU2NH0.XXaByi1_OBBhTtWmUvfU61NYw6aLYwThbaCszqPR_o0`

File `.env.local` sudah terisi dengan benar.

### 3. Test Aplikasi

1. **Buka Browser**
   - Buka http://localhost:3000

2. **Coba Tambah Siswa**
   - Klik "Tambah Siswa"
   - Isi nama dan data lain
   - Klik "Simpan"

3. **Coba Tambah Sesi**
   - Buka tab "Sesi"
   - Klik "Tambah Sesi"
   - Pilih siswa
   - Pilih tanggal dan waktu
   - Klik "Simpan"

## 📂 Struktur Project

```
les_dinda/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Dashboard utama
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx           # Main dashboard component
│   │   │   ├── StatsCards.tsx          # Stats cards
│   │   │   ├── QuickActions.tsx        # Quick action buttons
│   │   │   └── UpcomingSessions.tsx    # Upcoming sessions
│   │   ├── sessions/
│   │   │   ├── SessionFilters.tsx      # Filters for sessions
│   │   │   ├── SessionList.tsx         # List of sessions
│   │   │   └── SessionForm.tsx         # Form to add/edit sessions
│   │   ├── students/
│   │   │   ├── StudentList.tsx         # List of students
│   │   │   └── StudentForm.tsx         # Form to add/edit students
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts               # Supabase client
│   │       ├── server.ts               # Supabase server client
│   │       └── actions.ts              # Server actions
│   └── types/
│       └── database.ts                 # TypeScript types
├── supabase/
│   ├── migration.sql                   # Database schema
│   └── README.md                       # Database setup guide
├── .env.local                          # Environment variables
├── package.json                        # Dependencies
└── README.md                           # Project documentation
```

## 🎯 Cara Menggunakan

### Dashboard
- Melihat statistik total siswa dan sesi
- Melihat agenda sesi mendatang
- Quick actions untuk tambah siswa/tesi

### Tab Siswa
- Klik "Tambah Siswa" untuk menambah siswa baru
- Klik tombol edit untuk mengubah data
- Klik tombol hapus untuk menghapus siswa

### Tab Sesi
- Klik "Tambah Sesi" untuk menambah sesi les
- Gunakan filter untuk mencari/memfilter sesi
- Klik tombol edit untuk reschedule
- Cek status pembayaran

## 🔧 Troubleshooting

### Server tidak berjalan
```bash
cd /c/Users/desen/Documents/les_dinda
npm run dev
```

### Error "Connection refused"
- Pastikan `.env.local` sudah benar
- Restart server dengan `Ctrl+C` lalu `npm run dev`

### Data tidak muncul
- Cek migration SQL sudah dijalankan
- Refresh halaman
- Cek console untuk error messages

## 🚀 Deployment ke Vercel

1. **Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Deploy ke Vercel**
   - Buka vercel.com
   - Import project
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Deploy

## 📞 Butuh Bantuan?

1. Baca `README.md` - dokumentasi lengkap
2. Baca `supabase/README.md` - panduan setup database
3. Cek console browser untuk error messages

---

## ✨ Fitur yang Sudah Siap

✅ Dashboard dengan statistik
✅ Manajemen Siswa (CRUD)
✅ Manajemen Sesi (CRUD + Reschedule)
✅ Filter dan Search Sesi
✅ Tracking Pembayaran
✅ Modern UI dengan shadcn/ui
✅ Responsive Design
✅ TypeScript untuk type safety

---

**Aplikasi sudah siap digunakan! Selamat mencoba! 🎉**
