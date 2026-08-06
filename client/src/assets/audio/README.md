# Audio — Aset Suara

Taruh file audio di folder ini. Aplikasi otomatis mendeteksi file yang ada:

| Nama file               | Dipakai untuk                                  |
| ----------------------- | ---------------------------------------------- |
| `background.mp3` (atau `.ogg`, `.wav`) | Backsound santai yang diputar loop (gaya Stardew Valley) |

Catatan:
- Hanya SATU file backsound yang dipakai (file pertama yang ketemu).
- Tombol musik 🔊/🔇 otomatis muncul di navbar/sidebar begitu file ada.
- Kalau tidak ada file, backsound tidak diputar (tombol tidak tampil) — web tetap
  berjalan normal.
- Suara efek ketikan dialog (`typewriter`) sudah dibuat sintesis via Web Audio
  API, jadi tidak perlu file tambahan untuk itu.
