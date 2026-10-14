# Rencana Pengembangan — Cassava Village

Dokumen ini berisi rencana yang belum dieksekusi. Dibuat 2026-08-03. Setiap item
yang selesai dipindahkan ke `CHANGELOG.md` dan dihapus dari sini.

> Catatan penting: model AI yang mengerjakan proyek ini tidak bisa melihat
> gambar (PDF `work!.pdf` dan PNG di `design/` tidak bisa dibaca langsung).
> Semua detail desain HARUS dideskripsikan oleh pemilik proyek.

## 1. Bagian guru: melihat riwayat jawaban essay eksplorasi siswa — SELESAI 2026-08-06

**Keputusan pemilik (2026-08-05): untuk sekarang guru cukup MELIHAT jawaban
essay** — tidak perlu fitur memberi nilai/skor/komentar. Input penilaian
(angka/komentar) ditunda sampai ada permintaan lebih lanjut.

## 2. Hosting: Vercel + Neon Postgres — SELESAI 2026-08-25

Deploy ke Vercel via GitHub integration. Lihat `CHANGELOG.md` [1.9.0] dan [1.13.0].

## 3. Evaluasi → Project-Based Learning — DIBATALKAN (2026-08-25)

Keputusan pemilik: evaluasi **tidak jadi dirombak** ke project-based.
Tetap menggunakan **kuis 5 soal dengan riwayat per attempt** (sudah aktif).

## 4. Evaluasi: persist jawaban saat keluar di tengah — SELESAI 2026-08-11

## 5. Optimasi lanjutan (DITANGGUHKAN — menunggu keputusan pemilik)

Catatan (2026-08-15): dua optimasi berikut DI-SKIP sementara karena menambah
kompleksitas/risiko dengan reward kecil (sebagian besar keuntungan sudah didapat
lewat optimasi [1.13.0]). Dieksekusi bila pemilik memutuskan.

### 5.1 Swap driver `pg` → `@neondatabase/serverless`
- **Untung:** cold-start first-query lebih cepat (~100–300 ms) karena driver
  HTTP Neon tanpa TLS handshake per instance serverless.
- **Risiko:** API mirip `pg` tapi butuh `ws` di Node < 21 (Vercel memakai
  Node 18/20/22); wajib uji lokal + deploy. Reward kecil setelah [1.13.0] jalan.
- **File terpengaruh:** `server/db.js`, `server/package.json`.

### 5.2 CI/CD auto-init-db saat deploy (GitHub Actions)
- Membuat `.github/workflows/deploy.yml` yang menjalankan `INIT_DB=1 node
  server/init-db.js` dengan secret `DATABASE_URL` tiap push ke `main` —
  schema/index baru otomatis diterapkan tanpa manual `npm run init-db`.
- **Risiko:** butuh secret repo; jika gagal, deploy bisa error pada operasi DB.

## 6. Responsive zoom & multi-breakpoint layout — SELESAI 2026-08-19

## 7. Teacher Dashboard — mobile sidebar hamburger — SELESAI 2026-08-19

## 8. Revisi konten evaluasi & format soal — SELESAI 2026-08-20

## 9. Per-class progress — SELESAI 2026-08-20

## 10. Manajemen siswa — SELESAI 2026-08-20

## 11. Perubahan lainnya — SELESAI 2026-08-20

## 12. Typewriter LaTeX + About page + Fraction — SELESAI 2026-08-20

## 13. Wireframe & tooling lokal vs repo — SELESAI 2026-08-25

## 14. Responsif halaman Evaluasi (zoom 125%/75%) — SELESAI 2026-08-23

## 15. Panduan Setup DOCX untuk Lomba — SELESAI 2026-08-25

Script `scripts/generate-setup-docx.py` menghasilkan `Panduan-Setup-Cassava-Village.docx`
(TNR 12pt, Consolas 10.5pt, A4). Tim ROCKIES, Ketua Alyas. Semua gitignored.

## 16. Bug: Re-join Kelas Gagal Setelah Siswa Di-kick — SELESAI 2026-08-25

Race condition `updateUser()` vs `navigate('/')`. Fix: pastikan updateUser selesai
sebelum navigasi.

## 17. Bug visual LaTeX pada soal evaluasi — SELESAI 2026-08-26

Perbaikan rendering notasi komposisi fungsi di `client/src/i18n/en.json` dan
`id.json`:
- Kurung luar `(D ∘ S)(x)` dibungkus `<i>` penuh agar konsisten.
- EN: desimal titik → koma (`0.92` → `0,92`).
- ID eval-4: fix broken HTML pada opsi c & d (tag `<i>` rusak/spasi).
- Kurung pada derivation line `(<i>x</i> − 0,6)` → `<i>(x</i> − 0,6<i>)</i>`
  (hanya kurung italic, angka tetap plain).

## 18. Tindak lanjut pasca-audit keamanan & stabilitas — BELUM DIKERJAKAN (dicatat 2026-10-14)

Konteks: setelah audit [1.23.0] + perbaikan lanjutan (constraint unik usang pada
`answers`, `type: module` root, `sslmode=verify-full`, dokumentasi deploy Git).
Item di bawah ini sengaja belum dikerjakan.

### 18.1 Handler error: pelanggaran foreign key → 401/400, bukan 500
- **Kondisi:** bila ada JWT yang masih valid untuk user yang sudah **dihapus**
  dari DB, `POST /api/answers` gagal dengan pelanggaran FK
  `answers_user_id_fkey` (Postgres code `23503`) dan kini dibalas **500**.
- **Rencana:** di error handler `server/app.js`, deteksi `err.code === '23503'`
  → balas `401 { error: 'Invalid or expired token' }` (atau `400`). Pertimbangkan
  juga `23505` (unique violation) → `409`.
- **Prioritas:** rendah (edge case, tidak terjadi untuk user aktif).

### 18.2 Rate-limit di serverless: shared store
- **Kondisi:** limiter (`express-rate-limit`) memakai store in-memory per-instance,
  sedangkan Vercel menjalankan banyak instance yang bisa cold-start → counter
  per-IP/email tidak dibagi dan bisa reset → proteksi brute-force *best-effort*.
- **Rencana:** pakai shared store (mis. Upstash Redis + `rate-limit-redis`).
  Butuh dependency + env baru (`UPSTASH_REDIS_REST_URL`/`TOKEN`). Perlu keputusan
  pemilik karena menambah biaya/kompleksitas.
- **Prioritas:** sedang (keamanan), menunggu keputusan.

### 18.3 Unduh browser bawaan Playwright
- **Kondisi:** `npx playwright install chromium` **gagal** (timeout) — baik dari
  `cdn.playwright.dev` maupun mirror `cdn.npmmirror.com`. Jaringan mesin lokal ini
  tampaknya memblokir unduhan besar. Belum dicoba dengan
  `PLAYWRIGHT_DOWNLOAD_HOST` lain.
- **Sementara (sudah jalan):** E2E lewat Chrome lokal —
  PowerShell `$env:PLAYWRIGHT_CHANNEL='chrome'; npx playwright test` (22 passed).
- **Rencana:** jalankan `cd client; npx playwright install chromium` di jaringan
  lain / saat koneksi stabil agar `npx playwright test` default (tanpa env) dan CI
  berfungsi.

### 18.4 Referensi item lama
- **Section 5** (swap driver `pg` → `@neondatabase/serverless`, CI/CD auto-init-db)
  tetap **menunggu keputusan pemilik** — lihat di atas.

---

**Status akhir (2026-10-14): semua item aktif SELESAI. Tersisa: item ditangguhkan
Section 5 (swap driver pg, CI/CD) dan tindak lanjut baru Section 18
(FK error handler, shared rate-limit store, unduh browser Playwright).**
