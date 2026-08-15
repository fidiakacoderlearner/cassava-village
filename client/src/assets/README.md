# Aset / Assets

Taruh semua gambar dan ilustrasi kamu di folder ini. Nama file menentukan di mana
gambar dipakai (sistem otomatis memakainya kalau file ada):

| Nama file           | Dipakai untuk                          |
| ------------------- | -------------------------------------- |
| `pak-restu.webp`    | Avatar Pak Restu                       |
| `pak-rafif.webp`    | Avatar Pak Rafif                       |
| `peeling-machine.webp` | Ilustrasi mesin pengupas (label "Peeling Machine") |
| `washing-machine.webp` | Ilustrasi mesin pencuci (label "Washing Machine")  |
| `cassava.webp`      | Ilustrasi singkong pada diagram alur eksplorasi |
| `money-gross.webp`  | Ikon pendapatan kotor (diagram alur uang) |
| `money-discount.webp` | Ikon diskon (diagram alur uang) |
| `money-retribution.webp` | Ikon biaya retribusi (diagram alur uang) |
| `card-about.webp`   | Logo card "Tentang LKPD" di halaman utama |
| `card-exploration.webp` | Logo card "Eksplorasi" di halaman utama |
| `card-evaluation.webp` | Logo card "Evaluasi" di halaman utama |
| `logo.png` / `logo.svg` | Logo di navbar & halaman login    |
| `login-bg.webp`     | Latar belakang halaman login           |

Catatan:
- Format yang didukung: `.png`, `.jpg`, `.jpeg`, `.svg`, `.webp`, `.gif`, `.avif`.
- Browser memilih urutan **AVIF → WebP → PNG**, jadi taruh versi WebP untuk
  kompresi terbaik; simpan file asli di tempat aman di luar repo (folder `raw/`
  tidak ikut di-push).
- Kalau file tidak ada, aplikasi otomatis memakai placeholder emoji/gradasi, jadi
  website tetap berjalan dengan atau tanpa gambar.
- Ganti nama file sesuai nama aset yang kamu buat (cukup ikuti tabel di atas).

## Tentang file asli (resolusi penuh)

Semua aset disajikan sebagai `.webp` (kualitas 85–95%, **resolusi sama** dengan
aslinya). File PNG/SVG asli resolusi penuh disimpan di luar repo
(`cassava-raw-backup.zip`) agar tidak ikut di-bundle maupun di-push. Jika perlu
mengedit aset, konversi ulang PNG → WebP dengan tool online (mis.
https://squoosh.app) kualitas 85–95% dan taruh hasilnya di folder ini.

> Dukungan gambar untuk ilustrasi mesin akan otomatis muncul begitu kamu
> menaruh `peeling-machine.webp` / `washing-machine.webp` — kode tempatnya sudah
> siap di `src/pages/Exploration.jsx` (`MachineCard`).
>
> Logo 3 card utama (`card-about.webp`, `card-exploration.webp`,
> `card-evaluation.webp`) menampilkan kotak placeholder bergaris putus-putus di
> halaman utama sampai file-nya kamu taruh — kode siap di `src/pages/Home.jsx`.

## Audio

File suara ditaruh di subfolder `audio/` — lihat [`audio/README.md`](audio/README.md).
