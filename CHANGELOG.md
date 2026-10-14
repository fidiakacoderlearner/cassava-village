# Changelog — Cassava Village

Semua perubahan penting pada proyek dicatat di sini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

## [1.23.0] — 2026-10-14

### Ditambahkan
- **Pesan rate-limit yang informatif di halaman Login** (`Login.jsx`,
  `context/api.js`, `server/middleware/rate-limit.js`, `i18n/*.json`): saat
  login/signup/join-class kena limit (HTTP 429), server mengirim `retryAfter`
  (detik, dihitung dari `resetTime`) + header `Retry-After`, dan UI menampilkan
  pesan seperti "Terlalu banyak percobaan. Coba lagi dalam 14 menit 30 detik."
  (sebelumnya hanya "Terjadi kesalahan, coba lagi").

### Diubah
- **Maintenance dependency**: `npm audit fix` (0 vulnerability) + upgrade minor
  (express, react, react-dom, react-router, pg, playwright) dan sinkronisasi
  lockfile (menghapus paket basi).

### Diperbaiki
- **Bug `saveAnswer` kuis eksplorasi** (`Exploration.jsx`): fungsi penyimpan
  jawaban yang hilang dipulihkan sehingga menjawab kuis tidak lagi crash.
- **Body JSON tidak valid** (`server/app.js`): permintaan dengan body bukan JSON
  kini dibalas **400** `{ error: 'Invalid JSON body' }`, bukan 500.
- **Rate-limit IPv6** (`server/middleware/rate-limit.js`): `keyGenerator` memakai
  helper `ipKeyGenerator()` dari express-rate-limit — peringatan
  `ERR_ERL_KEY_GEN_IPV6` hilang dan IP IPv6 dinormalisasi ke subnet.

### Catatan
- Setelah upgrade Playwright (1.62 → 1.63), browser bawaan perlu diunduh ulang:
  `cd client; npx playwright install chromium`. Bila unduhan gagal, jalankan
  dengan Chrome lokal: PowerShell `$env:PLAYWRIGHT_CHANNEL='chrome'; npx playwright test`.

### Keamanan
- **Skoring di server**: `is_correct` soal kuis dihitung server dari
  `answerIndex` (`QUIZ_CORRECT`/`EVAL_CORRECT` di `shared/constants.js`) →
  nilai tidak bisa dipalsukan lewat client.
- **Hardening**: `helmet` + CSP meta, rate-limit auth (login/signup/join-class,
  konstanta di `server/middleware/rate-limit.js`), JWT fail-fast di produksi
  (`JWT_SECRET` wajib), batas essay 2000 karakter (`MAX_ESSAY_LENGTH`), validasi
  kombinasi drag di server (harus 1 retribusi + 1 diskon, slot berbeda),
  allowlist `stepId`, dan sanitasi `MathText` diperketat (allowlist properti
  `style`).

Catatan E2E mesin lokal: `PLAYWRIGHT_CHANNEL=chrome npx playwright test`
(pengaturan `channel` via env di `client/playwright.config.ts`).

## [1.22.0] — 2026-08-26

### Ditambahkan
- **Watermark "Made with ❤️ by Rockies"** (`Login.jsx`): teks kecil di pojok bawah
  tengah halaman login dengan positioning `fixed` (zoom-safe, selalu terlihat di
  viewport tanpa terpengaruh zoom level). Warna subtle `text-brown-800/50`,
  `select-none`.

## [1.21.0] — 2026-08-26

### Diperbaiki
- **Bug visual LaTeX pada soal evaluasi** (`en.json`, `id.json`):
  - Semua notasi komposisi fungsi `(D ∘ S)(x)` dan `(S ∘ D)(x)` kini dibungkus
    `<i>` tag penuh (termasuk kurung luar) agar konsisten dengan rendering math
    italic.
  - EN: desimal diganti ke koma (`0.92` → `0,92`, `0.6` → `0,6`, dll.) sesuai
    konvensi Indonesia.
  - EN eval-4: `x` pada "for x = 25 kg" di-italic.
  - ID eval-2 opsi c: kurung `(<i>x</i> − 0,6)` → `<i>(x</i> − 0,6<i>)</i>`
    (hanya kurung yang italic, angka tetap plain).
  - ID eval-4: fix broken HTML pada opsi c & d
    (`(<>S ∘ D</ i>)`, `(< i>D ∘ S</ i>)`) → format bersih `<i>(S ∘ D)(25)</i>`.
  - ID eval-4: derivation line `0,92(<i>x</i> − 0,6)` → `0,92<i>(x</i> − 0,6<i>)</i>`.

## [1.20.0] — 2026-08-25

### Diperbaiki
- **Bug re-join kelas setelah di-kick** (`Login.jsx`): siswa yang di-kick dari
  kelas (`class_id = NULL`) sekarang bisa re-join dengan kode kelas yang valid.
  Penyebab: race condition antara `updateUser()` dan `navigate('/')` — navigasi
  terjadi sebelum state user ter-update, sehingga guard `StudentOnly`/`StudentHome`
  melempar ke login. Fix: pastikan `updateUser()` selesai sebelum navigasi.

### Ditambahkan
- **Panduan Setup DOCX** (Section 19 PLAN.md): script Python
  `scripts/generate-setup-docx.py` menghasilkan `Panduan-Setup-Cassava-Village.docx`
  (Times New Roman 12 pt, kode Consolas 10.5 pt, A4). Berisi panduan lengkap
  setup dari nol: prasyarat, Neon DB, kode sumber, `.env`, instalasi, init-db,
  menjalankan, dan troubleshooting. Placeholder `[Sisipkan screenshot]` di
  setiap langkah kunci.

### Dihapus
- **Lisensi** dari `README.md` — bagian "Lisensi" dihapus.

## [1.19.0] — 2026-08-25

### Ditambah
- **Shared constants**: `shared/constants.js` sebagai single source of truth
  untuk step IDs (`OPEN_STEP_IDS`, `EXPLORE_STEP_IDS`, `EVAL_STEP_IDS`,
  `TOTAL_OPEN_STEPS`) dan data drag experiment (`DRAG_CARDS`, `DRAG_FN`,
  `DRAG_COMBOS`, `DRAG_X`, `DRAG_BEST`, `DRAG_SUB`, `EXPERIMENT_ROWS`).
  Client mengakses via alias Vite `@shared/constants.js`; server via import
  relatif `../shared/constants.js`. `client/src/data/drag.js` dan
  `server/constants.js` kini re-export (kompatibilitas lama terjaga).
- **Sponsor logos login**: komponen `SponsorLogos.jsx` (3 logo:
  Kemendiktisaintek, UNRI, STEP 2026) di pojok kiri atas halaman login dengan
  background putih (class `.sponsor-logos` di index.css). Placeholder webp di
  assets — ganti file tanpa ubah kode.
- **E2E Playwright** (`client/tests/`, 22 test hijau ±20 detik): 4 suite
  (error-cases, student-journey, teacher-journey, persistence) + page objects +
  fixture bahasa (`tests/fixtures.ts` set `cv_lang='id'`; config locale
  `id-ID`). Selector bilingual ID/EN; artefak test-results/playwright-report
  gitignored.

### Diubah
- **Pemecahan komponen besar** (tanpa perubahan perilaku):
  - `TeacherDashboard.jsx` (934→±300 baris) → `components/teacher/`: StatCard,
    ClassDropdown, ConfirmationModal, AttemptTabs, EssayAnswersPanel,
    EvaluationAnswersPanel, StudentTable, Sidebar.
  - `Exploration.jsx` (1150→±460 baris) → `components/quiz/`: QuizOptions,
    OpenStepInput, DialogueActions, DragExperimentQuiz (dipecah lagi ke
    DragSlot/DragGroup/DragGhostPortal/DragConfirmModal),
    ExperimentResultTable, ReviewPage + `components/CalcContextBanner.jsx`.
- **AuthContext/api**: hapus global callback `setOnUnauthorized`;
  `api()` kini menerima opsi `on401`. Context menyediakan wrapper
  `authedApi` (auto token + logout saat 401) — semua halaman memakai
  `const { api } = useAuth()`.
- **AssetImage**: prioritas format dibetulkan menjadi
  `avif > webp > png > jpg > svg > gif`.

### Diperbaiki
- **Login crash total** (`useEffect is not defined`) — import React kurang;
  efek sampingnya React gagal mount sehingga seluruh E2E timeout.
- **Guard siswa tanpa kelas**: `StudentHome` & `StudentOnly` kini redirect ke
  `/login?state=joinClass` bila `class_id` kosong; Login menampilkan form
  Join Class otomatis dari navigation state.
- **Modal Buat Kelas kosong**: `ConfirmationModal` tidak merender `children`
  (input nama kelas tak tampak). Kini mendukung `children`.
- **Teks mentah `teacher.createClassDesc`** di modal guru — key i18n hilang,
  ditambahkan di id/en.json.
- Ghost card drag & drop kini mengikuti kursor (`ghostPosition` state →
  `DragGhostPortal position`).
- Test kick-siswa: filter kotak Cari (pagination 5/halaman menyembunyikan Siti)
  + idempoten re-join via API; `CLASS_NAME` dikoreksi ke `'XI-A'` (kelas seed
  berisi siswa; XI-B kosong).

## [1.18.0] — 2026-08-23

### Diubah
- **Responsif halaman Evaluasi**: seluruh ukuran kini memakai tier breakpoint
  ala Eksplorasi — `lg:` mengecil (sweet spot zoom 125%, viewport ~1152px),
  `xl:` normal, `2xl:` membesar (zoom 75%, viewport ~1920px). Cakupan:
  - Header: judul, subtitle "Soal n dari 5", tombol Ulangi/Keluar + ikon,
    bilah progres (`h-1.5`↔`h-2.5`)
  - Form soal: padding kartu, teks soal, opsi + lingkaran huruf A–E
    (`h-5`↔`h-7`), tombol Kembali/Selanjutnya/Kirim Jawaban
  - Layar hasil & review: piala, "Nilai kamu", skor (`text-4xl`↔`text-6xl`),
    bilah skor, kotak ringkasan capaian, kartu "Jawaban kamu",
    Coba lagi/Beranda

### Ditambahkan
- Script npm lokal `wireframes` (render wireframe PNG+PDF via Playwright) dan
  `figma` (build HTML self-contained untuk impor html.to.design ke Figma).
  Bersifat tooling lokal — folder `tools/`, `wireframes/`, dan `TECH_STACK.md`
  sengaja di-gitignore dan tidak masuk repo (lihat `PLAN.md` §17).

## [1.17.0] — 2026-08-20

### Diubah
- **Typewriter math rendering**: tambah `math-text` class ke inner span di
  `Typewriter.jsx` — semua `<i>` di dialogue text sekarang pakai KaTeX Math
  Italic (LaTeX-style) bukan sekedar CSS italic.
- **MathText sanitizer fix**: support closing `</span>` tags — sebelumnya
  close tag di-strip, memecah fraction rendering.
- **About page**: hapus sequential gating — semua 3 section (Outcomes,
  Objectives, Indicators) bisa diakses langsung tanpa urutan. Hapus lock
  icon, opacity-70, dan non-clickable div.
- **Fraction notation**: opsi `g(x) = 80.000/x` di quiz-retribution kini
  render sebagai fraction dengan garis horizontal (numerator/denominator).
- **Exploration math formatting** (lanjutan v1.16.0):
  - `peeling-function.formulaNote`: `<i>x</i>` italic
  - `washing-function.formulaNote`: `<i>x</i>` italic
  - `composition-explanation.text`: `<i>f</i>`, `<i>g</i>` italic
  - `quiz-discount.text`: `<i>x</i>` italic
  - `dialogue-experiment-result.text`: subscript position fix
  - `dragResult`: koma → titik (`Rp1.000.000`)
- **Experiment result table**: tambah label "Your answer" di combo cell
  (kiri) untuk baris jawaban siswa.

### Test
- Playwright E2E tests (22 tests): 14 passed, 8 failed (selector issues).
  Test coverage: error handling, student journey, teacher dashboard,
  persistence, class management.

## [1.16.0] — 2026-08-20

### Ditambahkan
- **Per-class progress**: semua tabel data (`answers`, `exploration_attempts`,
  `evaluation_attempts`) kini punya kolom `class_id`. Progress siswa terisolasi
  per kelas — join kelas baru mulai fresh, rejoin kelas lama data tetap ada.
  UNIQUE constraint `answers` diubah ke `(user_id, step_id, class_id)`.
- **Join class di halaman login**: siswa tanpa kelas (`class_id = NULL`) akan
  melihat form kode kelas langsung di halaman login (tanpa redirect ke halaman
  terpisah). Flow: login → cek class_id → jika null tampilkan form kode kelas.
- **Hapus kelas** (`DELETE /api/teacher/classes/:id`): tombol trash icon di
  header dashboard guru dengan modal konfirmasi + warning jumlah siswa terdampak.
  Siswa jadi classless (`class_id = NULL`), data tetap tersimpan.
- **Kick siswa dari kelas** (`DELETE /api/teacher/classes/:classId/students/:studentId`):
  guru bisa mengeluarkan siswa dari kelas. Data jawaban/attempt siswa tetap
  tersimpan (hanya `class_id = NULL`). Siswa akan dimintai kode kelas baru saat
  login berikutnya.
- **MathText component** (`MathText.jsx`): komponen baru untuk render HTML
  matematika dengan allowlist tag (`<i>`, `<b>`, `<sup>`, `<sub>`, `<span>`).
  Digunakan di semua tempat yang menampilkan teks matematika.
- **Typewriter word-by-word**: `Typewriter.jsx` kini mendukung HTML — jika teks
  mengandung tag HTML, reveal per kata (bukan per huruf) dengan tracking tags.
  Plain text tetap character-by-character.
- **Font KaTeX Math Italic**: self-hosted `KaTeX_Math-Italic.woff2` (16KB) untuk
  tampilan matematika bergaya LaTeX dengan lengkungan khas di ujung karakter.
- **Responsive `2xl:` breakpoint**: semua komponen visual (`StageDiagram`,
  `SpeakerCharacter`, `Formula`, `Exploration`, `Navbar`) kini punya tier
  `2xl:` (1536px) untuk kompensasi 75% zoom.
- **`TrashIcon`** di `icons.jsx` untuk tombol hapus/kick.
- **`updateUser()`** di `AuthContext` untuk update user object (class_id) setelah join kelas.
- **Endpoint baru**:
  - `POST /api/auth/join-class` — update class_id siswa
  - `DELETE /api/teacher/classes/:id` — hapus kelas
  - `DELETE /api/teacher/classes/:classId/students/:studentId` — kick siswa

### Diubah
- **Disable shuffle kuis**: opsi kuis di exploration (`quiz-discount`,
  `quiz-retribution`) dan evaluation tidak lagi diacak — selalu tampil urutan
  asli. Hapus fungsi `shuffledIndexes()`, `order`/`orders` state, dan
  persistensi shuffle di localStorage.
- **Format matematika profesional**: semua teks matematika di i18n (`en.json`,
  `id.json`), `story.js`, `drag.js` kini pakai tag HTML (`<i>`, `<sub>`)
  dengan tanda kurung fungsi italic (mis. `<i>f(x)</i>` bukan `<i>f</i>(<i>x</i>)`).
  Semua komponen rendering (`Exploration`, `Evaluation`, `TeacherDashboard`,
  `StageDiagram`, `Formula`, `ExplainModal`) kini pakai `MathText`.
- **Kick endpoint disederhanakan**: `DELETE /classes/:classId/students/:studentId`
  hanya `UPDATE users SET class_id = NULL` (tidak hapus data lagi).
- **Status siswa di dashboard guru**: dihitung dari data per-kelas (attempt count),
  bukan dari flag global `exploration_done`.
- **`fetchStudents()`**: `explorationDone` dihitung dari `open_done > 0`
  (attempt eksplorasi di kelas ini), bukan dari `users.exploration_done`.
- **Backend migration**: `migrateDb()` diekstrak dari `initDb()` dan selalu jalan
  saat server start (idempotent), memperbaiki Internal Server Error di Vercel
  yang disebabkan oleh kolom `class_id` yang belum di-migrate.

### Dihapus
- **`about_done`** dari tabel `users` dan semua referensi (endpoint
  `POST /api/progress/about-done`, state client).
- **`exploration_done` global** dari endpoint submit — computation sekarang
  per-kelas di `GET /api/progress/me`.
- **`JoinClass.jsx`** (halaman terpisah) — digabung ke halaman login.
- **`RequireClass` guard** di `App.jsx` — tidak diperlukan lagi.
- **Google Fonts import** `STIX Two Math` — diganti self-host KaTeX.

### File terpengaruh
- `server/db.js`: schema (class_id, UNIQUE constraint, index, migrateDb)
- `server/routes/answers.js`: tag class_id, filter per-kelas, hapus about_done
- `server/routes/classes.js`: hapus kelas, kick siswa, filter per-kelas
- `server/routes/auth.js`: endpoint join-class
- `client/src/pages/Login.jsx`: form kode kelas inline
- `client/src/pages/TeacherDashboard.jsx`: delete/kick button + modal
- `client/src/pages/Evaluation.jsx`: non-shuffle + MathText
- `client/src/pages/Exploration.jsx`: MathText di semua rendering
- `client/src/pages/About.jsx`: hapus aboutDone
- `client/src/components/Typewriter.jsx`: word-by-word HTML support
- `client/src/components/MathText.jsx`: komponen baru
- `client/src/components/StageDiagram.jsx`: 2xl breakpoint + MathText
- `client/src/components/SpeakerCharacter.jsx`: 2xl breakpoint
- `client/src/components/Formula.jsx`: MathText + 2xl breakpoint
- `client/src/components/ExplainModal.jsx`: MathText
- `client/src/components/icons.jsx`: TrashIcon
- `client/src/data/story.js`: HTML tags di formula + options
- `client/src/data/drag.js`: HTML subscripts + italic
- `client/src/i18n/en.json`: ~60 keys diupdate
- `client/src/i18n/id.json`: ~60 keys diupdate
- `client/src/index.css`: KaTeX @font-face + 2xl rule
- `client/src/context/AuthContext.jsx`: updateUser
- `client/src/App.jsx`: hapus JoinClass/RequireClass

## [1.15.0] — 2026-08-19

### Diubah
- **Responsive zoom & multi-breakpoint layout** (`StageDiagram.jsx`,
  `SpeakerCharacter.jsx`, `Formula.jsx`, `Exploration.jsx`): semua komponen
  visual kini pakai 4–5 tier responsive (`sm:`/`md:`/`lg:`/`xl:`) dengan sizing
  progresif. `lg:` (1024px) = sweet spot untuk 125% zoom di layar 1440px (assets
  mengecil), `xl:` (1280px) = native resolution (assets membesar kembali).
  Pendekatan ini menggantikan percobaan `clamp()` + `vw` yang gagal karena
  ukuran menjadi tidak terkendali di semua ukuran layar.
  - `StageDiagram`: arrow SVG (`h-6 w-12 → h-12 w-24`), cassava/machine node
    (`h-12 → h-20` normal, `h-14 → h-24` big), MoneyCard (`h-8 w-8 → h-14 w-14`),
    MachineShowcase (`h-12 → h-24` + glow), label fonts, gaps — semua 5 tier.
  - `SpeakerCharacter`: `h-32 w-20` (mobile) → `h-64 w-40` (xl), 5 tier.
  - `Formula`: text `text-base → text-2xl`, padding `px-3 → px-5`, gap
    `gap-1 → gap-2` — 4 tier.
  - `Exploration.jsx`: header (title, subtitle, badge, buttons, progress bar),
    dialogue card, Typewriter text, name tag, speaker offsets, OpenStepInput,
    DialogueActions, QuizOptions — semua 4 tier (`base`→`md`→`lg`→`xl`).

### Ditambahkan
- **`style` prop di `AssetImage.jsx`**: komponen kini menerima dan meneruskan
  `style` ke `<img>`, memungkinkan inline responsive sizing dari parent jika
  diperlukan.

### Diperbaiki
- **Teacher Dashboard mobile sidebar** (`TeacherDashboard.jsx`, `icons.jsx`):
  sidebar guru di mobile (<lg) sebelumnya mengambil full width sebagai kolom
  di atas konten utama. Kini sidebar tersembunyi di mobile; hamburger button
  (☰) muncul di header konten utama — klik untuk slide-in sidebar overlay
  + backdrop gelap. Ikon `MenuIcon` + `CloseIcon` ditambahkan ke `icons.jsx`.

## [1.14.0] — 2026-08-18

### Diubah
- **Konten About diperbarui** (EN & ID): Tujuan Pembelajaran dari 1 → 2 item,
  Indikator Pembelajaran dari 4 → 5 item dengan nomor 1.1–1.3, 2.1–2.2.
  Badge indikator dihapus (teks langsung tanpa ikon).
- **Soal Evaluasi diganti total** (5 soal baru berbasis Mesin Iris & Mesin
  Pengering Pak Restu): `S(x)=0.92x`, `D(x)=x−0.6`, `(D∘S)(x)`,
  `(S∘D)(x)`, komutativitas. Font soal dikecilkan ke `font-medium`.
  Seed data (`GITHA_EVAL`, `BUDI_EVAL_1`) diupdate dengan jawaban +
  `answerIndex` baru.
- **Panel guru — jawaban evaluasi fleksibel bahasa**: kolom baru
  `answer_index INTEGER` di `evaluation_attempt_answers`; client mengirim
  `answerIndex` (indeks asli sebelum shuffle) saat submit; panel guru
  resolve jawaban via `t(`quiz.${stepId}.options`)[answerIndex]` sesuai
  bahasa guru, bukan bahasa murid.

### Diperbaiki
- **Essay kosong terdeteksi & dihapus**: `backfillEmptyEssays()` diperluas —
  menghapus attempt jika COUNT < 7 essay ATAU ada jawaban kosong/whitespace/
  `(jawaban kosong)` (sebelumnya hanya cek COUNT, melewatkan 7 baris kosong).
- **Penomoran ulang attempt**: `renumberAttempts()` menjalankan sequential
  `attempt_no` per user untuk `exploration_attempts` + `evaluation_attempts`
  setelah cleanup — tidak ada lubang nomor.
- **`saveEssay()` guard** (`Exploration.jsx`): mencegah simpan teks
  kosong/whitespace — `prev` dikembalikan tanpa set `saved: true`.

### Dihapus
- `backfillOldEvalAnswers()` dari `initDb()` — fungsi terlalu agresif
  (menghapus seluruh attempt jika ada jawaban cocok pola lama);
  sudah dijalankan sekali sebelumnya (data lama tidak bisa dikembalikan).

## [1.13.0] — 2026-08-15

### Optimasi performa (Vercel serverless)
- **`initDb()` tidak lagi jalan di setiap cold-start** (`server/db.js`): schema +
  seed + backfill hanya auto-jalan di local dev (`DATABASE_URL` mengandung
  `localhost`/`127.0.0.1`) atau saat env `INIT_DB=1`. Di Vercel, inisialisasi
  dilakukan manual sekali lewat script baru `npm run init-db`
  (`server/init-db.js`). Login & dashboard guru yang tadinya membayar penalty
  ~2–5 detik per cold boot kini langsung merespons.
- **`requireAuth` tanpa query DB** (`server/middleware/auth.js`): identitas
  `req.user = { id, role }` diambil langsung dari payload JWT yang sudah
  diverifikasi — menghapus 1 query `SELECT ... FROM users` di setiap request
  terautentikasi.
- **Endpoint guru digabung** (`server/routes/classes.js`): endpoint baru
  `GET /api/teacher/classes/:id/summary` mengembalikan `{ class, students,
  essays, evaluations }` sekaligus. `TeacherDashboard.jsx` kini memakai
  2 request (list kelas → summary) alih-alih 4 (list + 3 detail paralel).
- **Index PostgreSQL baru** di SCHEMA: `idx_classes_teacher`, `idx_users_class`,
  `idx_exploration_attempts_user`, `idx_evaluation_attempts_user`,
  `idx_attempt_answers_attempt`, `idx_eval_answers_attempt` (aktif setelah
  `npm run init-db`).
- **Region function Vercel `sin1`** (Singapura) — dekat Neon `ap-southeast-1`
  dan pengguna Indonesia (sebelumnya default `iad1`, AS) → latency turun drastis
  (health check ~108 ms dari Indonesia).
- **Header `Cache-Control`** di `vercel.json`: `/assets/*` immutable 1 tahun,
  `/api/*` private no-store, `/` & `/index.html` no-cache.

## [1.12.0] — 2026-08-12

### Diperbaiki
- **Konten Exploration terpotong tanpa bisa discroll** pada layar pendek
  (mis. Asus ExpertBook): root `overflow-hidden` → `overflow-y-auto` (fallback
  scroll), center stage `overflow-hidden` → `overflow-auto` — diagram/flow yang
  tidak muat tetap bisa discroll alih-alih dipotong diam-diam. Layout lain tetap
  persis seperti sebelumnya (breakpoint-based), pengguna cukup memakai zoom
  browser jika ingin mengecilkan/membesarkan tampilan.
- **Popup step 23 bertuliskan "exit.cancel"** (`Exploration.jsx:498` memakai
  key yang belum ada di i18n): key `exit.cancel` ditambahkan ke `en.json`
  ("Cancel") dan `id.json` ("Batal") — struktur key EN/ID tetap identik.

### Diubah
- **Trik fluid scaling (`--fluid-scale` + `clamp()` berbasis vw/vh) dihapus**
  karena tidak stabil terhadap zoom browser (ukuran elemen berubah tidak
  terkendali saat zoom diubah dan tidak bisa dikembalikan). Semua komponen —
  `SpeakerCharacter`, `StageDiagram` (panah/node/kartu/showcase), `Exploration`
  (header, name tag, kartu dialog, textarea, tombol), `Home`, `About`,
  `Evaluation`, `Navbar` — dikembalikan ke sizing breakpoint-based semula.
  Yang dipertahankan hanyalah fix `overflow-y-auto`/`overflow-auto` di atas.

### Optimasi performa
- **Semua gambar dikonversi ke WebP** (kualitas 85–95%, fallback PNG tetap
  ada, **resolusi tidak berubah**): total aset gambar ~8 MB → ~1,5 MB
  (login-bg 4,16 MB → 301 KB, karakter ~1 MB → ~120–150 KB, dst). `AssetImage`
  kini memilih AVIF → WebP → PNG via elemen `<picture>` + `loading="lazy"` +
  `decoding="async"`.
- **Code splitting** (`vite.config.js`): bundle tunggal 369 KB dipecah menjadi
  `vendor-react` (React core), `vendor`, `exploration`, `teacher`,
  `evaluation`, dan `index` (inti ~19 KB) — initial load lebih cepat dan
  caching per-chunk lebih baik.
- **Audio backsound dirampingkan**: `background.mp3` (2,37 MB) dikonversi ke
  **WebM/Opus 48k mono** (`background.webm`, ~1,06 MB, −54%); MP3 asli dipindah
  ke `raw/` agar tidak di-bundle. `AudioContext` kini memuat musik **lazy**
  (`preload="none"` + glob menyertakan `.opus/.webm/.m4a/.aac`) — backsound
  baru diunduh saat murid berinteraksi pertama kali, bukan saat halaman dibuka.
  Skrip `scripts/optimize-audio.js` (ffmpeg-static) untuk konversi ulang.
- **PNG asli dipindah ke `assets/raw/`**: semua gambar kini disajikan sebagai
  WebP saja (folder `raw/` menyimpan file resolusi penuh untuk diedit ulang,
  tidak ikut di-bundle). `dist` total turun dari ~10 MB → ~2,2 MB.

## [1.11.3] — 2026-08-11

### Diubah
- **Backfill jawaban drag & drop untuk attempt lama** (`server/db.js`): attempt
  eksplorasi yang dibuat sebelum fitur drag ada (`drag_answer` kosong) kini
  diisi otomatis oleh `backfillDragAnswers()` yang dipanggil `initDb()` tiap
  cold-start (idempotent). Nilai diambil acak dari 8 kombinasi valid dengan
  `result = (slot2∘slot1)(1.000.000)` — sehingga dashboard guru tidak lagi
  menampilkan "Belum dijawab" untuk attempt yang sebenarnya sudah menyelesaikan
  eksplorasi (invariant: ada attempt ⇒ ada jawaban drag).
- **Drag WAJIB saat Submit Final Answer** (`server/routes/answers.js`):
  `POST /api/exploration/submit` kini menolak (400) bila body `drag` tidak ada
  atau `slot1`/`slot2` tidak valid — menjamin invariant di atas untuk semua
  submission berikutnya (client selalu mengirim, jadi tanpa regresi UX).

## [1.11.2] — 2026-08-11

### Diubah
- **Semua akses murid dibuka tanpa pengunci** (`client/src/App.jsx`,
  `client/src/pages/Home.jsx`): route `/about`, `/exploration`, `/evaluation`
  kini sama-sama `RequireAuth` + `StudentOnly` — `RequireUnlocked` dan flag
  gating dihapus dari `App.jsx`; kartu Home tidak lagi terkunci (`flag: null`)
  sehingga logika `locked`, `LockIcon`, dan branch render terkunci dibuang dari
  `Home.jsx` (key i18n `home.locked` tetap dipertahankan karena masih dipakai
  gembok sekuensial kartu di dalam halaman About).
- **Status guru diperbarui** (`client/src/pages/TeacherDashboard.jsx`): status
  siswa dihitung client-side: **New** (belum ada eksplorasi/evaluasi),
  **Ongoing** (salah satu selesai), **Finished** (keduanya selesai). Label
  i18n `teacher.statusExplored` → `teacher.statusOngoing` (EN "Ongoing",
  ID "Berjalan") dan penghitung status terkait.

## [1.11.1] — 2026-08-11

### Diperbaiki
- **Evaluasi tidak menampilkan sukses palsu saat submit gagal**
  (`client/src/pages/Evaluation.jsx`): sebelumnya layar hasil selalu muncul
  meski `POST /api/evaluation/submit` gagal (jaringan/token/500) — attempt
  tidak tercatat server tapi murid mengira sudah selesai. Kini `setSubmitted`
  + penghapusan `cv_eval_` hanya berjalan saat server menjawab sukses; saat
  gagal muncul banner error (`errors.network`/`errors.generic`) dan jawaban
  tetap tersimpan.
- **Sesi kedaluwarsa kini ditangani** (`client/src/context/api.js`,
  `client/src/context/AuthContext.jsx`): `api()` memanggil handler
  `setOnUnauthorized` saat menerima `401` untuk request ber-token; `AuthProvider`
  mendaftarkan handler yang melepas sesi (logout) sehingga `RequireAuth`
  mengarahkan kembali ke `/login`. Sebelumnya token `7d` yang kedaluwarsa membuat
  semua panggilan gagal diam-diam tanpa jalan keluar.
- **`ProgressContext.loading` tidak nyangkut selamanya**
  (`client/src/context/ProgressContext.jsx`): `loading` kini = `!hasLoaded`
  (di-set di `finally` refresh), bukan `!progress`, sehingga kegagalan
  jaringan/401 tidak membuat Home/kartu terkunci tanpa henti.
- **Feedback error pada Submit Final Answer** (`client/src/pages/Exploration.jsx`):
  banner merah muncul di ReviewPage bila `POST /api/exploration/submit` gagal
  (sebelumnya gagal hanya "ditelan" tanpa keterangan).

### Ditambahkan
- **Home khusus murid, guru langsung ke dashboard** (`client/src/App.jsx`):
  route `/` memakai `StudentHome` yang mengalihkan guru ke `/teacher`
  (sebelumnya guru sempat melihat Home); route `/teacher` memakai `TeacherOnly`
  yang mengalihkan siswa ke `/`. Login & Navbar brand sudah role-aware, jadi
  guru tidak pernah mendarat di Home.
- **Tombol Ulangi di Evaluasi** (`client/src/pages/Evaluation.jsx`): muncul di
  header saat ada jawaban terisi dan belum disubmit — mengosongkan jawaban,
  mengacak ulang opsi, menghapus `cv_eval_`. Key i18n baru:
  `evaluation.restart`, `evaluation.restartTitle`, `evaluation.restartMessage`,
  `evaluation.restartConfirm`.
- **`..env.example`** (root): template `DATABASE_URL`/`JWT_SECRET` untuk dev
  lokal (`.env` tetap di-`.gitignore`).

### Diubah
- **Server menghitung ulang hasil drag** (`server/routes/answers.js`):
  `drag.result` tidak lagi dipercaya dari client — dihitung ulang dari
  `slot1`/`slot2` (`f1:x−60.000, f2:0,95x, g1:x−40.000, g2:0,9x` untuk
  `x=1.000.000`).
- **AGENTS.md**: perintah server dev/start memakai `--env-file=../.env`;
  catatan `.env` root wajib (contoh di `.env.example`).

## [1.11.0] — 2026-08-11

### Ditambahkan
- **Resume kuis evaluasi**: pilihan jawaban murid di `/evaluation` kini
  dipersistenkan per soal ke `localStorage cv_eval_{userId}` sebagai
  `{ orders, answers }` setiap kali memilih — urutan opsi acak (`orders`) ikut
  disimpan agar indeks pilihan tetap konsisten antar sesi. Keluar di tengah
  (mis. baru menjawab soal 1–4) → saat kembali ke halaman, opsi yang sudah
  dipilih otomatis terpilih lagi dan langsung lompat ke soal pertama yang belum
  terjawab. Storage dibersihkan saat **Kirim Jawaban** sukses dan saat
  **Coba lagi** (`client/src/pages/Evaluation.jsx`).

### Dibersihkan (kode usang & penyederhanaan)
- **Hapus komponen & kode mati**: `MoneyFlowPanel.jsx` (sudah digantikan
  `MoneyFlowDiagram`), ikon `LeafIcon` (`icons.jsx`), export `BrandMark`/
  `AppLogo` + prop `children` di `Navbar.jsx`, branch `connected` di
  `LetterTitle.jsx`, prop `explain` (tak terpakai) di `QuizFeedbackModal.jsx`,
  helper `storeKey`/`isOpen` di `About.jsx`, dan `isTeacher` (tak terpakai) di
  `ProgressContext.jsx`.
- **Prop `size` dihapus** di `Avatar.jsx` dan `Formula.jsx` (pemakaian selalu
  ukuran default; panggilan di Navbar/Exploration ikut disederhanakan); panah
  "→" pada tombol Lanjut/Kembali dihapus (`Exploration.jsx`, `ExplainModal.jsx`,
  `TeacherDashboard.jsx`); tombol hint essay (`exploration.hint` +
  `story.*.hint`) dihapus dari `OpenStepInput`/`ReviewPage`.
- **Hapus 31 key i18n tak terpakai** dari `en.json`/`id.json`: `app.*`,
  `nav.exploration/evaluation`, `login.subtitle/heroTitle/heroText`,
  `home.comingSoon`, `about.ready/next`, `exploration.hint/mustSave/saveAnswers/
  tryAgain/goEvaluation/dragRemove`, `evaluation.finish/feedbackCorrect/
  feedbackWrong/doneTitle/allSaved`, `teacher.answers/correct/score/joined/
  logout/avgScore/notStarted/completed/statusOngoing/essayAnswers`,
  `money.process`. Set key EN/ID tetap identik (103 key).
- **Server — hapus endpoint tak terpakai**: `GET /api/auth/me` (client tidak
  pernah memanggilnya), `POST /api/progress/exploration-done`, dan
  `DELETE /api/teacher/classes/:id` (client tidak memanggil; kelas tidak bisa
  dihapus via UI).
- **Dedup data drag & drop**: file baru `client/src/data/drag.js` memusatkan
  `DRAG_CARDS`, `DRAG_X`, `DRAG_BEST`, `DRAG_SUB`, `EXPERIMENT_ROWS`,
  `formatRupiah`; `Exploration.jsx` dan `TeacherDashboard.jsx` memakai
  konstanta bersama (sebelumnya `DRAG_LABELS`, `formatRupiah`, `EXPERIMENT_ROWS`
  diduplikasi). `TeacherDashboard.jsx` juga kini memakai `OPEN_STEPS`
  (`data/story.js`) sebagai sumber kebenaran step essay.
- Docs: `AGENTS.md` (daftar komponen, tabel endpoint, bagian "Perubahan masa
  depan") dan `PLAN.md` (§7 evaluasi persist ditandai selesai).

## [1.10.0] — 2026-08-10

### Ditambahkan
- **Eksperimen drag & drop (step 23–24 eksplorasi)**: `quiz-drag-experiment`
  (`type: 'drag-quiz'`) dan `dialogue-experiment-result`
  (`type: 'experiment-table'`) menutup alur eksplorasi (22 → 24 step).
  - `DragExperimentQuiz`: 4 kartu fungsi (retribusi `f₁(x)=x−60.000` /
    `f₂(x)=0,95x`, diskon `g₁(x)=x−40.000` / `g₂(x)=0,9x`), 2 slot
    (Langkah 1 → Langkah 2), drag via Pointer Events + ghost card
    (`createPortal`), tap tanpa drag diabaikan, validasi **satu retribusi +
    satu diskon** (`dragInvalidCombo`), tombol **Simpan jawaban** dengan modal
    konfirmasi (`dragConfirm*`) — jawaban tak bisa diubah setelah tersimpan
    (`dragSaved`). Hasil dihitung untuk `x = Rp1.000.000`, disimpan ke
    `localStorage cv_drag_answer_{userId}`.
  - `ExperimentResultTable`: kartu kiri feedback level
    `dragFeedbackLow/Mid/Best` + combo siswa; kanan tabel 8 kombinasi
    (`EXPERIMENT_ROWS`) dengan baris terbaik `(f₂∘g₁)(x)=Rp912.000` (hijau +
    🏆) dan baris milik siswa (amber). Tombol **Lanjut ke Verifikasi**
    (`exploration.nextReview`) → `advance()` menuju ReviewPage.
- **Jawaban drag dikirim & dilihat guru**: `POST /api/exploration/submit`
  menerima `{ answers, drag }`; server menyimpan JSON di kolom
  `exploration_attempts.drag_answer`; `GET /api/teacher/classes/:id/essay-answers`
  mengembalikannya; panel Eksplorasi guru menampilkan combo kartu + hasil rupiah
  + badge 🏆 saat `result === 912000`.
- **Evaluasi dibuka kembali + riwayat per attempt**: route `/evaluation` aktif
  kembali (`RequireAuth` + `StudentOnly`), kartu Evaluasi di Home tidak lagi
  terkunci (`flag: null`), `/api/progress/me` mengembalikan
  `evaluationUnlocked: true`. Tabel baru `evaluation_attempts` +
  `evaluation_attempt_answers`; endpoint baru `POST /api/evaluation/submit`
  (validasi 5 soal, upsert ke `answers`, buat attempt `attempt_no = MAX+1`).
- **Teacher Dashboard — tab Evaluasi**: modal jawaban siswa kini punya 2 tab
  (**Eksplorasi** / **Evaluasi**, `teacher.evalTab`); tab Evaluasi menampilkan
  pill **Evaluasi {n}** per attempt + waktu submit, kartu skor hijau
  (`teacher.evalScore`), dan 5 kartu per soal (`teacher.evalN`: teks soal,
  jawaban siswa benar/salah + kunci jawaban).
- Endpoint guru baru `GET /api/teacher/classes/:id/evaluation-answers` →
  `students[].attempts[] = { attemptNo, submittedAt, answers, correctCount }`.
- Seed: jawaban drag untuk Githa (best) & Budi (mid, best); evaluasi Githa 1
  attempt (5/5 benar), Budi 2 attempt (3/5 lalu 5/5), Siti belum mengirim.
- i18n baru (`en.json`/`id.json`): `exploration.drag*`, `exploration.experiment*`,
  `exploration.nextReview`, `evaluation.back/allAnswered`,
  `teacher.evalTab/evalScore/evalN/evalAttempt/evalNoAttempts/explorationAnswers/dragAnswer`.

### Diubah
- **Soal evaluasi 7 → 5** (semua berbasis materi Desa Singkong, 5 opsi):
  `client/src/data/evaluation.js` dan `server/constants.js` `EVAL_STEP_IDS`
  kini `eval-1`..`eval-5`; isi soal/opsi/pembahasan ditulis ulang di i18n.
- **Layout halaman Evaluasi**: lebar `max-w-6xl`; header ala eksplorasi (judul +
  subtitle "Soal {current} dari {total}" kiri, tombol **Keluar** kanan, progress
  bar `h-2` di bawah) dan **disembunyikan di layar hasil**; tombol **Kembali** di
  kiri bawah footer sejajar **Selanjutnya**/**Kirim Jawaban**; submit tunggal
  `POST /api/evaluation/submit` tanpa loop; **sound effect
  `playCorrect`/`playWrong` dihapus** dari submit.
- **Panah dihapus dari semua tombol navigasi** (Evaluasi & Eksplorasi):
  `exploration.continue`, `exploration.back`, `exploration.nextReview`,
  `exploration.skipTyping`, `evaluation.back`/`next` (label tanpa "→").
- **Tombol hint essay dihapus** dari `OpenStepInput` & `ReviewPage`; key `hint`
  dihapus dari i18n `story.open-*` (dan `exploration.hint` tak lagi dipakai).
- **Exploration**: tombol **Lanjut** essay kini berdampingan dengan Simpan/Edit
  di baris aksi yang sama (bukan `ml-auto` terpisah).
- `TeacherDashboard`: status "Selesai" = `explorationDone && evalCount >= 1`
  (jumlah attempt evaluasi, bukan 7 jawaban); kolom tabel menjadi **Jml
  Evaluasi** (`s.evalCount`); kartu statistik `countExplored`/`countDone`
  mengikuti logika baru.

### Verifikasi
- `node --check` lolos untuk `server/db.js`, `server/routes/answers.js`,
  `server/routes/classes.js`.
- `npm run build` di `client`: sukses (130 modul, 0 error).
- Sinkronisasi key i18n EN ↔ ID diverifikasi.

## [1.9.0] — 2026-08-06

### Ditambahkan
- **Migrasi backend SQLite → PostgreSQL**: `server/db.js` ditulis ulang
  menggunakan `pg` (Pool) menggantikan `node:sqlite` (`DatabaseSync`).
  Semua 54 pemakaian `db.prepare` di 5 file server kini async (dibungkus
  `asyncHandler` di middleware). SQL placeholder `?` → `$n` (konversi
  otomatis di `db.prepare`). `datetime('now')` → `now()`.
  `AUTOINCREMENT` → `SERIAL`. Skema final (tanpa `PRAGMA`, `hasColumn`,
  atau `migrateEssayAttempts` — DB fresh). Seed idempotent (`ON CONFLICT
  DO NOTHING` + `GREATEST` untuk update). `server/app.js` (baru) = app
  Express yang diekspor; `server/index.js` = listener dev. `api/index.js`
  (baru) = entry Vercel serverless function; `vercel.json` (baru) =
  konfigurasi build + rewrites. `api/package.json` (`"type": "module"`)
  agar fungsi Vercel berjalan sebagai ESM. `server/package.json` menambah
  dependensi `pg`. Root `package.json` menambahkan deps server runtime
  (`express`, `cors`, `pg`, `bcryptjs`, `jsonwebtoken`) agar Vercel bisa
  resolve di `api/` function.
- **`.vercel/`** ditambahkan ke `.gitignore` (folder proyek Vercel CLI,
  berisi org/project id — tidak boleh di-commit).
- **`.gitignore` diperbaiki**: `work!.pdf`, `AGENTS.md`, `PLAN.md`,
  `CHANGELOG.md`, dan seluruh folder `design/` dilepas dari git index
  (`git rm --cached`) karena sudah pernah di-track sebelum aturan ignore
  ditulis.

### Diubah
- **Server wajib `DATABASE_URL`**: tanpa env tersebut server error jelas
  saat start. `JWT_SECRET` opsional (fallback dev tersedia untuk uji
  lokal).
- **Connection pooling**: `pg.Pool` dengan `max: 5` (serverless-friendly).
  Neon pooled connection string (`-pooler`) direkomendasikan untuk
  deployment Vercel.
- **`server/db.js`**: `pool` (pg.Pool) diekspor; `db.prepare(sql)`
  mengembalikan `{ get, all, run }` async; `db.exec(sql)` untuk DDL
  multi-statement. `initDb()` async (schema + seed), dipanggil via
  top-level await.
- **`server/middleware/auth.js`**: `requireAuth` kini async (dibungkus
  `asyncHandler`); `asyncHandler` helper baru ditambahkan.
- **`server/routes/auth.js`, `answers.js`, `classes.js`**: semua handler
  async + `await` atas `db.prepare(...)` calls. `INSERT` statements
  ditambahkan `RETURNING id` untuk menggantikan `lastInsertRowid`.
- **`server/index.js`** dipisah menjadi `server/app.js` (app Express) +
  `server/index.js` (listener `app.listen`).
- **Deployment**: `vercel.json` mengatur build (`npm run build`, output
  `client/dist`) + rewrites `/api/*` → `api/index.js` + SPA fallback
  `/(.*)` → `/index.html`.

### Verifikasi
- `npm run build` di `client`: sukses (128 modul, 0 error).
- Server berjalan di Neon PostgreSQL 18.4 (pooled): schema dibuat, seed
  idempotent (Githa 1 attempt, Budi 2 attempt, Siti 0).
- API diuji manual: health, login guru/siswa, classes, students
  (explorationCount/evalDone), essay-answers (format `submitted_at` via
  `to_char`), progress/me, quiz answer, exploration submit, signup guru
  (201), signup siswa tanpa kode kelas (400), signup siswa dengan kode
  kelas (201), idempotency restart (tidak ada duplikat).

### Ditambahkan
- **Registrasi guru**: form registrasi kini punya pilihan peran **Murid/Guru**
  (segmented control di `Login.jsx`). Guru tidak butuh kode kelas;
  `POST /api/auth/signup` menerima `role` (`student`|`teacher`, default student),
  siswa tetap wajib kode kelas. Akun guru diarahkan langsung ke `/teacher`.
- **Login: tombol lihat password** (ikon mata) di field kata sandi
  (`login.showPassword`/`login.hidePassword`).
- **Teacher Dashboard — tabel siswa baru**: kolom `#`, Nama, Email, **Jml
  Eksplorasi** (jumlah attempt essay), **Jml Evaluasi** (jumlah jawaban evaluasi),
  **Status**, dan tombol **Lihat Jawaban**. Status 3 state: **Baru** (belum
  selesai eksplorasi), **Selesai eksplorasi** (explorasi selesai, evaluasi
  belum), **Selesai** (keduanya selesai).
- **Pencarian siswa** (nama/email, case-insensitive) di toolbar dashboard.
- **Pagination** tabel siswa: default 5, opsi 5/10/15 per halaman, info
  "Menampilkan {from}–{to} dari {total}" + tombol Sebelumnya/Berikutnya.
- **Popup Jawaban Essay**: tombol "Lihat Jawaban" membuka modal (bukan lagi baris
  expand) berisi panel tab attempt "Eksplorasi {n}".
- **Sidebar dapat dilipat** (`lg+`, state persist di `localStorage
  cv_sidebar_collapsed`): besar = "Cassava Village" besar (ikon brand dihapus),
  kecil = "CV" + konten ikon-saja; tombol toggle Chevron di baris brand. Tombol
  **Keluar** kini berikon `LogOutIcon` (ikon saja saat sidebar kecil).
- Endpoint `GET /api/teacher/classes/:id/students` kini mengembalikan
  `explorationCount` (jumlah attempt) dan `evalDone` (selalu angka, `?? 0`).
- i18n baru: `login.role`, `login.roleStudent`, `login.roleTeacher`,
  `login.teacherInfo`, `login.showPassword`, `login.hidePassword`,
  `teacher.statusExplored`, `teacher.explorationCount`, `teacher.evaluationCount`,
  `teacher.viewAnswers`, `teacher.close`, `teacher.searchPlaceholder`,
  `teacher.noStudentsMatch`, `teacher.showing`, `teacher.prev`, `teacher.next`,
  `teacher.perPage`, `teacher.collapse`, `teacher.expand`.

### Diubah
- **Teacher Dashboard**: kartu statistik atas kini **Total murid / Baru /
  Selesai eksplorasi / Selesai** (kartu Rata-rata nilai & Belum mulai dihapus).
- **Teacher Dashboard**: tombol suara dihapus (fitur tak terpakai); toggle
  **ID/ENG** dipindah ke toolbar atas di samping dropdown kelas. Dropdown pemilih
  kelas diubah dari `<select>` menjadi komponen custom: panah ▼ saat tertutup /
  ▲ saat terbuka (digeser sedikit ke kiri), daftar interaktif dengan tanda
  centang pada kelas terpilih, menutup saat klik di luar.

## [1.7.0] — 2026-08-06

### Ditambahkan
- **Riwayat attempt eksplorasi**: tabel baru `exploration_attempts` (per-user
  per-attempt: `user_id`, `attempt_no`, `submitted_at`) dan `attempt_answers`
  (7 jawaban essay per attempt). Setiap klik **Kirim Jawaban Final** membuat
  attempt baru — jawaban essay attempt lama tidak lagi tertimpa.
- Endpoint baru `POST /api/exploration/submit` (di `server/routes/answers.js`):
  menerima `{ answers: { stepId: teks } }`, memvalidasi **wajib 7 essay
  terisi**, membuat attempt baru (`attempt_no = max + 1`) + 7 jawaban, lalu
  men-set `users.exploration_done = 1`. Menjamin guru selalu melihat tepat 7
  jawaban per attempt.
- Endpoint guru baru `GET /api/teacher/classes/:id/essay-answers`: riwayat
  attempt + 7 jawaban essay per siswa di kelas (nama, email, `explorationDone`).
- **Teacher Dashboard**: baris siswa kini bisa di-expand (klik baris) menampilkan
  panel **Jawaban Essay** dengan tab **"Eksplorasi {n}"** per attempt; tiap tab
  menampilkan 7 essay (label "Essay {n}", jawaban kosong → "Belum dijawab",
  siswa tanpa attempt → "Belum ada pengiriman eksplorasi.").
- Migrasi otomatis `migrateEssayAttempts()` di `server/db.js`: memindahkan baris
  essay lama yang tersimpan di tabel `answers` menjadi attempt 1 (baris lama
  dihapus dari `answers`), agar DB lama tetap kompatibel.
- Seed demo: Githa kini punya 1 attempt essay dengan jawaban lengkap, Budi 2
  attempt (jawaban berbeda) untuk demo tab riwayat; Siti tetap belum mengirim.
- i18n `en.json`/`id.json`: key baru `teacher.essayAnswers`, `teacher.attempt`,
  `teacher.essayN`, `teacher.noAnswer`, `teacher.noAttempts`,
  `teacher.submittedAt`.

### Diubah
- **Essay hanya masuk server saat Submit Final**: `POST /api/answers` kini
  **menolak** `stepId ∈ OPEN_STEP_IDS` (400). Selama eksplorasi essay tetap
  hanya di `localStorage cv_essays_{userId}` (mekanisme Simpan/Edit client-side
  tidak berubah).
- `saveReview` di `Exploration.jsx`: dari loop 7× `POST /api/answers` menjadi
  satu `POST /api/exploration/submit`.
- `GET /api/progress/me`: `openAnswered` dihitung dari total jawaban essay di
  semua attempt; `explorationDone` tetap berbasis `exploration_done`.
- `GET /api/teacher/classes/:id/students`: `open_done` kini berasal dari
  `users.exploration_done` / jumlah attempt (bukan lagi baris essay di `answers`),
  dan respons menambah field `explorationDone`.
- `POST /api/progress/reset-exploration` hanya membersihkan jawaban kuis di
  `answers` — **riwayat attempt tidak dihapus**, jadi replay tidak menghilangkan
  data yang sudah dilihat guru.

### Verifikasi
- `npm run build` di `client`: sukses (128 modul, 0 error).
- API diuji manual: login guru → `essay-answers` menampilkan Githa 1 attempt,
  Budi 2 attempt; submit Siti (partial → 400, lengkap → 201 attempt 1, lagi →
  attempt 2); `POST /api/answers` dengan step essay → 400.
- Sinkronisasi key i18n EN ↔ ID diverifikasi: 0 key berbeda.

## [1.6.0] — 2026-08-05

### Diubah
- **Posisi kartu alur uang terbalik untuk Pak Rafif** (step `rafif-story` &
  `open-fog-money`): `MoneyFlowDiagram` mendapat prop `reverse` — kartu diurutkan
  ulang menjadi `[Pendapatan Kotor][Biaya Retribusi][Diskon]` (alur gross →
  retribusi → diskon) dengan **panah miring biasa** (tanpa panah melengkung di
  atas):
  - Panah pertama gross → retribusi berlabel `f(x) = 0,75x`.
  - Panah kedua retribusi → diskon berlabel `g(x) = x − 80.000`.
- **Banner konteks & jawaban essay sebelumnya dipindah ke atas, rata kiri**
  (step `open-restu-calc` & `open-rafif-calc`): teks `exploration.calcBanner`
  dan pill jawaban essay sebelumnya (komponen `CalcContextBanner`) kini dirender
  **tepat di bawah header Eksplorasi** (di bawah tulisan "Eksplorasi" / progress
  bar), selebar container dan **rata kiri** mengikuti gaya tulisan chat — bukan
  lagi di tengah layar. Bagian bawah hanya berisi chat + kolom essay. Blok
  banner/pill di `OpenStepInput` dihapus.
- **Layout step `open-difference-explanation` & `open-conclusion`** (speaker
  `both`): Pak Restu berdiri di **kiri**, Pak Rafif di **kanan**, kolom dialog +
  essay di **tengah** di antara keduanya. Karakter hanya tampil di layar
  `md+` (tersembunyi di mobile). Branch `speakerId === 'both'` di
  `SpeakerCharacter` dihapus (kembali single-character).
- **Counter "saved question"**: badge baru di header sebelah subtitle
  "Langkah X dari 22" — `Soal Tersimpan {n}/{total}` (contoh "Soal Tersimpan
  4/7"), menghitung essay yang tersimpan (`tempEssays.saved` atau sudah
  terkirim ke server). Key i18n baru `exploration.savedQuestion`.
- **Halaman Review**:
  - Tombol **Replay** dihapus — hanya tersisa **Kembali** dan **Submit Final
    Answer**.
  - Label tombol `saveFinal` diubah: id "Kirim Jawaban Final" / en "Submit
    Final Answer".
  - Saat tombol ditekan, jawaban 7 essay dikirim lalu **kembali ke Home**
    (`navigate('/')`). Banner sukses `savedFinal` dan fungsi `replay()`
    dihapus.
- Key i18n `exploration.replay` & `exploration.savedFinal` dihapus (tak
  terpakai). `useNavigate` dari `react-router` ditambahkan ke `Exploration.jsx`.
- **Home: eksplorasi yang sudah selesai langsung di-reset** — jika
  `progress.explorationDone` true, klik kartu Exploration di Home langsung
  memanggil `startOver()` (POST `reset-exploration` + hapus `cv_step_*` dan
  `cv_essays_*`) tanpa modal. Modal **Restart / Continue** hanya muncul bila
  siswa belum pernah menyelesaikan eksplorasi.
- **Padding banner konteks** `CalcContextBanner` (step 19–20) diperbaiki:
  `pt-2 pb-1 md:pt-4 md:pb-2` agar tidak menempel pada header/subtitle di atasnya.

### Verifikasi
- `npm run build` di `client`: sukses (128 modul, 0 error).
- Sinkronisasi key i18n EN ↔ ID diverifikasi: 0 key berbeda.

## [1.5.0] — 2026-08-05

### Ditambahkan
- Alur Exploration diperluas dari **19 → 22 step** dan **4 → 7 isian essay
  (open step)** mengikuti desain `design/step 17-22/`:
  - Step `open-restu-calc` (Essay 4): murid menghitung pendapatan bersih Pak
    Restu untuk `x = 400.000` menggunakan `(g ∘ f)(x) = 0,75x − 80.000`
    → `Rp220.000`. Menampilkan **banner konteks** (`exploration.calcBanner`)
    dan **pill jawaban Essay 2** (`open-gof-money`) sebelumnya.
  - Step `open-rafif-calc` (Essay 5): pendapatan bersih Pak Rafif untuk
    `x = 400.000` via `(f ∘ g)(x) = 0,75x − 60.000` → `Rp240.000`. Menampilkan
    banner konteks dan pill jawaban Essay 3 (`open-fog-money`).
  - Step `open-difference-explanation` (Essay 6): menjelaskan perbedaan hasil
    keduanya (selisih Rp20.000).
  - Step `open-conclusion` (Essay 7): kesimpulan bahwa komposisi fungsi umumnya
    tidak komutatif.
  - Step `open-comparison` (lama) dihapus dan digantikan oleh keempat step di atas.
- **Mode dua karakter** (`speaker: 'both'`): `SPEAKERS.both` dan
  `SpeakerCharacter` kini merender Pak Restu + Pak Rafif berdampingan
  (recursive render, overlap `-space-x-12 md:-space-x-16`) untuk step
  `open-difference-explanation` & `open-conclusion`.
- Key i18n baru di `en.json` & `id.json`:
  - `exploration.calcBanner` (konteks pendapatan kotor Rp400.000),
  - `exploration.previousAnswerPill` (label pill "Jawaban Essay {n}" /
    "Essay {n} Answer"),
  - teks + hint untuk `open-restu-calc`, `open-rafif-calc`,
    `open-difference-explanation`, `open-conclusion`.

### Diubah
- `server/constants.js`: `EXPLORE_STEP_IDS` → 22 id; `OPEN_STEP_IDS` → 7 id
  essay; `TOTAL_OPEN_STEPS` otomatis jadi 7. Server (`answers.js`, `classes.js`,
  seed `db.js`) memakai konstanta ini sehingga tak ada nilai hardcode lama.
- `client/src/data/story.js`: metadata step baru `contextBanner`,
  `previousEssayKey`, `essayNumberLabel` pada `open-restu-calc` /
  `open-rafif-calc` untuk rendering banner & pill jawaban essay sebelumnya.
- `client/src/pages/Exploration.jsx`: `OpenStepInput` merender banner konteks +
  pill jawaban essay sebelumnya (nilai diambil dari `tempEssays` /
  `savedAnswers` via `step.previousEssayKey`).
- `client/src/pages/TeacherDashboard.jsx`: `TOTAL_OPEN = 4 → 7` agar status
  siswa "Selesai" terhitung benar dengan jumlah open step baru.
- ReviewPage (verifikasi final) otomatis menampilkan **7 essay** karena memetakan
  `OPEN_STEPS` (derived dari `STORY`).

### Verifikasi
- `npm run build` di `client`: sukses (128 modul, 0 error).
- Sinkronisasi key i18n EN ↔ ID diverifikasi: 0 key berbeda.

## [1.4.1] — 2026-08-05

### Diubah
- Isian essay (`OpenStepInput`): teks peringatan **"Simpan jawabanmu terlebih
  dahulu untuk melanjutkan"** (`exploration.mustSave`) di bawah tombol **Lanjut**
  dihapus. Kunci tetap berlaku (Lanjut hanya aktif setelah jawaban tersimpan),
  hanya teks informatifnya yang dihilangkan.
- Tombol **Kembali** di header Exploration lebih gelap (`bg-brown-500`, teks
  `text-cream`) — di antara brown-200 (lama) dan brown-800 (tombol Keluar).
- Restart eksplorasi dari modal Home (`Home.jsx` `startOver`) kini juga menghapus
  draft essay (`localStorage cv_essays_{userId}`) — semua isian essay dibersihkan,
  tidak ada yang tersimpan, senada dengan `replay()` di halaman Exploration.

### Diperbaiki
- **Jawaban essay tersimpan tidak tampil saat kembali (Back)** — akar masalahnya
  pemanggilan argumen yang salah:
  - `OpenStepInput` memanggil `onDraft(e.target.value)` tanpa `step.id`, padahal
    `saveEssayDraft(stepId, text)` butuh id step sebagai argumen pertama → draft
    tersimpan dengan key yang salah. Kini `onDraft(step.id, e.target.value)`.
  - `Exploration.jsx` memanggil `onSave={() => saveEssay(step.id)}` yang mengabaikan
    teks dari input → tersimpan kosong. Kini `onSave={(text) => saveEssay(step.id, text)}`.
  - Dengan ini, saat murid kembali ke step essay, textarea menampilkan jawaban yang
    tadi ditulis dan bisa diedit ulang via tombol Edit.

### Verifikasi
- `npm run build` di `client`: sukses (125 modul, 0 error).

## [1.4.0] — 2026-08-05

### Ditambahkan
- **Evaluasi DIKUNCI sementara** (persiapan ubah ke format berbasis proyek):
  route `/evaluation` di `App.jsx` kini `<Navigate to="/" replace />`; kartu
  Evaluasi di Home selalu terkunci (`card.locked: true`) dengan label baru
  `home.comingSoon` ("Segera hadir"); tombol **Lanjut ke Evaluasi** dihapus
  dari halaman verifikasi eksplorasi.
- Mekanisme **Simpan/Edit** pada isian essay (`OpenStepInput`): tombol hijau
  **Simpan jawaban** mengunci textarea (`readOnly`, latar hijau) + badge
  `✓ Tersimpan` + tombol **Edit**; tombol **Lanjut** hanya aktif bila sudah
  tersimpan. Draft tersimpan otomatis setiap ketik ke `localStorage
  cv_essays_{userId}` (struktur baru `{ stepId: { text, saved } }`, data lama
  string dimigrasi otomatis menjadi `{ text, saved: true }`).
- Label badge pada panah `MoneyFlowDiagram` (melengkung, gaya sama dengan flow
  mesin): `f(x) = 0,75x` di panah money→diskon pada step `quiz-retribution`;
  `f(x) = 0,75x` + `g(x) = x − 80.000` pada step `open-gof-money` dan
  seterusnya (moneyFlow 2).
- Prop `instant` pada `Typewriter` — teks langsung tampil penuh (tanpa efek
  ketik/suara) untuk step yang sudah pernah dilihat (`visited`).
- State `completed` di `Exploration.jsx` (Set step yang sudah dilewati via
  `advance()`): saat murid kembali ke kuis yang pernah dilewati, kuis tampil
  hijau terkunci + tombol Lanjut meskipun sebelumnya salah 3× — jawaban salah
  tidak lagi menghalangi tampilan "terjawab benar". `replay()` me-reset
  `completed`/`visited` agar bisa dikerjakan ulang.
- i18n `en.json`/`id.json`: `exploration.edit`, `exploration.mustSave`,
  `home.comingSoon`.

### Diubah
- Tombol **Kembali** dipindah ke kanan atas header Exploration, berdampingan
  dengan tombol **Keluar**.
- Tombol **Lanjut** kuis yang sudah dijawab benar kini tombol kecil
  `rounded-full` ber-`absolute` di pojok kanan bawah area pilihan ganda (bukan
  baris terpisah di bawah grid, tidak membesar mengisi sel kosong grid).
- `MoneyFlowDiagram` mengganti panah lurus `StraightArrow` dengan `CurvedArrow`
  (melengkung solid coklat) + badge label di atasnya.
- Layout chat Pak Rafif dicerminkan (`flex-row-reverse`, badge nama di kanan,
  offset `-mr-6 md:-mr-10`) pada step `rafif-story` & `open-fog-money`.
- Home: sapaan "Hi, {name}" diletakkan di luar kartu; teks intro + 3 kartu game
  (About/Exploration/Evaluation) digabung dalam satu kartu besar
  `bg-[#fae7cd] rounded-[2.5rem]`.
- `Navbar.jsx`: teks brand "Cassava Village" di-hardcode (tidak lagi
  `t('app.name')` — tidak berubah saat ganti bahasa).
- Halaman verifikasi akhir eksplorasi (ReviewPage): tombol **Lanjut ke
  Evaluasi** dihapus (evaluasi terkunci); tersisa **Simpan Jawaban Final** →
  banner sukses + **Replay** / **Back**.

### Dihapus
- `StraightArrow` di `StageDiagram.jsx` (diganti `CurvedArrow`).
- Import `useNavigate` (dan deklarasi `navigate`) di `Exploration.jsx` —
  tidak terpakai setelah tombol ke Evaluasi dihapus.
- Import `Evaluation.jsx` di `App.jsx` (route `/evaluation` kini redirect).

### Verifikasi
- `npm run build` di `client`: sukses (125 modul, 0 error).

## [1.3.0] — 2026-08-04

### Diubah (penyempurnaan halaman Exploration)
- **`MachineShowcase`** kini berposisi `fixed` tepat di tengah layar
  (`fixed inset-x-0 top-1/2 -translate-y-1/2`), bukan di tengah antara progress
  bar dan kotak dialog — presisi horizontal & vertikal. Efek: hanya cahaya kuning
  lembut (`bg-amber-300/50 blur-2xl`) di belakang mesin (cincin lingkaran
  putih/kuning dihapus), tetap ada animasi membesar `reveal-grow` + suara
  `playReveal()`.
- **`MachineFlowDiagram`**:
  - Panah diganti `CurvedArrow` (SVG kurva melengkung, ujung lancip via
    `<marker orient="auto">` lalu digambar manual presisi, warna coklat gelap
    solid `#543e27`, tanpa gradien/dash animasi).
  - Varian single-flow untuk `peeling-function` (cassava → Mesin Pengupas,
    keterangan `f`) dan `washing-function` (cassava → Mesin Pencuci,
    keterangan `g`); kedua slide ini kini di-`showMachineFlow`.
  - Node cassava memakai aset `cassava.png` (fallback emoji), ukuran disamakan
    dengan node mesin (`h-20 md:h-28`, `big` = `h-24 md:h-32`); di `quiz-peel`
    teks `x = 8,5 kg` tampil sebagai baris kedua **di dalam pill putih** di bawah
    nama "Singkong".
- **`MoneyFlowDiagram`**: tanpa kartu panel besar (tiap komponen kartu sendiri),
  panah **lurus panjang** (`StraightArrow` SVG), ikon memakai aset
  (`money-gross.png` / `money-discount.png` / `money-retribution.png`, fallback
  emoji), **tulisan detail dihapus** (Rp400.000/rumus) — hanya label
  (`money.flow`).
- **Formula** slide `peeling-function`/`washing-function` (semua step ber-`formula`)
  kini tampil **di dalam kartu dialog**, bukan komponen terpisah di bawah;
  `DialogueActions` hanya tombol Lanjut.
- **Kuis pilihan ganda** kini **seluruhnya 5 opsi**: opsi kelima ditambahkan pada
  `quiz-discount` (`f(x) = 0,75x − 25`) dan `quiz-retribution`
  (`g(x) = 80.000 − x`). Jawaban benar → popup 2 detik → modal pembahasan;
  **tombol Continue bawah dihapus** (lanjut lewat popup/pembahasan saja).
- **Typewriter**: skip lewat klik pada teks **dinonaktifkan**; diganti tombol
  **"Lewati ketikan →"** (`exploration.skipTyping`) rata kanan di dalam kartu
  dialog, sekali klik langsung menampilkan teks utuh.
- Tombol hint soal essai diberi background `bg-peach/80` (warna terang palet).
- Teks narasi dialog (`story.*.text`) dihapus em dash (`—`), diganti koma atau
  parafrase agar pelafalan/TTS lebih baik.

### Ditambahkan
- Console log debug `[CassavaVillage Debug]` di `Exploration.jsx` (step aktif) &
  `MachineShowcase` (render) untuk pengecekan via DevTools.
- README aset: entri `cassava.png`, `money-gross.png`, `money-discount.png`,
  `money-retribution.png`.

### Dihapus
- `index.css`: keyframe `dash-flow` & `.flow-dash` (panah tidak lagi beranimasi
  dash).

### Verifikasi
- `npm run build` di `client`: sukses (127 modul, 0 error).

## [1.2.0] — 2026-08-04

### Ditambahkan
- **Redesain total halaman Exploration** mengikuti mockup `design/desing murid/`:
  - Layout panggung (`stage`) immersive: background landscape penuh tetap dipertahankan,
    Navbar sticky tetap di atas, header Exploration (judul, `Step x/19`, progress bar,
    tombol Keluar) tetap memakai gaya lama.
  - **Center Stage** (tengah halaman) menampilkan diagram sesuai step:
    - `MachineFlowDiagram`: alur `Singkong (x) → f(x)=0,85x → Mesin Pengupas →
      g(x)=0,9x−0,5 → Mesin Pencuci`.
    - `MoneyFlowDiagram`: alur `Pendapatan Kotor (Rp400.000) → Diskon f(x)=0,75x →
      Biaya Retribusi g(x)=x−80.000`, dengan node aktif menyala
      (`activeIndex` dari `step.moneyFlow`).
    - `MachineShowcase`: tampilan satu mesin saat step mengenalkan mesin.
  - **Bottom Dialogue Area**: karakter pembicara (Pak Restu/Pak Rafif/Narrator) berdiri
    di kiri bawah, kotak dialog krem dengan badge nama pembicara di kanan bawah.
    Konten interaktif (pilihan ganda / isian / tombol lanjut) tampil **di bawah**
    kotak dialog — kotak dialog naik, opsi di bawahnya.
  - **`QuizFeedbackModal`**: pop-up jawaban benar/salah di tengah layar
    (maskot singkong, heading hijau/merah, tombol **Continue →** / **Coba lagi**).
- Komponen baru di `client/src/components/`:
  - `StageDiagram.jsx` (`MachineFlowDiagram`, `MoneyFlowDiagram`, `MachineShowcase`).
  - `SpeakerCharacter.jsx` (karakter berdiri; fallback emoji bila PNG belum ada).
  - `QuizFeedbackModal.jsx` (feedback kuis).
- i18n `en.json`/`id.json`: key baru `exploration.cassava`; label mesin diagram
  memakai ulang `story.{id}.label` dan `money.flow`.

### Diubah
- `client/src/pages/Exploration.jsx` ditulis ulang: struktur `min-h-screen` +
  `flex flex-col justify-between`, `SpeakerCharacter` di kiri, kotak dialog + opsi
  interaktif di kanan, `MachineCard` (lama) diganti `MachineShowcase`.

### Catatan
- Aset visual (PNG karakter/mesin) diserahkan ke pemilik proyek; UI memakai
  placeholder (emoji + gradasi) via `AssetImage` sampai file ditaruh di
  `client/src/assets/`.

### Verifikasi
- `npm run build` di `client`: sukses (118 modul, 0 error).

## [1.1.0] — 2026-08-03

### Ditambahkan
- Komponen `client/src/components/ExitModal.jsx`: modal konfirmasi keluar
  (judul, pesan, tombol **Stay/Tetap di sini** & **Leave/Keluar**) + ikon
  `LogOutIcon` di `icons.jsx`. Tombol **Keluar** terpasang di halaman
  Exploration & Evaluation (bukan di About).
- Modal resum eksplorasi di **Home**: saat kartu Exploration diklik dan ada
  progres tersimpan (`localStorage cv_step_{userId}`), muncul pilihan
  **Restart/Ulangi** (`POST /api/progress/reset-exploration` + hapus
  localStorage) atau **Continue/Lanjutkan** sebelum masuk ke `/exploration`.
  Keputusan ada di Home; halaman Exploration auto-resume dari localStorage.
- Kolom `users.exploration_done` (migrasi otomatis di `server/db.js`) +
  endpoint `POST /api/progress/exploration-done`. `POST /api/answers`
  otomatis men-set flag ini saat semua `OPEN_STEP_IDS` selesai.
- `server/constants.js`: `EXPLORE_STEP_IDS` (19 id cerita), dipakai oleh
  `POST /api/progress/reset-exploration`.
- Halaman About dipecah jadi 3 bagian berjenjang — **Learning Outcomes →
  Learning Objectives → Learning Indicators** — dengan kunci per-akun di
  `localStorage cv_about_{userId}_{sectionId}`, tombol **Read/Baca**, dan
  tombol Back (tanpa modal).

### Diubah
- Halaman About & Home di-center vertikal (pola
  `div.flex.min-h-full.flex-col` + `<main class="...flex-1...justify-center">`).
- Scrollbar disembunyikan (`scrollbar-width: none` + `::-webkit-scrollbar`
  none) tanpa reservasi gutter — scroll tetap berfungsi.
- Feedback evaluasi kini senada warna opsi jawaban: benar
  `bg-green-100 text-green-800 ring-green-400`, salah
  `bg-red-50 text-red-700 ring-red-300` (judul + penjelasan ikut warna).
- Layar hasil evaluasi: ringkasan `summaryPerfect/Good/Fair/Low`, tombol hanya
  **Try again** + **Back to Home** (link ke Exploration dihapus).
- `playWrong()` di `AudioContext.jsx` → 3 nada menurun G4→E♭4→B♭3 (sine,
  nuansa tenor/sedih), volume default `0.07 → 0.16`.
- i18n `en.json`/`id.json`: key baru `exit.*`,
  `about.outcomesDesc/objectivesDesc/indicatorsDesc/read/back/backToHome`,
  `exploration.replay/resume/resumeTitle/resumeMessage/restart`,
  `evaluation.summaryPerfect/Good/Fair/Low`.
- Logout & pindah akun: `Navbar.jsx` menulis `sessionStorage cv_logging_out`
  + `localStorage cv_resume {userId, path}`; `RequireAuth` di `App.jsx`
  redirect ke login tanpa `state.from`; `Login.jsx` hanya memakai `cv_resume`
  jika `userId` cocok lalu menghapusnya.

### Diperbaiki
- **Evaluasi terkunci lagi setelah replay eksplorasi**: sebelumnya
  `explorationDone` dihitung dari banyak jawaban `OPEN_STEP_IDS` yang masih
  ada; `reset-exploration` menghapus jawaban → evaluasi kekunci. Kini flag
  persisten `users.exploration_done` membuat evaluasi tetap terbuka walau
  murid replay eksplorasi.
- **Layar hasil evaluasi putih/crash** saat `current === -1`: `q` di-guard
  (`EVALUATION[-1]` undefined → `q.id` error).
- **Modal keluar tidak muncul**: ternyata build/cache browser lama — kode sudah
  ada di Exploration & Evaluation; `npm run build` ulang memperbaikinya.
- **Akar lain terlempar ke halaman akun sebelumnya** saat logout → login akun
  berbeda (lihat Logout & pindah akun di atas).

### Verifikasi
- `npm run build` di `client`: sukses (116 modul).
- API diuji manual: `exploration_done` tetap `True` setelah
  `reset-exploration` (`openAnswered=0`, `evaluationUnlocked=True`).

## [1.0.0] — 2026-08-03

### Ditambahkan
- Dokumentasi `AGENTS.md` di root (panduan proyek untuk agent/developer) dan
  `CHANGELOG.md` ini.

### Diubah
- i18n dilengkapi untuk seluruh halaman frontend:
  - `Exploration.jsx` memakai `story.{id}.text/explain/hint/label/formulaNote`
    via `t()`/`has()` (semua teks cerita & soal di `en.json`/`id.json`).
  - `Evaluation.jsx` memakai `quiz.{id}.text/options/explain`; opsi jawaban
    kini dari i18n, submit tetap mengirim teks opsi ke backend.
  - `MoneyFlowPanel.jsx` memakai `t('money.process')` & `t('money.flow')`.
  - Logo di `Navbar.jsx` (`Logo` & `AppLogo`) memakai `t('app.logoLine1/2')`.
  - `Login.jsx` hero memakai `login.heroTitle/heroText` dan placeholder
    `login.namePlaceholder/emailPlaceholder`.
  - `TeacherDashboard.jsx` layar "Teacher only" memakai
    `teacher.onlyTitle/onlyDesc`.

### Diperbaiki
- **Kerusakan encoding UTF-8** pada 5 file (emoji berubah jadi mojibake
  `ðŸ¥"`) akibat edit lewat PowerShell `Set-Content` — ditulis ulang bersih:
  `Evaluation.jsx`, `Home.jsx`, `Login.jsx`, `Navbar.jsx`,
  `TeacherDashboard.jsx`. (Jangan ulangi: edit file ber-emoji hanya pakai
  tool Read/Edit/Write, lihat AGENTS.md.)

### Verifikasi
- `npm run build` di `client`: sukses (103 modul, 0 error).

## [0.9.0] — i18n penuh

### Ditambahkan
- `client/src/i18n/en.json` dan `id.json` ditulis ulang lengkap (struktur key
  identik untuk semua teks UI + materi).
- Helper `has(key)` di `I18nContext.jsx` (cek key ada sebelum dipakai).

### Diubah
- Refactor data materi ke key i18n:
  - `client/src/data/story.js`: setiap step kini memakai field `i18n` (bukan
    teks inline), isi teks di `story.{id}.*`.
  - `client/src/data/evaluation.js`: hanya `{ id, correct }` — teks, opsi, dan
    penjelasan soal ada di `quiz.eval-{n}.*`.

## [0.8.0] — Routing & keamanan

### Diubah
- Migrasi `react-router-dom` v7 → `react-router` v8 di seluruh import
  (advisory keamanan GHSA-qwww-vcr4-c8h2). `react-router-dom` tidak dipakai
  lagi; jangan dikembalikan.
- `npm audit` bersih (0 vulnerability).

## [0.5.0] — Backend API & frontend utama

### Ditambahkan
- Backend Express + SQLite (`node:sqlite`):
  - `server/db.js`: skema tabel `users` & `answers`, seed guru otomatis
    (`teacher@cassava.com` / `teacher123`, nama `Ms. Sarah`).
  - `server/routes/auth.js`: `POST /api/auth/signup`, `POST /api/auth/login`,
    `GET /api/auth/me`.
  - `server/routes/answers.js`: `GET/POST /api/answers`, `GET /api/progress/me`,
    `GET /api/teacher/students`.
  - `server/middleware/auth.js`: sign/verify JWT, `requireAuth`,
    `requireTeacher`.
  - Error handler + `GET /api/health` di `server/index.js`.
- Frontend React 19 + Vite 7 + Tailwind CSS 4:
  - Halaman `Login`, `Home`, `About`, `Exploration`, `Evaluation`,
    `TeacherDashboard`.
  - `AuthContext.jsx` (JWT client), `I18nContext.jsx`, helper `context/api.js`.
  - Tema warna/font + animasi `pop-in`/`shake` di `index.css`.
- Root `package.json` dengan `concurrently` (`install:all`, `dev`, `build`,
  `start`).

### Terverifikasi
- API diuji E2E manual: signup → save answer → progress → teacher students.
- `npm run dev` (server 5001 + client 5173) berjalan.
