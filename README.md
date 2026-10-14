# Cassava Village — LKPD Interaktif (Komposisi Fungsi)

Website Lembar Kerja Peserta Didik (LKPD) interaktif bertema **Desa Singkong**
untuk materi **komposisi fungsi** (Fase F). Dibangun dengan alur cerita Pak Restu & Pak Rafif, 
kuis interaktif, dan penyimpanan jawaban siswa agar bisa dipantau guru.

## Struktur

```
├── client/   # React 19 + Vite 7 + Tailwind CSS 4 (frontend)
└── server/   # Express + PostgreSQL (backend API)
```

## Prasyarat Sistem

- **Node.js ≥ 18.17.0** (lihat `package.json:engines`)
- **PostgreSQL** (Neon cloud atau instalasi lokal)
- **npm** (termasuk dalam Node.js)

> ⚠️ **Penting**: Aplikasi ini **wajib** menggunakan PostgreSQL

---

## Setup Langkah demi Langkah (Untuk Download ZIP / Clone Baru)

### 1. Ekstrak / Clone Proyek

**Opsi A — Download ZIP dari GitHub:**
- Buka repository di GitHub → tombol **Code** → **Download ZIP**
- Ekstrak ke folder pilihan Anda (mis. `cassava-village/`)

**Opsi B — Clone dengan Git:**
```bash
git clone https://github.com/fidiakacoderlearner/cassava-village.git
cd cassava-village
```

### 2. Buat File Environment (`.env`)

Salin file contoh dan isi nilainya:

```bash
# Linux / macOS / Git Bash / WSL
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env
```

Buka file `.env` dengan editor teks dan **wajib isi `DATABASE_URL`**:

```env
# Wajib: Connection string PostgreSQL (Neon pooled connection string direkomendasikan)
DATABASE_URL=postgresql://user:password@host/database

# Opsional: Secret JWT untuk produksi (dev pakai fallback otomatis)
JWT_SECRET=your-super-secret-key-min-32-chars
```

**Contoh `DATABASE_URL` untuk Neon (serverless Postgres):**
```env
DATABASE_URL=postgresql://username:password@ep-xxx-region.neon.tech/neondb?sslmode=verify-full
```

> Gunakan `sslmode=verify-full`. Mulai `pg` v8.23, mode `require`/`prefer`/`verify-ca`
> diperlakukan sebagai alias `verify-full` dan memunculkan peringatan keamanan di
> log; menuliskan `verify-full` secara eksplisit menghilangkan peringatan itu tanpa
> mengubah perilaku koneksi.

**Contoh untuk PostgreSQL lokal:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/cassava_village
```

> 💡 **Dapatkan Neon gratis**: Daftar di [neon.tech](https://neon.tech) → buat project → copy "Pooled connection string" → paste ke `.env`

### 3. Install Semua Dependency

Dari **folder root proyek** (yang berisi `package.json`):

```bash
npm run install:all
```

Perintah ini akan menjalankan `npm install` di folder `server/` dan `client/` secara berurutan.

### 4. Inisialisasi Database (Wajib Pertama Kali)

```bash
npm run init-db
```

Perintah ini akan:
- Membuat semua tabel (users, classes, answers, exploration_attempts, evaluation_attempts, dll)
- Menjalankan migrasi skema (idempotent, aman dijalankan berulang)
- Men-seed akun demo (guru + 3 siswa) + data jawaban contoh
- Mengisi data drag & drop untuk attempt lama (backfill)

> ✅ Jalankan **sekali saja** saat setup pertama. Untuk reset DB, hapus database dan jalankan ulang.

### 5. Jalankan Mode Development

```bash
npm run dev
```

Ini menjalankan dua proses bersamaan (via `concurrently`):
- **Server API** → `http://localhost:5001` (Express + `--watch` auto-restart)
- **Client Dev** → `http://localhost:5173` (Vite + HMR)

Buka browser ke: **`http://localhost:5173`**

### 6. Login dengan Akun Demo

| Role  | Email | Password | Akses |
|-------|-------|----------|-------|
| Guru  | `teacher@cassava.com` | `teacher123` | Dashboard Guru + semua halaman siswa |
| Siswa | `student@cassava.com` | `student123` | About, Exploration, Evaluation |
| Siswa | `budi@cassava.com` | `budi123` | About, Exploration, Evaluation |
| Siswa | `siti@cassava.com` | `siti123` | About, Exploration, Evaluation |

> Siswa baru bisa **Sign Up** langsung di halaman login. Siswa wajib memasukkan **Kode Kelas** (default: `DEMOAB`) saat daftar atau login pertama kali.

---

## Perintah Berguna

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Jalankan server + client development (port 5001 & 5173) |
| `npm run build` | Build production client (verifikasi syntax, output ke `client/dist/`) |
| `npm run start` | Jalankan hanya server production (perlu `npm run build` dulu) |
| `npm run init-db` | Inisialisasi ulang database (schema + seed + backfill) |
| `npm run install:all` | Install ulang semua dependency server & client |

---

## Deploy ke Vercel (Production)

Production menggunakan **integrasi Git**: repo GitHub sudah tersambung ke
project Vercel, sehingga setiap `git push` ke branch `main` otomatis
di-build & di-deploy. **Tidak perlu** `npx vercel --prod`.

**Setup awal (sekali saja), lewat Vercel Dashboard:**
1. Import repo GitHub `cassava-village` sebagai project Vercel.
2. Tambahkan Environment Variables (Production **dan** Preview):
   - `DATABASE_URL` — Neon pooled connection string
   - `JWT_SECRET` — string acak 32+ karakter. **Wajib di production**: server
     sengaja gagal start (`JWT_SECRET is required in production`) bila kosong,
     sehingga seluruh endpoint `/api` ikut mati.
3. Deploy.

**Deploy berikutnya:**
- Cukup `git push origin main`. Vercel menjalankan `npm run build` (output
  `client/dist/`) dan menerbitkan produksi.
- Setelah **mengubah Environment Variable**, lakukan **Redeploy**
  (Deployments → ⋯ → Redeploy) agar nilai baru terpakai.
- Bila perubahan menyentuh schema/index DB, jalankan `npm run init-db`
  **sekali** secara lokal (dengan `DATABASE_URL` Neon di `.env`).

**Catatan Vercel**:
- `vercel.json` sudah dikonfigurasi: build output `client/dist/`, API rewrites ke `api/index.js`, region `sin1` (Singapura, dekat Neon ap-southeast-1)
- Serverless function di Vercel **tidak** auto-jalankan `initDb()` (cold-start penalty) → wajib manual `npm run init-db` setelah deploy pertama
- **Rate limit bersifat best-effort di serverless**: limiter (`express-rate-limit`) memakai store in-memory, sedangkan Vercel menjalankan banyak instance function yang bisa cold-start. Counter per-IP/email tidak dibagi antar-instance dan bisa reset saat instance baru dibuat, jadi proteksi brute-force tidak sekuat di server tunggal. Untuk jaminan penuh perlu shared store (mis. Redis/Upstash) — belum diimplementasikan.
- Domain produksi default: `https://cassava-village.vercel.app` (domain custom bisa diatur di Vercel → Project → Domains).

---

## Akun & Role

| Role    | Cara Daftar                          | Akses                                   |
| ------- | ------------------------------------ | --------------------------------------- |
| Student | Sign up sendiri di halaman login     | About, Exploration, Evaluation          |
| Teacher | Seed otomatis via `npm run init-db`  | + Dashboard Guru (progres siswa)        |

- Guru bisa buat kelas baru di Dashboard → dapat **Kode Kelas** (6 karakter)
- Siswa masukkan Kode Kelas saat Sign Up atau saat login pertama (form Join Class)
- Guru bisa *kick* siswa dari kelas via Dashboard

---

## API (Backend, Port 5001)

| Method | Endpoint | Auth | Deskripsi |
| ------ | -------- | ---- | --------- |
| POST | `/api/auth/signup` | — | Daftar akun (nama, email, password, role, class_code*) |
| POST | `/api/auth/login` | — | Login → return JWT token |
| POST | `/api/auth/join-class` | Bearer | Update `class_id` user (siswa join kelas) |
| GET | `/api/answers` | Bearer | Ambil jawaban milik user |
| POST | `/api/answers` | Bearer | Simpan/update jawaban (tolak `OPEN_STEP_IDS`) |
| POST | `/api/exploration/submit` | Bearer | Submit final exploration (buat attempt + essay + drag) |
| POST | `/api/evaluation/submit` | Bearer | Submit evaluation (buat attempt + upsert answers) |
| GET | `/api/progress/me` | Bearer | Ringkasan progres siswa |
| POST | `/api/progress/reset-exploration` | Bearer | Reset exploration (hapus localStorage, server keep history) |
| GET | `/api/teacher/classes` | Bearer + Teacher | List kelas milik guru |
| POST | `/api/teacher/classes` | Bearer + Teacher | Buat kelas baru |
| DELETE | `/api/teacher/classes/:id` | Bearer + Teacher | Hapus kelas |
| GET | `/api/teacher/classes/:id/students` | Bearer + Teacher | List siswa di kelas |
| GET | `/api/teacher/classes/:id/essay-answers` | Bearer + Teacher | Riwayat jawaban essay per attempt |
| GET | `/api/teacher/classes/:id/evaluation-answers` | Bearer + Teacher | Riwayat jawaban evaluasi per attempt |
| GET | `/api/teacher/classes/:id/summary` | Bearer + Teacher | Gabungan: kelas + siswa + essays + evaluations |
| DELETE | `/api/teacher/classes/:classId/students/:studentId` | Bearer + Teacher | Kick siswa dari kelas |
| GET | `/api/health` | — | Health check |

---

## Bahasa (i18n)

- Semua teks UI & materi lewat i18n — **jangan hardcode string** di komponen
- File: `client/src/i18n/en.json` dan `id.json` (struktur key harus identik)
- Context: `client/src/context/I18nContext.jsx`
  - `t('a.b.c', vars)` — terjemahan; placeholder `{x}` diganti dari `vars`
  - `has('a.b.c')` — cek key ada sebelum dipakai
  - `lang`, `setLanguage('en' \| 'id')` — persist ke `localStorage cv_lang`
- Tambah key baru → **harus di kedua file** (`en.json` & `id.json`)

---

## Aset & Gambar

Taruh gambar di `client/src/assets/` — lihat
[`client/src/assets/README.md`](client/src/assets/README.md) untuk daftar nama file yang dipakai
(avatar Pak Restu/Rafif, ilustrasi mesin, logo card, logo sponsor, background login).

**Format didukung**: `.webp` (rekomendasi), `.png`, `.jpg`, `.jpeg`, `.svg`, `.gif`, `.avif`.

Kalau file belum ada → aplikasi memakai placeholder emoji/gradient otomatis (web tetap jalan).

**Logo Sponsor (Login Page)**: 2 file placeholder sudah ada di `client/src/assets/`:
- `logo-kemendiktisaintek.webp`
- `logo-unri.webp`

Ganti dengan file asli Anda (nama file sama) → otomatis terpakai.

**Favicon**: file ada di `client/public/` (`favicon.webp`, `favicon-32.png`,
`apple-touch-icon.png`) dan di-link dari `client/index.html`. Vite menyalin folder
`public/` ke `client/dist/` saat build. Untuk mengganti ikon, cukup ganti ketiga
file itu (atau jalankan ulang konversi dari `client/src/assets/cassava.webp`).

---

## Data Materi

- Alur Exploration (24 step): `client/src/data/story.js`
- Soal Evaluation (5 soal): `client/src/data/evaluation.js`
- Drag & Drop Experiment: `client/src/data/drag.js`

Semua teks cerita/soal/penjelasan/opsi di `client/src/i18n/{en,id}.json` di bawah namespace `story.*`, `quiz.*`, `exploration.*`, `evaluation.*`.

---

## Troubleshooting

### `Error: DATABASE_URL is required`
- Pastikan file `.env` ada di root proyek
- Pastikan `DATABASE_URL` diisi dengan connection string PostgreSQL yang valid
- Pastikan tidak ada spasi/karakter aneh di nilai `.env`

### `connect ECONNREFUSED` / `ENOTFOUND` ke database
- Cek `DATABASE_URL` benar (host, port, user, password, dbname)
- Neon: pastikan pakai **pooled connection string** (bukan direct)
- Lokal: pastikan Postgres jalan & `pg_hba.conf` allow connection

### `npm run init-db` gagal / timeout
- Cek koneksi internet (untuk Neon)
- Cek firewall/VPN tidak blokir port 5432 / 443
- Cek `DATABASE_URL` format benar (utf8, tanpa newline)

### Port 5001 / 5173 sudah dipakai
- Ganti port di `server/index.js` (server) atau `vite.config.js` (client) jika perlu
- Atau hentikan proses lain yang pakai port tersebut

### `node: --env-file` not found
- Butuh **Node.js ≥ 20.6.0** (flag `--env-file` native)
- Atau install `dotenv-cli` dan ganti script dev jadi `dotenv -e .env -- node --watch index.js`

---

