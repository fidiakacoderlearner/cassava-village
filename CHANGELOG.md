# Changelog — Cassava Village

Semua perubahan penting pada proyek dicatat di sini. Format mengikuti
[Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/).

## [1.8.0] — 2026-08-06

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
