# RS Sehat Sentosa - SIMRS

Sistem Informasi Manajemen Rumah Sakit (SIMRS) dengan tampilan publik modern dan panel admin lengkap.

## 📁 Struktur File

```
├── index.html              → Halaman publik (website RS)
├── public.js               → JavaScript halaman publik
├── simrs.html              → Panel admin (login Token GitHub + CMS + modul klinis)
├── simrs.js                → JavaScript panel admin
├── simrs.css               → Styling SIMRS & format cetak
├── config.js               → Konfigurasi hosting (owner/repo GitHub; otomatis terdeteksi di *.github.io)
├── data/site.json          → Data konten publik yang dibaca website (diperbarui lewat menu Publikasi)
├── assets/img/             → Gambar hasil unggahan CMS (dibuat otomatis saat publikasi)
├── 404.html, .nojekyll     → Berkas pendukung GitHub Pages
├── inbox-worker/           → Server Inbox (Cloudflare Worker + skema D1) - TIDAK dipakai GitHub Pages, di-deploy terpisah
├── data-sample.json        → Data contoh untuk import (opsional)
├── PANDUAN-GITHUB-PAGES.md → Langkah hosting, token, keamanan, pemecahan masalah
├── PANDUAN-INBOX-ONLINE.md → Menyiapkan server inbox agar pendaftaran/pesan masuk ke Panel Admin
├── DESIGN-GUIDE.md         → Panduan palet & aturan desain
├── CHANGELOG-FIX.md        → Catatan perbaikan & fitur per versi
└── README.md               → Dokumentasi ini
```

## 🌐 Halaman Publik (index.html)

Tampilan website publik rumah sakit dengan fitur:
- **Hero Slider** - Banner promosi dengan auto-slide
- **Quick Actions** - Akses cepat ke layanan utama
- **Statistik** - Counter animasi (tenaga medis, pasien, dll)
- **Layanan** - Daftar layanan unggulan (Radiologi, Lab, IGD, dll)
- **Dokter** - Profil dokter spesialis (data dari SIMRS)
- **Promo** - Penawaran khusus layanan kesehatan
- **Buat Janji** - Form pendaftaran online
- **Berita** - Artikel kesehatan terbaru
- **Testimoni** - Pengalaman pasien
- **Kontak** - Informasi kontak & formulir pesan
- **Footer** - Link cepat & informasi RS

### Fitur Interaktif:
- ✅ Data dokter otomatis dari SIMRS (localStorage)
- ✅ Informasi RS dari CMS SIMRS
- ✅ Form pendaftaran terhubung ke SIMRS
- ✅ Responsive design (mobile-friendly)
- ✅ Animasi scroll reveal
- ✅ WhatsApp floating button
- ✅ Smooth scroll navigation

## 🔐 Panel Admin SIMRS (simrs.html)

Sistem manajemen rumah sakit lengkap dengan modul:

### Pelayanan Klinis
- Data Pasien
- Pendaftaran & Rawat Jalan
- Rekam Medis Elektronik (RME)
- IGD
- Rawat Inap
- Kamar & Tempat Tidur
- Laboratorium
- Radiologi
- Farmasi & Stok Obat
- Resep & Dispensing

### Administrasi & Keuangan
- Billing & Pembayaran
- Klaim BPJS / Asuransi
- Akuntansi (Jurnal)
- Penggajian (Payroll)

### Manajemen
- Aset & Alat Medis
- SDM / Kepegawaian
- Dokter
- Poliklinik

### Sistem
- Laporan & SIRS
- CMS Rumah Sakit
- Pengguna (Admin)

### Fitur Cetak
Setiap transaksi dapat dicetak (🖨️):
- Kwitansi / Invoice
- Resep Obat
- Bukti Pendaftaran
- Hasil Lab & Radiologi
- Bukti Rawat Inap
- Laporan IGD
- Catatan Medis (RME)
- Bukti Klaim
- Slip Gaji

## 🚀 Cara Menjalankan

### Metode 1: Double-Click (Paling Mudah)
1. Pastikan semua file berada dalam **satu folder yang sama**
2. **Double-click** file `index.html`
3. Halaman publik akan terbuka di browser
4. Untuk akses admin, buka `simrs.html` (di website publik hanya ada ikon gembok kecil & samar di tengah baris copyright paling bawah)

### Metode 2: Via Web Server
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```
Lalu buka: `http://localhost:8000/`

## 🔑 Login Admin

```
Username: admin
Password: admin123
```

## 🔗 Koneksi Halaman Publik ↔ SIMRS

### Data yang Terhubung:
1. **Informasi RS** (nama, tagline, alamat) - dari CMS SIMRS
2. **Daftar Dokter** - dari modul Dokter SIMRS
3. **Poliklinik** - dari modul Poli SIMRS
4. **Pendaftaran** - form publik menambah data ke SIMRS

### Cara Kerja:
- Halaman publik membaca data dari `localStorage` (key: `simrs_db4`)
- Jika data SIMRS belum ada, menggunakan data default
- Perubahan di SIMRS admin otomatis terlihat di halaman publik
- Form pendaftaran di halaman publik menambah data ke SIMRS

## 💾 Penyimpanan Data

- Data tersimpan di **localStorage** browser
- Key: `simrs_db4`
- Data tetap ada meskipun browser ditutup
- Data bersifat **per-browser** (tidak tersinkron antar perangkat)

### Backup & Restore:
1. Buka SIMRS admin → klik **"Data JSON"**
2. **Backup**: Salin JSON → simpan ke file
3. **Restore**: Tempel JSON → klik **"Impor"**
4. **Reset**: Klik **"Reset Dummy"** untuk data awal

### Import Data Sample:
1. Buka file `data-sample.json` dengan text editor
2. Salin seluruh isi file
3. Di SIMRS admin, buka **"Data JSON"**
4. Tempel → klik **"Impor"**

## 🎨 Desain & Teknologi

### Halaman Publik:
- **Tailwind CSS** - Styling modern & responsive
- **Font Awesome** - Ikon profesional
- **Google Fonts** - Plus Jakarta Sans
- **Vanilla JavaScript** - Interaktivitas tanpa framework

### Panel Admin:
- **Tailwind CSS** (CDN) - UI framework
- **Vanilla JavaScript** - Logika aplikasi
- **localStorage** - Penyimpanan data
- **Print API** - Format cetak transaksi

## ⚠️ Catatan Penting

1. **Izinkan Popup** - Fitur cetak membuka jendela baru
2. **File Harus Satu Folder** - Semua file harus di folder yang sama
3. **Koneksi Internet** - Diperlukan saat pertama kali (CDN)
4. **Browser Modern** - Chrome, Firefox, Edge, Safari (versi terbaru)

## 📱 Responsive Design

Halaman publik fully responsive:
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px - 1920px)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 768px)

## 🔄 Sinkronisasi Data

### Dari SIMRS → Halaman Publik:
- Informasi RS (nama, tagline, alamat)
- Daftar dokter & spesialis
- Poliklinik
- Statistik (jumlah pasien, dokter, dll)

### Dari Halaman Publik → SIMRS:
- Pendaftaran baru (form buat janji)
- Pesan kontak (form hubungi kami)

## 📄 Lisensi

Aplikasi ini dibuat untuk keperluan demonstrasi dan edukasi.

## 🆘 Troubleshooting

### Halaman tidak muncul:
- Pastikan semua file dalam satu folder
- Cek browser console untuk error
- Pastikan popup tidak diblokir

### Data tidak muncul:
- Buka SIMRS admin terlebih dahulu untuk generate data
- Atau import `data-sample.json`

### Cetak tidak berfungsi:
- Izinkan popup di browser
- Cek printer sudah terhubung

---

**Dibuat dengan ❤️ untuk RS Sehat Sentosa**

---
## Pembaruan v2
Lihat `CHANGELOG-FIX.md` untuk daftar perbaikan, Hero Slider, **Inbox Website**, CRUD menu navigasi, upload gambar (dokter, promo, berita, logo, favicon), dan ketentuan ukuran gambar (v3).
Login demo: `admin` / `admin123`. Buka `index.html` (website) atau `simrs.html` (admin).


## Hosting GitHub Pages
Lihat **PANDUAN-GITHUB-PAGES.md** (login Token GitHub, menu *Publikasi GitHub*, pengaturan formulir, dan catatan keamanan).
