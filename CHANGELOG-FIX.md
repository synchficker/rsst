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

---
# Pembaruan v5 - Siap GitHub Pages dengan login Token

## Temuan analisa
1. Data CMS hanya ada di `localStorage` admin → pengunjung tidak akan melihat perubahan. **Solusi:** menu *Publikasi GitHub* menerbitkan konten ke `data/site.json` + `assets/img/` (satu commit); website membaca file itu.
2. Repositori Pages bersifat publik → data klinis & No. SIP dokter **tidak boleh** ikut. **Solusi:** hanya konten publik (whitelist) yang diterbitkan.
3. Form publik tidak bisa menulis ke inbox di hosting statis. **Solusi:** mode pengiriman WhatsApp / endpoint formulir (CMS → Kontak & Sosmed).
4. Login `admin / admin123` tidak aman untuk hosting publik. **Solusi:** login **GitHub Personal Access Token**.

## Baru
- **Login Token** (otomatis aktif di `*.github.io` atau bila `owner`/`repo` diisi di `config.js`): token divalidasi ke GitHub dan harus punya izin tulis ke repositori; opsi `allowedUsers`; token hanya di sessionStorage; sesi habis setelah 30 menit tak aktif; 5 kali gagal → jeda 30 detik. Mode lokal tetap memakai login demo dengan peringatan.
- **Publikasi GitHub**: terbit (1 commit, gambar ber-hash tidak diunggah ulang, gambar tak terpakai dibersihkan), ambil data terbit, status sinkron, deteksi data terbit lebih baru saat login, unduh `site.json` manual.
- **Website**: membaca `data/site.json`; `?preview=1` menampilkan draft; tirai anti-kedipan; fallback ke data lokal bila `site.json` tidak ada.
- **Formulir**: Otomatis / WhatsApp / Endpoint (https) / Inbox lokal.
- Berkas hosting: `config.js`, `data/site.json` awal, `404.html`, `.nojekyll`, `simrs.html` ber-`noindex`, `PANDUAN-GITHUB-PAGES.md`.

## Catatan keamanan yang tersisa
Modul klinis tetap prototipe di localStorage; Tailwind/Font Awesome dimuat dari CDN; semua yang diterbitkan (dan riwayat commit-nya) bersifat publik. Detail di `PANDUAN-GITHUB-PAGES.md`.
