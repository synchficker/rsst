# Panduan Hosting ke GitHub Pages (login Token + Publikasi)

## Cara kerjanya
GitHub Pages hanya menyajikan file statis, sehingga:

| Bagian | Cara kerja |
|---|---|
| **Website publik** (`index.html`) | Membaca `data/site.json` + gambar di `assets/img/` dari repositori |
| **Panel admin** (`simrs.html`) | Login dengan **GitHub Personal Access Token**. Hanya akun yang punya akses **tulis** ke repositori ini yang bisa masuk |
| **Inbox pendaftaran & pesan** | Disimpan di **Server Inbox** (Cloudflare Worker + D1) - lihat `PANDUAN-INBOX-ONLINE.md` |
| **Publikasi** | Menu *Publikasi GitHub* mengirim konten publik ke repositori dalam **satu commit** → Pages memperbarui situs ±1–2 menit |
| **Data klinis** (pasien, RME, tagihan, dll.) | Tetap di browser admin (localStorage). **Tidak pernah dikirim ke GitHub** |

## Langkah 1 - Siapkan repositori
1. Buat repositori baru di GitHub (mis. `website-rs`). Untuk akun gratis, repositori harus **Public**.
2. Unggah **seluruh isi folder `SIMRS`** ke root repositori (bukan folder induknya). Pastikan ikut: `index.html`, `simrs.html`, `config.js`, `data/site.json`, `.nojekyll`, `404.html`.
   - Lewat web: *Add file → Upload files* (file tersembunyi `.nojekyll` boleh dibuat manual lewat *Create new file*).
3. Repositori **tidak boleh kosong** (minimal ada satu commit) - langkah di atas sudah memenuhinya.

## Langkah 2 - Aktifkan GitHub Pages
*Settings → Pages → Build and deployment → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save.*
Tunggu hingga alamat muncul: `https://<owner>.github.io/<repo>/`.

## Langkah 3 - Buat Token (fine-grained)
1. GitHub → foto profil → *Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token*.
2. **Repository access: Only select repositories** → pilih repositori website ini saja.
3. **Repository permissions → Contents: Read and write** (Metadata: Read-only otomatis).
4. **Expiration**: 30–90 hari (jangan "No expiration").
5. Generate, lalu **salin token sekarang** - hanya ditampilkan sekali (diawali `github_pat_`).

> Token = kunci penerbitan situs. Jangan dibagikan, jangan disimpan di repositori/chat. Jika bocor: *Revoke* segera di halaman token yang sama.

## Langkah 4 - Login & terbitkan
1. Buka `https://<owner>.github.io/<repo>/simrs.html` → tempel token → **Masuk dengan Token**.
   (Owner & repo terdeteksi otomatis dari alamat. Pakai domain kustom? Isi `owner` dan `repo` di `config.js`.)
2. Ubah konten di **CMS Rumah Sakit**. Ganti data **Dokter & Poli dummy** dengan data asli (menu Dokter / Poliklinik).
3. Buka **Publikasi GitHub → Publikasikan ke GitHub**. Pantau log; selesai ditandai *BERHASIL*.
4. Tunggu ±1–2 menit (lihat tab *Actions → pages build and deployment*), lalu buka situs publik.

Tombol **Pratinjau draft** membuka `index.html?preview=1` untuk melihat perubahan *sebelum* diterbitkan.

## Admin dari perangkat/browser lain
Login dengan token → bila data terbit di GitHub berbeda dari data lokal, aplikasi menawarkan **Ambil data terbit** (atau pakai tombol *Ambil data terbit* di menu Publikasi). Konten CMS ikut ter-sinkron; data klinis tidak.

## Formulir pendaftaran & kontak
Agar **Daftar Sekarang** dan **Kirim Pesan** langsung masuk ke menu **Inbox Website** (menunggu persetujuan admin), siapkan **Server Inbox** gratis mengikuti **PANDUAN-INBOX-ONLINE.md** (±15 menit), lalu isi alamatnya di **CMS → Kontak & Sosmed → Pengiriman Formulir**.

Pilihan **Cara pengiriman**:
- **Otomatis** (bawaan): Server Inbox bila alamat terisi → uji lokal memakai inbox lokal → selain itu WhatsApp.
- **Server Inbox**: selalu ke Panel Admin (disarankan).
- **WhatsApp**, **Endpoint pihak ketiga** (Formspree dll.), **Inbox lokal** (hanya uji coba).

> Tanpa Server Inbox, situs di GitHub Pages tidak bisa menyimpan kiriman pengunjung ke Panel Admin (browser pengunjung dan admin berbeda), sehingga form diarahkan ke WhatsApp agar pesan pasien tidak hilang.

## Keamanan - yang perlu Anda tahu
- Login token melindungi **panel dan penerbitan**: tanpa token dengan izin tulis, tidak ada yang bisa mengubah situs. Kode `simrs.html` sendiri tetap publik (wajar untuk situs statis).
- Token disimpan **hanya di sessionStorage tab** (hilang saat tab ditutup), tidak pernah di localStorage/repositori; sesi otomatis berakhir setelah 30 menit tanpa aktivitas; 5 kali gagal login → jeda 30 detik. Opsional: batasi akun di `allowedUsers` (`config.js`).
- Yang diterbitkan **publik**: seluruh konten CMS, gambar, serta dokter berstatus *Tampil* (nama, spesialis, poli, jadwal, foto) dan poliklinik aktif berstatus *Tampil* (nama, lokasi, deskripsi, ikon/foto). **Tidak** diterbitkan: pasien/RME/tagihan, No. SIP dokter, kata sandi pengguna, catatan internal dashboard.
- Riwayat commit menyimpan versi lama konten & gambar. Jangan pernah mengunggah informasi rahasia ke CMS.
- Halaman admin memuat Tailwind dari CDN pihak ketiga (`cdn.tailwindcss.com`). Skrip tersebut berjalan di halaman yang memegang token. Mitigasinya: token fine-grained satu repositori, masa berlaku singkat, tutup tab setelah selesai. Langkah lanjut yang disarankan: kompilasi Tailwind menjadi file CSS statis.
- **Modul klinis (pasien, RME, billing, dll.) adalah prototipe: data hanya di localStorage browser dan tanpa enkripsi/audit.** Jangan dipakai untuk data pasien nyata (ketentuan rekam medis & UU Pelindungan Data Pribadi). Untuk produksi diperlukan backend resmi (API + database + autentikasi ber-hash + audit log).
- Batas GitHub Pages (lunak): ukuran situs ±1 GB, trafik ±100 GB/bulan, ±10 build/jam.

## Pemecahan masalah
| Pesan | Penyebab / solusi |
|---|---|
| Format token tidak dikenali | Gunakan token yang diawali `github_pat_` atau `ghp_` |
| Token tidak valid atau kedaluwarsa (401) | Buat token baru |
| Token tidak memiliki izin (403) | Tambahkan **Contents: Read and write** pada token |
| Repositori/branch tidak ditemukan (404) | Token belum diberi akses ke repositori ini, atau owner/repo/branch di `config.js` salah |
| Konflik di GitHub (422) | Ada commit lain bersamaan; ulangi *Publikasikan* |
| Situs belum berubah | Tunggu build Pages (1–2 menit) lalu segarkan paksa (Ctrl+F5) |
| Login "Mode demo lokal" muncul di GitHub | Alamat bukan `*.github.io`: isi `owner` & `repo` di `config.js` |

## Uji lokal sebelum unggah
Jalankan server lokal di folder ini: `python3 -m http.server 8000` → buka `http://localhost:8000/`. Tanpa `owner`/`repo`, panel admin berjalan dalam **mode demo** (login `admin` / `admin123`, **tidak aman** - hanya untuk uji).

> Catatan: alur publikasi dan login token telah diuji dengan simulasi API GitHub. Lakukan percobaan pertama pada repositori uji sebelum dipakai di repositori produksi.
