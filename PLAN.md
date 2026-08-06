# Rencana Pengembangan — Cassava Village

Dokumen ini berisi rencana yang belum dieksekusi. Dibuat 2026-08-03. Setiap item
yang selesai dipindahkan ke `CHANGELOG.md` dan dihapus dari sini.

> Catatan penting: model AI yang mengerjakan proyek ini tidak bisa melihat
> gambar (PDF `work!.pdf` dan PNG di `design/` tidak bisa dibaca langsung).
> Semua detail desain HARUS dideskripsikan oleh pemilik proyek.

## 1. Redesain total halaman Exploration (PRIORITAS) — SELESAI 2026-08-04

Target: sesuai desain `work!.pdf` / `design/desing murid/`.

Sudah dikerjakan (lihat `CHANGELOG.md` [1.2.0] dan [1.3.0]):
- Layout immersive stage (center diagram + dialogue bawah), Navbar & header
  Exploration lama dipertahankan, opsi kuis di bawah kotak dialog.
- `MachineFlowDiagram`, `MoneyFlowDiagram`, `MachineShowcase`,
  `SpeakerCharacter`, `QuizFeedbackModal` (semua pakai placeholder; aset dari
  pemilik).

Penyempurnaan lanjutan ([1.3.0]): mesin (`MachineShowcase`) di-center viewport
dengan cahaya kuning (tanpa cincin), panah flow kurva/lurus solid gelap,
`MoneyFlowDiagram` kartu per-komponen + aset `money-*`, node cassava pakai aset
`cassava.png`, formula dipindah ke dalam kartu dialog, semua kuis 5 opsi,
popup pembahasan tanpa tombol Continue bawah, skip typewriter via tombol kanan,
hint essai berbasis peach, dan pembersihan em dash pada narasi dialog.

## 2. Evaluasi → Project-Based Learning (PRIORITAS berikutnya)

**Akses Evaluasi sementara DIKUNCI** (2026-08-05): route `/evaluation` di
`App.jsx` redirect ke `/`, kartu Evaluasi di Home selalu terkunci
(`card.locked: true`, label `home.comingSoon`), tombol "Lanjut ke Evaluasi"
dihapus dari halaman verifikasi eksplorasi. Kunci dibuka kembali setelah
desain evaluasi baru final.

Evaluasi akan diubah dari sekadar menjawab soal (7 soal, 5 opsi) menjadi
pembelajaran **berbasis proyek**. Detail format/topik proyek belum ditentukan —
menunggu keputusan pemilik. Halaman `Evaluation.jsx`, `data/evaluation.js`, dan
i18n `quiz.eval-*` lama masih ada namun tidak dapat diakses.

## 3. Penyempurnaan Exploration — FINAL 2026-08-05

Eksplorasi resmi dianggap final per [1.5.0]–[1.6.0] (lihat `CHANGELOG.md`).
Ringkasan status akhir:
- **22 step** (cerita + kuis) dengan **7 isian essay** (open step): restrukturisasi
  step 17–22 (`rafif-story`, `open-fog-money`, `open-restu-calc`,
  `open-rafif-calc`, `open-difference-explanation`, `open-conclusion`).
- Alur uang Pak Rafif memakai `MoneyFlowDiagram` mode `reverse` (urutan kartu
  `[Pendapatan Kotor][Biaya Retribusi][Diskon]`, panah miring biasa berlabel
  `f(x)=0,75x` dan `g(x)=x−80.000`).
- Banner konteks + pill jawaban essay sebelumnya (`CalcContextBanner`) dirender
  di bawah header Exploration (step `open-restu-calc` & `open-rafif-calc`).
- Layout dua karakter untuk step `open-difference-explanation` &
  `open-conclusion` (Pak Restu kiri, Pak Rafif kanan, chat di tengah).
- Badge **Soal Tersimpan {n}/7** di header; ReviewPage hanya **Back** +
  **Kirim Jawaban Final** (submit 7 essay → kembali ke Home); Home me-reset
  langsung tanpa modal saat `explorationDone`.

## 4. Bagian guru: melihat riwayat jawaban essay eksplorasi siswa — SELESAI 2026-08-06

**Tujuan:** guru dapat melihat bagaimana siswa menjawab — khususnya **7 isian
essay eksplorasi** — untuk menilai kualitas jawaban, bukan sekadar status
Selesai/Belum.

Sudah dikerjakan (lihat `CHANGELOG.md` [1.7.0]):
- Essay hanya tersimpan ke server saat **Submit Final Answer** (`POST
  /api/exploration/submit`): setiap submit membuat **attempt baru** berisi tepat
  7 jawaban, jadi guru selalu melihat 7 jawaban — tidak kurang, tidak lebih.
- **Riwayat attempt**: tabel `exploration_attempts` + `attempt_answers`; guru
  melihat semua attempt siswa lewat tab **"Eksplorasi {n}"** di `TeacherDashboard`
  (baris siswa bisa di-expand, endpoint `GET /api/teacher/classes/:id/essay-answers`).
- Riwayat attempt tidak dihapus saat replay (`reset-exploration`).

**Keputusan pemilik (2026-08-05): untuk sekarang guru cukup MELIHAT jawaban
essay** — tidak perlu fitur memberi nilai/skor/komentar. Input penilaian
(angka/komentar) ditunda sampai ada permintaan lebih lanjut.

## 5. Hosting: Vercel + Neon Postgres

Langkah:
- Migrasi `server/db.js`: `node:sqlite` (`DatabaseSync`) → `pg` (Postgres).
- File `server/cassava.db` diganti database Postgres serverless (Neon).
- Pecah Express agar jalan sebagai serverless functions di Vercel, atau
  frontend + API terpisah.
- Kode saat ini TIDAK berubah sampai rencana ini disetujui.
