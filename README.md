# RS Sehat Sentosa - SIMRS

Sistem Informasi Manajemen Rumah Sakit (SIMRS) Siraja Tega ini dengan tampilan publik modern dan panel admin lengkap.

## 📁 Struktur File

```
├── index.html              → Halaman publik (landing page / beranda website)
├── public.js               → JavaScript halaman publik
├── simrs.html              → Panel admin SIMRS (login + CMS + modul klinis)
├── simrs.js                → JavaScript aplikasi SIMRS
├── simrs.css               → Styling SIMRS & format cetak
├── data-sample.json        → Data contoh untuk import (opsional)
├── DESIGN-GUIDE.md         → Panduan palet & aturan desain (dokumentasi)
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
Password: Minta ke WhatsApp Sin.Can
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


# Panduan Desain Visual - RS Sehat Sentosa

## 🎨 Palet Warna Brand

### Primary Colors (Biru)
```
Blue 50:   #eff6ff  (Backgrounds, hover states)
Blue 100:  #dbeafe  (Light backgrounds, badges)
Blue 200:  #bfdbfe  (Borders, dividers)
Blue 500:  #3b82f6  (Secondary buttons)
Blue 600:  #2563eb  (PRIMARY - Buttons, links, active states)
Blue 700:  #1d4ed8  (Hover states, dark accents)
Blue 800:  #1e40af  (Dark backgrounds, headers)
Blue 900:  #1e3a8a  (Darkest backgrounds)
```

### Accent Colors
```
Red 600:   #dc2626  (Emergency, IGD, critical alerts)
Amber 400: #fbbf24  (Star ratings, warnings)
Green 500: #22c55e  (Success states, WhatsApp)
```

### Neutral Colors
```
Slate 50:  #f8fafc  (Light backgrounds)
Slate 100: #f1f5f9  (Page backgrounds)
Slate 600: #475569  (Secondary text)
Slate 700: #334155  (Primary text)
Slate 800: #1e293b  (Headings)
Slate 900: #0f172a  (Dark backgrounds)
```

## 📐 Aturan Desain Visual

### 1. Hierarki Warna
- **Primary Action**: Blue 600 (#2563eb)
  - Tombol CTA utama
  - Link aktif
  - Icon aktif
  - Border focus

- **Secondary Action**: Blue 500 (#3b82f6)
  - Tombol sekunder
  - Badge informasi

- **Danger/Emergency**: Red 600 (#dc2626)
  - IGD 24 Jam
  - Peringatan kritis
  - Hapus data

- **Success**: Green 500 (#22c55e)
  - Status sukses
  - WhatsApp button
  - Konfirmasi

### 2. Penggunaan Gradient

#### Hero Section
```css
/* Primary gradient */
background: linear-gradient(135deg, rgba(37, 99, 235, 0.92) 0%, rgba(29, 78, 216, 0.75) 100%);

/* Emergency gradient */
background: linear-gradient(135deg, rgba(220, 38, 38, 0.92) 0%, rgba(185, 28, 28, 0.75) 100%);
```

#### Card Backgrounds
```css
/* Blue gradient cards */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
```

### 3. Shadow & Elevation

#### Card Shadows
```css
/* Default card */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

/* Hover card */
box-shadow: 0 20px 40px rgba(37, 99, 235, 0.12);

/* Button shadow */
box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.25);
```

### 4. Border & Dividers

#### Border Colors
```css
/* Light borders */
border-color: #e2e8f0;  /* slate-200 */

/* Brand borders */
border-color: #2563eb;  /* blue-600 */

/* Accent borders */
border-color: #dc2626;  /* red-600 for IGD */
```

#### Border Width
- Cards: `border-t-4` (4px top border untuk accent)
- Dividers: `border` (1px standard)
- Focus: `ring-2` (2px ring untuk focus states)

### 5. Typography Colors

```css
/* Headings */
color: #1e293b;  /* slate-800 */

/* Primary text */
color: #334155;  /* slate-700 */

/* Secondary text */
color: #475569;  /* slate-600 */

/* Muted text */
color: #64748b;  /* slate-500 */

/* Brand text */
color: #2563eb;  /* blue-600 */

/* Brand dark text */
color: #1e40af;  /* blue-800 */
```

### 6. Interactive States

#### Button States
```css
/* Default */
background: #2563eb;  /* blue-600 */

/* Hover */
background: #1d4ed8;  /* blue-700 */

/* Active */
background: #1e40af;  /* blue-800 */

/* Disabled */
background: #94a3b8;  /* slate-400 */
opacity: 0.6;
```

#### Link States
```css
/* Default */
color: #2563eb;  /* blue-600 */

/* Hover */
color: #1d4ed8;  /* blue-700 */

/* Visited */
color: #1e40af;  /* blue-800 */
```

### 7. Background Patterns

#### Section Backgrounds
```css
/* Light sections */
background: #f8fafc;  /* slate-50 */

/* Brand light */
background: #eff6ff;  /* blue-50 */

/* Brand medium */
background: #dbeafe;  /* blue-100 */

/* Brand dark (CTA sections) */
background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
```

### 8. Icon Colors

```css
/* Primary icons */
color: #2563eb;  /* blue-600 */

/* Secondary icons */
color: #64748b;  /* slate-500 */

/* Danger icons */
color: #dc2626;  /* red-600 */

/* Success icons */
color: #22c55e;  /* green-500 */

/* Warning icons */
color: #f59e0b;  /* amber-500 */
```

### 9. Badge & Tag Colors

```css
/* Info badge */
background: #dbeafe;  /* blue-100 */
color: #1e40af;       /* blue-800 */

/* Success badge */
background: #dcfce7;  /* green-100 */
color: #166534;       /* green-800 */

/* Warning badge */
background: #fef3c7;  /* amber-100 */
color: #92400e;       /* amber-800 */

/* Danger badge */
background: #fee2e2;  /* red-100 */
color: #991b1b;       /* red-800 */
```

### 10. Form Elements

#### Input Fields
```css
/* Border */
border: 1px solid #cbd5e1;  /* slate-300 */

/* Focus */
border-color: #2563eb;      /* blue-600 */
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);

/* Error */
border-color: #dc2626;      /* red-600 */
box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
```

## 🎯 Prinsip Desain

### 1. Konsistensi
- Gunakan Blue 600 untuk semua primary actions
- Gunakan Red 600 HANYA untuk emergency/IGD
- Pertahankan hierarki warna di seluruh aplikasi

### 2. Kontras
- Pastikan kontras minimum 4.5:1 untuk teks
- White text on Blue 600: ✅ (kontras baik)
- Blue 600 text on White: ✅ (kontras baik)

### 3. Aksesibilitas
- Jangan gunakan warna saja untuk menyampaikan informasi
- Selalu tambahkan icon atau teks pendukung
- Pastikan focus states terlihat jelas

### 4. Hierarki Visual
- Primary: Blue 600 (paling menonjol)
- Secondary: Blue 500 (kurang menonjol)
- Neutral: Slate (background, teks)
- Accent: Red/Amber (perhatian khusus)

## 📱 Responsive Design

### Breakpoints
```css
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

### Color Adjustments
- Mobile: Gunakan warna lebih saturated untuk visibility
- Desktop: Bisa gunakan warna lebih soft untuk elegance

## 🔧 Implementasi

### Tailwind CSS Classes

#### Primary Button
```html
<button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-blue-200">
  Button
</button>
```

#### Secondary Button
```html
<button class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-3 rounded-lg font-semibold">
  Button
</button>
```

#### Danger Button
```html
<button class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold">
  Emergency
</button>
```

#### Card with Border Accent
```html
<div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-600">
  Content
</div>
```

#### Section with Brand Background
```html
<section class="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20">
  Content
</section>
```

## ✅ Checklist Desain

- [ ] Semua primary actions menggunakan Blue 600
- [ ] Emergency/IGD menggunakan Red 600
- [ ] Konsisten menggunakan color palette
- [ ] Kontras warna memenuhi standar aksesibilitas
- [ ] Hover states terlihat jelas
- [ ] Focus states untuk form elements
- [ ] Gradient digunakan untuk section hero/CTA
- [ ] Shadow konsisten untuk elevation
- [ ] Border accent untuk card highlights
- [ ] Typography hierarchy jelas

---

**Versi**: 1.0
**Terakhir Diperbarui**: 2026
**Brand**: RS Sehat Sentosa - Biru (#2563eb)



# Catatan Perbaikan (v2)

## Hero Slider (baru)
- Panah kiri/kanan (desktop), tombol prev/next + titik slide (semua layar), tombol jeda/putar
- Autoplay dengan progress bar, berhenti saat mouse di atas slider / fokus keyboard / tab tidak aktif
- Geser (swipe) di layar sentuh, tombol keyboard ← → Home End
- Hormati `prefers-reduced-motion` (autoplay mati otomatis)
- Gambar latar per slide (URL atau unggah dari komputer), 4 pilihan warna overlay
- Pengaturan autoplay & durasi di CMS → Hero Slider

## Bug yang diperbaiki
| # | Masalah | Dampak sebelumnya |
|---|---------|-------------------|
| 1 | Slider menyimpan referensi elemen lama | Setelah data CMS dimuat, slide tidak berpindah / titik tidak berfungsi |
| 2 | Slide non-aktif masih bisa diklik | Tombol slide yang terlihat bukan yang terklik |
| 3 | Titik slider tertutup kartu "Quick Actions" | Navigasi tidak terlihat |
| 4 | Editor CMS memakai snapshot HTML lama per tab | Pindah tab lalu kembali menimpa edit dengan nilai lama |
| 5 | Field ber-underscore (`telepon_igd`, `jam_*`, `stat_*`, `tentang_*`) tidak pernah disimpan | Edit kontak/jam/statistik/tentang hilang diam-diam |
| 6 | Tambah/Hapus item mengembalikan ke tab Info & membuang edit | Kerja hilang |
| 7 | Tombol di dalam form tanpa `type="button"` | Bisa memicu submit tak disengaja |
| 8 | Form pendaftaran publik hardcode pasien/poli/dokter = 1, field tanpa `name` | Data pendaftaran selalu salah |
| 9 | Halaman publik menulis DB parsial ke `simrs_db4` | Panel admin crash / data admin tertimpa |
| 10 | Telepon, email, jam, sosmed, footer, nama RS di halaman publik statis | Edit CMS tidak berefek |
| 11 | `save()` menelan error quota localStorage | Data hilang tanpa peringatan |
| 12 | Impor JSON tanpa normalisasi; Font Awesome tidak dimuat di admin; bagi-nol di BOR; tabel selalu fokus ke kolom cari | Error / ikon hilang / keyboard mobile muncul |
| 13 | Link `href="#"` melompat ke atas; kontak/footer/cetak kuitansi hardcode | UX & data tidak konsisten |

## Fitur baru
- **Inbox Website** (menu Sistem): pendaftaran online & pesan kontak dari website; tombol *Terima* membuat/mencocokkan pasien dan mencatat Pendaftaran + nomor antrian; badge jumlah baru di sidebar
- Form publik: validasi, kode booking, poli/dokter dari data SIMRS, honeypot anti-bot, isi otomatis dari tombol "Buat Janji" dokter / "Pesan" promo
- CMS: urutkan item (↑↓), unggah gambar hero, isi artikel berita lengkap (modal "Baca Selengkapnya"), tombol Lihat Website
- Website: cari & filter dokter, peta Google Maps dari alamat, scrollspy menu, section otomatis tersembunyi bila semua itemnya nonaktif, URL CMS disaring (`javascript:` ditolak)
- Admin: backup .json (unduh/pilih file), login semua user + jeda 30 dtk setelah 5 gagal, tutup modal dengan Esc

## Keterbatasan (penting untuk produksi)
Seluruh data tersimpan di `localStorage` browser dan kata sandi disimpan apa adanya. Ini cocok untuk prototipe/demo,
**bukan** untuk data pasien nyata. Untuk produksi diperlukan backend (API + database + autentikasi ber-hash + audit log).
Website publik dan admin hanya berbagi data bila dibuka dari browser & origin yang sama.

---
# Pembaruan v3

## CMS Rumah Sakit (Panel Admin)
- **Menu Atas** & **Menu Bawah**: CRUD lengkap (tambah, ubah, hapus, urutkan ↑↓, aktif/nonaktif, buka di tab baru). Menu bawah punya dua area: *Kolom Link Cepat* dan *Baris bawah* (di samping copyright), plus judul kolom yang bisa diganti. Menu ke section yang kosong otomatis disembunyikan.
- **Upload gambar** untuk Dokter (tab *Foto Dokter*, + opsi tampil/sembunyikan dokter di website), Promo, Berita, serta Hero Slider.
- **Logo & Favicon** (tab *Tentang RS & Logo*): logo tampil di navbar, footer, dan bagian Tentang; favicon di tab browser (website & panel admin).
- **Keterangan ukuran gambar** di setiap kolom gambar, dan ditegakkan saat upload:

| Gambar | Ukuran ideal | Maks. file | Hasil akhir |
|---|---|---|---|
| Hero | 1920 × 800 px | 5 MB | ≤ 1600 px, ≤ 450 KB |
| Foto Dokter | 400 × 400 px (1:1) | 2 MB | dipotong 1:1, ≤ 70 KB |
| Promo / Berita | 800 × 450 px (16:9) | 3 MB | dipotong 16:9, ≤ 110 KB |
| Logo | maks. 400 × 400 px (PNG transparan) | 1 MB | ≤ 100 KB |
| Favicon | 128 × 128 px | 512 KB | ≤ 40 KB |

  Semua: resolusi file asli maks. 6000 × 6000 px, format JPG/PNG/WebP. Gambar otomatis dipotong/diperkecil dan dikompres; file di luar batas ditolak dengan pesan jelas.
- Indikator pemakaian penyimpanan browser (±5 MB) di editor CMS.

## Website publik
- Tombol **Login Admin dihapus** dari header (top bar & menu mobile) dan dari kolom Kontak footer.
- Akses admin kini hanya **ikon gembok kecil & samar** (opacity ±20%, tanpa teks/tooltip) di tengah baris copyright paling bawah; jelas hanya saat di-hover/fokus keyboard.
- Navbar, menu mobile, dan footer dibangun dari data CMS.
- Foto dokter, gambar promo, gambar berita (kartu & header modal) tampil bila diunggah; bila tidak, tampilan ikon/gradien bawaan tetap dipakai.

## Catatan teknis
- Gambar disimpan sebagai data URL di localStorage bersama data lainnya (batas ±5 MB per browser). Karena itu ukuran hasil dibatasi ketat; jika banyak foto, pantau indikator penyimpanan dan lakukan backup.
- Untuk produksi, simpan gambar di server/object storage dan hanya simpan URL-nya.

---
# Pembaruan v4

## Bagian "Mengapa Memilih Kami?" bisa diedit
CMS → tab **Tentang RS & Logo** → bagian *Mengapa Memilih Kami?*: judul bagian, serta tambah / ubah / hapus / urutkan / aktif-nonaktifkan tiap keunggulan (judul, deskripsi, icon Font Awesome). Bila tidak ada item aktif, kartu disembunyikan otomatis.

## Kebijakan Privasi & Syarat Ketentuan
- Tampil sebagai **modal** di website: dari tautan footer, catatan persetujuan di bawah formulir pendaftaran & kontak, atau tautan langsung `index.html#kebijakan-privasi` / `#syarat-ketentuan`. Esc / klik latar / tombol "Saya Mengerti" menutup; ada tab untuk berpindah antar dokumen.
- CMS → tab **Kebijakan & Syarat**: judul, tanggal pembaruan, isi, aktif/nonaktif, pratinjau, dan tombol kembalikan ke teks bawaan.
- Format isi: `## Judul`, `- poin`, `1. poin berurut`, `**tebal**`, baris kosong = paragraf. Placeholder `{{nama}} {{alamat}} {{telepon}} {{telepon_igd}} {{email}} {{whatsapp}}` diisi otomatis dari data RS. Seluruh teks di-escape (aman dari injeksi HTML).
- Dokumen kosong/nonaktif: tautan footer & catatan persetujuan otomatis disembunyikan. Tautan lama `#` berlabel Kebijakan/Syarat dimigrasi otomatis.
- **Teks bawaan hanya template umum** - sesuaikan dan minta peninjauan penasihat hukum sebelum dipublikasikan.

## Perapian file
| File | Status | Alasan |
|---|---|---|
| `index-public.html` | **digabung ke `index.html`** | `index.html` lama hanya halaman pengalih (meta refresh + JS) ke `index-public.html`. Sekarang `index.html` adalah website itu sendiri: satu langkah lebih cepat, tanpa kedipan redirect, dan URL beranda standar. |
| `App.tsx` | **dihapus** | Sisa template React; tidak dimuat oleh HTML manapun dan tidak ada bundler/package.json. Isinya hanya pengalih yang sama + teks bantuan. |
| `DESIGN-GUIDE.md`, `data-sample.json`, `README.md`, `CHANGELOG-FIX.md` | dipertahankan | Dokumentasi / data contoh opsional (tidak dibutuhkan saat berjalan). |
| `simrs.css`, `simrs.html`, `simrs.js`, `public.js` | dipertahankan | Dipakai aplikasi. |

Catatan: alamat lama `index-public.html` tidak ada lagi. Jika pernah dibagikan/di-bookmark, ganti ke `index.html`.

