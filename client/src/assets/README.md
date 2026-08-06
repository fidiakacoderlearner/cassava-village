# Aset / Assets

Taruh semua gambar dan ilustrasi kamu di folder ini. Nama file menentukan di mana
gambar dipakai (sistem otomatis memakainya kalau file ada):

| Nama file           | Dipakai untuk                          |
| ------------------- | -------------------------------------- |
| `pak-restu.png`     | Avatar Pak Restu                       |
| `pak-rafif.png`     | Avatar Pak Rafif                       |
| `narrator.png`      | Avatar narator                         |
| `peeling-machine.png` | Ilustrasi mesin pengupas (label "Peeling Machine") |
| `washing-machine.png` | Ilustrasi mesin pencuci (label "Washing Machine")  |
| `cassava.png` | Ilustrasi singkong pada diagram alur eksplorasi |
| `money-gross.png` | Ikon pendapatan kotor (diagram alur uang) |
| `money-discount.png` | Ikon diskon (diagram alur uang) |
| `money-retribution.png` | Ikon biaya retribusi (diagram alur uang) |
| `card-about.png` | Logo card "Tentang LKPD" di halaman utama |
| `card-exploration.png` | Logo card "Eksplorasi" di halaman utama |
| `card-evaluation.png` | Logo card "Evaluasi" di halaman utama |
| `logo.png` / `logo.svg` | Logo di navbar & halaman login    |
| `login-bg.png`      | Latar belakang halaman login (placeholder) |

Catatan:
- Format yang didukung: `.png`, `.jpg`, `.svg`.
- Kalau file tidak ada, aplikasi otomatis memakai placeholder emoji/gradasi, jadi
  website tetap berjalan dengan atau tanpa gambar.
- Ganti nama file sesuai nama aset yang kamu buat (cukup ikuti tabel di atas).

> Dukungan gambar untuk ilustrasi mesin akan otomatis muncul begitu kamu
> menaruh `peeling-machine.png` / `washing-machine.png` — kode tempatnya sudah
> siap di `src/pages/Exploration.jsx` (`MachineCard`).
>
> Logo 3 card utama (`card-about.png`, `card-exploration.png`,
> `card-evaluation.png`) menampilkan kotak placeholder bergaris putus-putus di
> halaman utama sampai file-nya kamu taruh — kode siap di `src/pages/Home.jsx`.

## Audio

File suara ditaruh di subfolder `audio/` — lihat [`audio/README.md`](audio/README.md).
