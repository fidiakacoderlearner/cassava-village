# Cassava Village — LKPD Interaktif (Komposisi Fungsi)

Website Lembar Kerja Peserta Didik (LKPD) interaktif bertema **Desa Singkong**
untuk materi **komposisi fungsi** (Fase F). Dibangun mengikuti desain pada
`work!.pdf` — alur cerita Pak Restu & Pak Rafif, kuis interaktif, dan
penyimpanan jawaban siswa agar bisa dipantau guru.

## Struktur
```
├── client/   # React + Vite + Tailwind (frontend)
└── server/   # Express + SQLite (backend API)
```

## Menjalankan
```bash
# 1. install semua dependency (dari folder root)
npm run install:all

# 2. jalankan server (port 5001) + client (port 5173) bersamaan
npm run dev
```

Buka `http://localhost:5173`.

- Login siswa: daftar akun baru lewat tombol **Sign up**.
- Demo guru: `teacher@cassava.com` / `teacher123` (bisa lihat Dashboard Guru).

## Akun & Role
| Role    | Cara daftar                          | Akses                                   |
| ------- | ------------------------------------ | --------------------------------------- |
| Student | Sign up sendiri di halaman login     | About, Exploration, Evaluation          |
| Teacher | Seed otomatis (lihat demo di atas)   | + Dashboard Guru (progres siswa)        |

## API (backend, port 5001)
| Method | Endpoint                    | Deskripsi                        |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/api/auth/signup`          | Daftar akun (nama, email, pass)  |
| POST   | `/api/auth/login`           | Login → token JWT                |
| GET    | `/api/auth/me`              | Data user (Bearer token)         |
| GET    | `/api/answers`              | Jawaban milik user               |
| POST   | `/api/answers`              | Simpan/update jawaban            |
| GET    | `/api/progress/me`          | Ringkasan progres siswa          |
| GET    | `/api/teacher/students`     | (Guru) progres semua siswa       |

## Bahasa
UI sekarang berbahasa Inggris. Terjemahan Indonesia sudah tersedia:
- Tambahkan/alihkan string di `client/src/i18n/en.json` dan `id.json`.
- Tombol **EN/ID** di navbar & halaman login untuk berpindah bahasa.

## Aset & Gambar
Taruh gambar kamu di `client/src/assets/` — lihat
[`client/src/assets/README.md`](client/src/assets/README.md) untuk daftar nama
file yang dipakai (avatar Pak Restu/Rafif, ilustrasi mesin, logo). Kalau file
belum ada, aplikasi memakai placeholder emoji otomatis.

## Data Materi
- Alur Exploration: `client/src/data/story.js`
- Soal Evaluation: `client/src/data/evaluation.js`
