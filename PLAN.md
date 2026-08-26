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

---

**Status akhir: semua item aktif SELESAI. Yang tersisa hanya item ditangguhkan
(Section 5: swap driver pg, CI/CD).**
