# AGENTS.md — Cassava Village

Panduan untuk AI agent / developer yang bekerja di proyek ini. Baca sebelum
mengubah kode.

## Ringkasan proyek

Website LKPD (Lembar Kerja Peserta Didik) interaktif bertema **Desa Singkong**
untuk materi **komposisi fungsi** (Fase F). Dibangun mengikuti mockup desain di
`work!.pdf`. Alur: cerita Pak Restu (pengupas `f(x)=0,85x` → pencuci
`g(x)=0,9x−0,5`), lanjutan cerita uang (diskon `f(x)=0,75x` → retribusi
`g(x)=x−80.000`), Pak Rafif dengan urutan terbalik `(f∘g)(x)`, lalu evaluasi.

- Frontend: React 19 + Vite 7 + Tailwind CSS 4 (`client/`, port 5173)
- Backend: Express + SQLite (`server/`, port 5001)
- Desain: palet coklat `#543E27` (brown-800), krem `#F5F0E5` (cream), peach
  `#F3C599`; font Poppins (display) + Inter (body).

## Perintah

```bash
npm run install:all   # install dependency server + client
npm run dev           # jalankan server (5001) + client (5173) bersamaan
npm run build         # build produksi client (verifikasi syntax)
npm run start         # jalankan hanya server
```

- Server dev: `node --watch index.js` (auto-restart).
- Client dev: `vite` (HMR).
- **Tidak ada framework test.** Verifikasi lewat `npm run dev` (uji manual) dan
  `npm run build` (sanity check). Tidak ada linter/typecheck terpisah.

## Struktur

```
cassava-village/
├── client/src/
│   ├── main.jsx            # entry: BrowserRouter > I18nProvider > AuthProvider > ProgressProvider > AudioProvider
│   ├── App.jsx             # routing + RequireAuth / StudentOnly / RequireUnlocked guards
│   ├── index.css           # @theme (warna/font), animasi pop-in & shake, scrollbar disembunyikan
│   ├── pages/              # Login, Home, About, Exploration, Evaluation, TeacherDashboard
│   ├── components/         # Navbar, Avatar, Formula, MoneyFlowPanel, ExitModal, Typewriter, PageBackground, StageDiagram, SpeakerCharacter, QuizFeedbackModal, ExplainModal, AssetImage
│   ├── context/            # api.js, AuthContext.jsx, I18nContext.jsx, ProgressContext.jsx, AudioContext.jsx
│   ├── data/               # story.js, evaluation.js (data berbasis key i18n)
│   ├── i18n/               # en.json, id.json (semua teks UI + materi)
│   └── assets/             # gambar (lihat assets/README.md); boleh kosong
└── server/
    ├── index.js            # express app, mount route, error handler
    ├── db.js               # skema SQLite + seed guru
    ├── constants.js        # EXPLORE_STEP_IDS, OPEN_STEP_IDS, EVAL_STEP_IDS, TOTAL_OPEN_STEPS
    ├── middleware/auth.js  # JWT sign/verify, requireAuth, requireTeacher
    └── routes/             # auth.js, answers.js, classes.js
```

## Alur progress & penguncian halaman

- `/about` & `/exploration` dibungkus `RequireUnlocked` di `App.jsx` yang
  membaca flag dari `ProgressContext` (dari `GET /api/progress/me`):
  `/about` bebas; `/exploration` butuh `aboutDone`.
- **Evaluasi sementara DIKUNCI** (menunggu diubah ke format berbasis proyek):
  route `/evaluation` di `App.jsx` kini `<Navigate to="/" replace />`, dan
  kartu Evaluasi di Home selalu terkunci (`card.locked: true`, label
  `home.comingSoon`). Jangan dibuka kembali sampai desain evaluasi baru final.
- `explorationDone` di server = `users.exploration_done` (persisten) **ATAU**
  total jawaban essay di semua attempt ≥ `TOTAL_OPEN_STEPS`. Kolom
  `exploration_done` di-set otomatis saat siswa menekan **Submit Final Answer**
  (`POST /api/exploration/submit`) dan TIDAK pernah direset oleh
  `POST /api/progress/reset-exploration`.
- **Essay hanya tersimpan ke server saat submit final** — jawaban 7 essay tidak
  pernah dikirim lewat `POST /api/answers` (endpoint itu menolak
  `OPEN_STEP_IDS`). Selama eksplorasi essay hanya ada di `localStorage
  cv_essays_{userId}`; saat **Kirim Jawaban Final**, `POST
  /api/exploration/submit` membuat **attempt baru** (tabel
  `exploration_attempts` + `attempt_answers`) berisi tepat 7 jawaban dan
  men-set `exploration_done = 1`. Guru selalu melihat 7 jawaban per attempt.
  Riwayat attempt tidak dihapus oleh `reset-exploration`.
- Resum eksplorasi: posisi step tersimpan di `localStorage cv_step_{userId}`.
  Saat klik kartu Exploration di Home, jika ada progres tersimpan muncul modal
  pilihan **Restart** (`POST /api/progress/reset-exploration` + hapus localStorage)
  atau **Continue** (lanjut dari step tersimpan). Keputusan ada di Home, bukan
  di halaman Exploration.
- Logout & pindah akun: logout menulis `sessionStorage cv_logging_out='1'` agar
  `RequireAuth` redirect ke login tanpa `state.from` (mencegah akun berikutnya
  terlempar ke halaman akun lama). Path terakhir disimpan di `localStorage
  cv_resume` `{userId, path}`; `Login.jsx` hanya memakainya jika `userId` cocok,
  lalu menghapusnya.

## Routing & Auth

- Routes di `client/src/App.jsx`: `/login` publik; `/`, `/about`,
  `/exploration`, `/teacher` dibungkus `RequireAuth`
  (`<Navigate to="/login" state={{from}} />`). `/evaluation` saat ini
  redirect ke `/` (dikunci — lihat Alur progress & penguncian halaman).
- Auth: JWT disimpan client (lihat `context/AuthContext.jsx`), dikirim via
  header `Authorization: Bearer <token>`.
- `context/api.js`: helper `api(path, { method, body, token })` untuk semua
  panggilan fetch; melempar `Error` berisi pesan dari server.
- Role: `student` dan `teacher` keduanya bisa sign up sendiri. Form registrasi
  punya pilihan peran (Murid/Guru): murid wajib kode kelas, guru tidak
  (`POST /api/auth/signup` menerima `role`). Guru melihat menu tambahan
  "Teacher" di Navbar dan halaman `/teacher`.

## i18n (PENTING)

Semua teks UI dan materi (cerita, soal, penjelasan, opsi) HARUS lewat i18n —
jangan hardcode string bahasa di komponen.

- File: `client/src/i18n/en.json` dan `id.json` (struktur key harus identik).
- Context: `client/src/context/I18nContext.jsx`
  - `t('a.b.c', vars)` — terjemahan; placeholder `{x}` diganti dari `vars`
    (mendukung banyak placeholder, mis. `{score}` dan `{total}`).
  - `has('a.b.c')` — cek key ada sebelum dipakai (untuk data opsional).
  - `lang`, `setLanguage('en' | 'id')` — persist ke `localStorage cv_lang`.
- Data materi pakai field `i18n` → resolusi `story.{id}.text` atau
  `quiz.{id}.text`. Contoh: `story.js` punya `i18n: 'quiz-peel'`, `evaluation.js`
  punya `{ id: 'eval-1', correct: 0 }` → teks/opsi/penjelasan di
  `quiz.eval-1.*`.
- Jika menambah key baru: tambahkan di `en.json` DAN `id.json`.
- Catatan angka: gunakan koma desimal (`0,85x`) sesuai konvensi materi
  (Indonesia); placeholder/penjelasan mengikuti bahasa masing-masing.

## Konvensi data & konten

- `client/src/data/story.js`: `STORY` (step cerita), `SPEAKERS` (avatar),
  `OPEN_STEPS` (7 step isian terbuka). Field per step: `i18n`, `type`,
  `machineId`, `formula`, `moneyFlow`, `options`, `correct`,
  `contextBanner`, `previousEssayKey`, `essayNumberLabel`, dll.
  **Semua kuis pilihan ganda memakai 5 opsi** (`quiz-discount`,
  `quiz-retribution`, dst.) — `correct` adalah indeks opsi benar.
- `client/src/data/evaluation.js`: hanya `{ id, correct }` — isi di i18n.
- Format angka/rupiah konsisten: `Rp400.000`, `Rp80.000`.
- Aset gambar: taruh di `client/src/assets/` sesuai nama di
  `client/src/assets/README.md` (`pak-restu.png`, `pak-rafif.png`,
  `narrator.png`, `peeling-machine.png`, `washing-machine.png`, `cassava.png`,
  `money-gross.png`, `money-discount.png`, `money-retribution.png`, `logo.*`).
  Kalau file tidak ada, tampil placeholder emoji (web tetap jalan).

## Fitur UI/UX interaktif

- **Halaman About**: hub 3 kartu berjenjang (Learning Outcomes → Objectives →
  Indicators), terbuka berurutan. Posisi per-akun di `localStorage
  cv_about_{userId}_{sectionId}`; membuka kartu Indicators memanggil
  `POST /api/progress/about-done`. Tombol **Read/Baca** (bukan centang).
- **Exploration**: cerita + kuis + 7 step isian terbuka (total 22 step). Header
  atas memuat tombol **Kembali** (hidden di step 1) dan **Keluar** (`ExitModal`;
  konfirmasi, progres tersimpan otomatis) berdampingan di kanan. Subtitle
  menampilkan badge **Soal Tersimpan {n}/7** (`exploration.savedQuestion`) yang
  menghitung essay tersimpan (`tempEssays[id].saved` atau sudah terkirim ke
  server). Saat 22/22 selesai muncul halaman **verifikasi** (ReviewPage): 7
  essay open step bisa diedit + tombol **Back** dan **Kirim Jawaban Final**
  ("Submit Final Answer" — `POST /api/exploration/submit` dengan
  `{ answers: { stepId: teks } }`, server membuat attempt baru lalu
  `navigate('/')` ke Home; tanpa banner sukses/Replay). Di Home, kartu
  Exploration memunculkan modal **Restart / Continue** jika ada progres
  tersimpan (`localStorage cv_step_{userId}`), **kecuali** sudah
  `progress.explorationDone` — langsung reset ke step 1 tanpa modal.
  - **Panggung (Center Stage)**:
    - `MachineShowcase`: mesin di tengah layar (`fixed inset-x-0 top-1/2`),
      cahaya kuning lembut (`bg-amber-300/50 blur-2xl`) tanpa cincin, animasi
      `reveal-grow` + suara `playReveal()`.
    - `MachineFlowDiagram`: panah `CurvedArrow` (SVG kurva, ujung lancip,
      warna coklat gelap solid `#543e27`, tanpa gradien/dash); varian single-flow
      untuk `peeling-function`/`washing-function` (cassava → mesin, label
      `f`/`g`); node cassava pakai aset `cassava.png` (ukuran sama mesin).
    - `MoneyFlowDiagram`: tanpa kartu panel besar, tiap komponen kartu sendiri,
      panah `CurvedArrow` (melengkung, sama seperti flow mesin) dengan **badge
      label** bertahap: `f(x)=0,75x` di panah money→diskon pada step
      `quiz-retribution`; `f(x)=0,75x` + `g(x)=x−80.000` di step `open-gof-money`
      dan seterusnya (moneyFlow 2). Ikon pakai aset
      `money-gross/discount/retribution.png`, hanya label (`money.flow`).
      Pada step Pak Rafif (`rafif-story` & `open-fog-money`) prop `reverse`
      mengubah urutan kartu menjadi `[Pendapatan Kotor][Biaya Retribusi][Diskon]`
      dengan **panah miring biasa**: gross→retribusi label `f(x)=0,75x`,
      retribusi→diskon label `g(x)=x−80.000`.
    - **Banner konteks** (step `open-restu-calc` & `open-rafif-calc`):
      `CalcContextBanner` dirender **tepat di bawah header Exploration**
      (`step.contextBanner`, padding `pt-2 pb-1 md:pt-4 md:pb-2`), selebar
      container rata kiri: teks `exploration.calcBanner` + pill jawaban essay
      sebelumnya (`previousAnswerPill` + nilai dari `tempEssays` /
      `savedAnswers` via `step.previousEssayKey`).
    - **Layout Pak Restu + Pak Rafif** (step `open-difference-explanation` &
      `open-conclusion`, speaker `both`): Pak Restu di **kiri**, Pak Rafif di
      **kanan**, kolom chat + essay di **tengah**; karakter `hidden md:block`
      (mobile hanya kolom chat). Name tag tengah `left-1/2 -translate-x-1/2`.
  - **Formula** (step `peeling-function`/`washing-function`): tampil **di dalam
    kartu dialog**, bukan terpisah; `DialogueActions` hanya tombol Lanjut.
  - **Kuis**: semua 5 opsi. Jawab benar → popup 2 detik → `ExplainModal`
    (pembahasan). Setelah dijawab benar, kuis **terkunci** (hijau) + tombol
    **Lanjut** kecil `rounded-full` di pojok kanan bawah area pilgan (`absolute`,
    bukan baris terpisah di bawah grid). Saat murid **kembali** ke kuis yang
    sudah dilewati (state `completed`, tambah via `advance()`), kuis langsung
    tampil hijau terkunci + Lanjut meski sebelumnya salah 3x — jawaban salah
    tidak disimpan di `savedAnswers` (di-skip), jadi tidak menghalangi.
  - **Isian essay (open step)**: mekanisme **Simpan/Edit** — tombol hijau
    **Simpan jawaban** mengunci textarea (`readOnly`, latar hijau) + badge
    `✓ Tersimpan` + tombol **Edit**; tombol **Lanjut** hanya aktif bila sudah
    tersimpan. Draft tersimpan otomatis tiap ketik ke `localStorage
    cv_essays_{userId}` berstruktur `{ stepId: { text, saved } }` (data lama
    string dimigrasi otomatis jadi `{ text, saved: true }`). Simpan/Edit ini
    **hanya client-side** — essay baru masuk server saat Submit Final (lihat
    Alur progress).
  - **Typewriter**: klik teks **tidak** skip; tombol **"Lewati ketikan →"**
    rata kanan di kartu dialog (`exploration.skipTyping`); prop `instant`
    (langsung tampil penuh tanpa suara) untuk step yang sudah pernah dilihat
    (`visited`).
  - **Layout Pak Rafif** (step `rafif-story` & `open-fog-money`): dicerminkan
    (`flex-row-reverse`, badge nama di kanan, offset `-mr-6 md:-mr-10`).
  - **Hint essai**: tombol background `bg-peach/80`.
- **Home**: sapaan "Hi, {name}" di luar kartu; teks intro + 3 kartu game
  (About/Exploration/Evaluation) dalam satu kartu besar
  `bg-[#fae7cd] rounded-[2.5rem] p-5 md:p-7 ring-brown-300`. Kartu Evaluation
  selalu terkunci dengan label `home.comingSoon`.
- **Evaluation**: **DIKUNCI sementara** (route redirect ke `/`, kartu Home selalu
  terkunci). Halaman lama masih ada (7 soal 5 opsi, feedback hijau/merah, layar
  hasil skor `{score}/{total}` + `summaryPerfect/Good/Fair/Low`, tombol Keluar)
  tapi tidak bisa diakses — akan diubah menjadi berbasis proyek.
- **Audio** (`context/AudioContext.jsx`): `playWrong()` = 3 nada menurun
  (sine) untuk jawaban salah, `playCorrect()` = arpeggio naik (C4-E4-G4),
  `playTypeBlip()` efek ketik Typewriter; `playReveal()` (bunyi "cling"
  lonceng + shimmer) untuk mesin muncul; musik latar opsional.
- **Scrollbar**: disembunyikan (`scrollbar-width: none` + `::-webkit-scrollbar`
  none) tanpa reservasi gutter — scroll tetap berfungsi.
- **Center vertikal halaman**: pola `div.flex.min-h-full.flex-col` + `<main
  class="...flex-1...justify-center">` (Home & About) — jangan pakai
  `min-h-full` di `<main>` karena tinggi parent hanya min-height.

## Backend & Database

- DB: SQLite lewat `node:sqlite` (`DatabaseSync`, eksperimental, butuh Node
  22.5+; dipakai Node 24). File DB `server/cassava.db` (gitignored, WAL).
- Skema: `users(id, name, email UNIQUE, password_hash, role, created_at,
  class_id, about_done, exploration_done)`; `answers(id, user_id, step_id,
  answer, is_correct, created_at, updated_at, UNIQUE(user_id, step_id))` (kuis
  saja); `exploration_attempts(id, user_id, attempt_no, submitted_at,
  UNIQUE(user_id, attempt_no))` + `attempt_answers(id, attempt_id, step_id,
  answer, created_at, UNIQUE(attempt_id, step_id))` (7 essay per attempt).
- Kolom `about_done` & `exploration_done` ditambah via migrasi otomatis di
  `db.js` (`hasColumn` + `ALTER TABLE ... ADD COLUMN`) — file DB lama tetap
  kompatibel. `migrateEssayAttempts()` memindahkan baris essay lama dari
  `answers` ke attempt 1. `exploration_done` persist dan TIDAK direset oleh
  reset-exploration.
- Seed otomatis di `db.js`: guru `teacher@cassava.com` / `teacher123`
  (nama `Ms. Sarah`) + siswa demo `student@cassava.com` / `budi@cassava.com` /
  `siti@cassava.com` (password `student123` / `budi123` / `siti123`). Githa
  memiliki 1 attempt essay, Budi 2 attempt (untuk demo tab riwayat), Siti belum
  mengirim.
- Endpoint:
  | Method | Path | Auth |
  |---|---|---|
  | POST | `/api/auth/signup` | — |
  | POST | `/api/auth/login` | — |
  | GET | `/api/auth/me` | Bearer |
  | GET | `/api/answers` | Bearer |
  | POST | `/api/answers` | Bearer (menolak `OPEN_STEP_IDS`) |
  | POST | `/api/exploration/submit` | Bearer (buat attempt essay) |
  | GET | `/api/progress/me` | Bearer |
  | POST | `/api/progress/about-done` | Bearer |
  | POST | `/api/progress/exploration-done` | Bearer |
  | POST | `/api/progress/reset-exploration` | Bearer |
  | GET | `/api/teacher/classes` | Bearer + teacher |
  | POST | `/api/teacher/classes` | Bearer + teacher |
  | GET | `/api/teacher/classes/:id/students` | Bearer + teacher |
  | GET | `/api/teacher/classes/:id/essay-answers` | Bearer + teacher |
  | DELETE | `/api/teacher/classes/:id` | Bearer + teacher |
  | GET | `/api/health` | — |
- `JWT_SECRET` dari `process.env` (fallback dev). Jangan commit `.env`; jangan
  pernah hardcode secret produksi. Jangan log password/token.

## Konvensi kode

- Ikuti gaya file sekitar; jangan tambah komentar di kode kecuali diminta.
- React: import pakai ekstensi `.jsx` (mis. `../context/AuthContext.jsx`).
- Router: pakai `react-router` (v8), BUKAN `react-router-dom` — dimigrasi karena
  advisory keamanan GHSA-qwww-vcr4-c8h2. Jangan kembalikan ke react-router-dom.
- Tailwind 4: warna/font dari `@theme` di `index.css`
  (`text-brown-800`, `bg-cream`, `bg-peach`, `bg-sand`, `font-display`).
- Animasi tersedia: `animate-pop-in`, `animate-shake`, `animate-reveal-grow`, `scrollbar-thin`.
- `Navbar.jsx`: teks brand "Cassava Village" di-hardcode (tidak dipengaruhi
  bahasa); label menu tetap lewat i18n (`nav.*`).
- Jangan import gambar dengan pola `import.meta.glob` yang mencakup selain
  `*.{png,jpg,jpeg,svg,webp,gif}` — file `assets/README.md` akan gagal dimuat.
- Server: ESM (`"type": "module"`), async handlers, middleware auth di
  `middleware/auth.js`.
- **Debug log**: `Exploration.jsx` & `MachineShowcase` menuliskan
  `[CassavaVillage Debug] ...` ke console DevTools (step aktif, render mesin).

## Lingkungan kerja (Windows + PowerShell)

- Terminal PowerShell 5.1. Hindari chain `&&` (tidak didukung) — pakai
  `cmd1; if ($?) { cmd2 }`.
- **JANGAN edit file ber-emoji/UTF-8 via PowerShell `Set-Content`/`Get-Content`**
  — encoding default PowerShell 5.1 merusak emoji jadi mojibake (`ðŸ¥"`).
  Selalu pakai tool Read/Edit/Write.
- Semua perintah npm jalan dari root proyek ini; gunakan `--prefix` bila perlu.

## Perubahan masa depan

- `client/src/i18n/*.json`: tambah/timpa key untuk bahasa baru (EN & ID wajib).
- Tambah halaman: buat di `client/src/pages/`, daftarkan di `App.jsx`, tambah
  link di `Navbar.jsx` (perhatikan `linkClass`), label di i18n.
- Tambah endpoint: buat route di `server/routes/`, mount di `server/index.js`,
  gunakan `requireAuth`/`requireTeacher`.
- Bagian guru (`/teacher`, `TeacherDashboard.jsx`) sudah memuat **riwayat
  jawaban essay per attempt** (tab "Eksplorasi {n}" per siswa, lihat
  `GET /api/teacher/classes/:id/essay-answers`). Menilai/memberi skor essay
  ditunda sampai ada permintaan lebih lanjut. Lihat `PLAN.md`.
- Riwayat perubahan lengkap ada di `CHANGELOG.md`.
