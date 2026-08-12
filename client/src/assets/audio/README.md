# Audio — Aset Suara

Taruh file audio di folder ini. Aplikasi otomatis mendeteksi file yang ada:

| Nama file               | Dipakai untuk                                  |
| ----------------------- | ---------------------------------------------- |
| `background.webm` (atau `.mp3`, `.ogg`, `.wav`) | Backsound santai yang diputar loop (gaya Stardew Valley) |

Catatan:
- Hanya SATU file backsound yang dipakai (file pertama yang ketemu) — jadi
  simpan **hanya satu** file audio di folder ini.
- Gunakan format **WebM/Opus** (`background.webm`) untuk ukuran kecil; konversi
  ulang MP3 → WebM dengan tool online (mis. https://squoosh.app) atau ffmpeg.
- Musik dimuat **lazy** (`preload="none"`) — baru diunduh saat murid berinteraksi
  pertama kali, bukan saat halaman dibuka.
- Tombol musik 🔊/🔇 otomatis muncul di navbar/sidebar begitu file ada.
- Kalau tidak ada file, backsound tidak diputar (tombol tidak tampil) — web tetap
  berjalan normal.
- Suara efek ketikan dialog (`typewriter`) sudah dibuat sintesis via Web Audio
  API, jadi tidak perlu file tambahan untuk itu.
