# Supabase Setup Guide

## Langkah 1: Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Sign up atau login
3. Klik "New Project"
4. Isi form:
   - Name: `les_dinda`
   - Database Password: Buat password yang kuat (ingat password ini!)
   - Region: Pilih region terdekat
5. Tunggu project dibuat (kira-kira 2 menit)

## Langkah 2: Import Migration

1. Buka sidebar kiri dan klik "SQL Editor"
2. Klik tombol "New Query"
3. Copy dan paste seluruh konten dari file `migration.sql`
4. Klik tombol "Run" (jalan ke kanan atas)
5. Tunggu sampai status "Success" muncul

## Langkah 3: Cek Tabel

1. Buka sidebar kiri dan klik "Table Editor"
2. Pastikan ada 2 tabel: `students` dan `sessions`
3. Klik pada tabel untuk melihat data

## Langkah 4: Setup Environment Variables

1. Buka sidebar kiri dan klik "Project Settings"
2. Pilih "API"
3. Copy:
   - Project URL
   - anon key
4. Update file `.env.local` di project Next.js:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ipekwfgmcobdsqggtmkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwZWt3ZmdtY29iZHNxZ2d0bWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNDM1NjQsImV4cCI6MjA4NjcxOTU2NH0.XXaByi1_OBBhTtWmUvfU61NYw6aLYwThbaCszqPR_o0
```

## Langkah 5: Test Connection

1. Buka terminal di project
2. Jalankan `npm run dev`
3. Buka [http://localhost:3000](http://localhost:3000)
4. Coba tambah siswa baru

## Troubleshooting

### Error: "Connection refused"
- Pastikan file `.env.local` sudah benar
- Restart server dengan `Ctrl+C` lalu `npm run dev`

### Error: "Invalid URL"
- Cek URL Supabase di project settings
- Pastikan tidak ada spasi atau karakter aneh

### Data tidak muncul
- Cek migration SQL sudah dijalankan
- Refresh halaman
- Cek console untuk error messages

### RLS Error (Row Level Security)
Pastikan migration SQL sudah dijalankan dengan benar dan policies sudah aktif.
