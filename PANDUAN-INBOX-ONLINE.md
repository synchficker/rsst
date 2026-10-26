# Panduan Server Inbox Online (Pendaftaran & Pesan → Panel Admin)

## Mengapa perlu server inbox?
Website di GitHub Pages hanya file statis. Inbox versi awal tersimpan di *localStorage* (memori browser), jadi kiriman pengunjung hanya "terlihat" di browser pengunjung itu sendiri - **tidak pernah sampai ke browser admin**. Agar **Pendaftaran Online** dan **Pesan Masuk** langsung masuk ke Panel Admin dan menunggu persetujuan admin, dibutuhkan satu penyimpanan bersama di internet. Paket ini menyediakannya dengan **Cloudflare Worker + database D1** (tersedia paket gratis).

```
Pengunjung → [Website GitHub Pages] → POST /submit → [Server Inbox (Worker + D1)]
                                                         ↑ GET/PATCH/DELETE /inbox  (dengan token GitHub admin)
                                                  [Panel Admin → menu Inbox Website → Terima / Tolak]
```

- **Pengunjung**: kirim form → data langsung tersimpan di server → muncul kode booking (mis. `JNJ-261027-001`).
- **Admin**: menu **Inbox Website** menampilkan kiriman (badge merah di sidebar, diperiksa tiap 60 detik) → **Terima** (membuat/mencocokkan pasien + pendaftaran + nomor antrian di SIMRS) atau **Tolak** / **Hapus**.
- **Siapa yang boleh membuka inbox?** Hanya pemilik token GitHub yang punya izin **tulis** ke repositori website (diverifikasi server langsung ke GitHub). Token yang sama dengan login panel admin.
- Sistem tidak mengirim notifikasi otomatis ke pasien; petugas menghubungi pasien (tombol "WA" tersedia di tabel).

## Siapkan sekali (±15 menit)
Anda butuh akun Cloudflare gratis. Tampilan dashboard dapat sedikit berbeda dari uraian ini.

### 1. Buat database D1
1. Dashboard Cloudflare → **Storage & Databases → D1 SQL Database → Create database** → nama: `inbox_rs`.
2. Buka database → tab **Console** → tempel seluruh isi `inbox-worker/schema.sql` → **Execute**.

### 2. Buat Worker
1. **Workers & Pages → Create → Create Worker** → nama: `inbox-rs` → **Deploy**.
2. **Edit code** → hapus isi bawaan → tempel seluruh isi `inbox-worker/worker.js` → **Deploy**.
3. Catat alamat Worker: `https://inbox-rs.<akun-anda>.workers.dev`.
4. Alamat Worker saat ini: https://inbox-rs.synchficker.workers.dev/

### 3. Hubungkan database & isi variabel
Di halaman Worker → **Settings**:
- **Bindings → Add → D1 database** → *Variable name* **`DB`** → pilih `inbox_rs`.
- **Variables and Secrets → Add** (tipe *Text*):

| Nama | Isi | Keterangan |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://OWNER.github.io` | **Wajib.** Asal website & panel admin, tanpa garis miring/path di akhir. Beberapa asal dipisah koma (mis. domain kustom). |
| `GITHUB_OWNER` | `OWNER` | **Wajib.** Pemilik repositori website |
| `GITHUB_REPO` | `REPO` | **Wajib.** Nama repositori website |
| `ADMIN_USERS` | `akun1,akun2` | Opsional: batasi akun GitHub yang boleh membuka inbox |
| `RETENTION_DAYS` | `180` | Opsional: lama penyimpanan data (hari). Bawaan 180, minimal 7 |
| `MAX_PER_DAY` | `500` | Opsional: batas kiriman per 24 jam |

Simpan lalu **Deploy** ulang. Cek `https://inbox-rs.<akun>.workers.dev/health` → harus menampilkan `{"ok":true}`.

> Alternatif CLI: isi `inbox-worker/wrangler.toml`, lalu `npx wrangler d1 create inbox_rs`, `npx wrangler d1 execute inbox_rs --remote --file=schema.sql`, `npx wrangler deploy`.

### 4. Isi alamat di CMS lalu terbitkan
1. Panel Admin → **CMS → Kontak & Sosmed → Pengiriman Formulir**.
2. **Alamat Server Inbox** = alamat Worker (mis. `https://inbox-rs.akun.workers.dev`).
3. **Cara pengiriman** = *Server Inbox* (atau *Otomatis*, yang memakai server inbox bila alamat terisi). **Simpan Perubahan**.
4. **Publikasi GitHub → Publikasikan**. Tunggu ±1–2 menit.

### 5. Uji
Buka website → isi **Daftar Sekarang** → muncul kode booking → buka **Inbox Website** di Panel Admin (klik *Muat ulang* bila perlu) → pendaftaran tampil dengan label *Server* → **Terima**.

## Cara kerja mode "Otomatis"
1. Alamat Server Inbox terisi → kirim ke **Server Inbox**.
2. Belum terisi dan website dibuka dari `localhost`/file lokal → **Inbox lokal** (uji coba di satu browser, seperti versi awal).
3. Belum terisi dan website sudah online → **WhatsApp** (agar pesan pasien tidak hilang diam-diam).

## Keamanan & privasi
- Server hanya menerima data yang lolos validasi (panjang, format telepon/email/tanggal), memakai **honeypot**, membatasi **5 kiriman / 10 menit / perangkat** dan batas harian, serta menolak asal (Origin) selain `ALLOWED_ORIGINS`.
- Alamat IP **tidak** disimpan bersama data; hanya hash singkat di tabel pembatas yang dihapus otomatis.
- Data lebih lama dari `RETENTION_DAYS` dihapus otomatis. Hapus kiriman yang sudah selesai diproses dari menu Inbox.
- Data kontak dan keluhan pengunjung adalah **data pribadi** yang disimpan di infrastruktur Cloudflare: sesuaikan **Kebijakan Privasi** (CMS → Kebijakan & Syarat) dan minta peninjauan penasihat hukum. Jangan meminta riwayat medis rinci lewat form.
- Server memverifikasi token admin ke GitHub dan menyimpan hasilnya 5 menit; mencabut token di GitHub berlaku penuh setelah masa itu.
- Batas paket gratis Cloudflare (permintaan Worker per hari, kuota D1) cukup besar untuk klinik pada umumnya; periksa halaman harga Cloudflare untuk angka terbaru.

## Pemecahan masalah
| Gejala | Penyebab / solusi |
|---|---|
| Form mengarah ke WhatsApp | Alamat Server Inbox belum diisi/terbit, atau cara pengiriman = WhatsApp |
| "Origin tidak diizinkan" | `ALLOWED_ORIGINS` salah. Harus persis `https://OWNER.github.io` (tanpa `/repo`, tanpa `/` akhir) |
| "Server belum dikonfigurasi (binding database DB)" | Binding D1 belum dibuat dengan nama variabel `DB` |
| "Token tidak memiliki akses/izin" di Inbox | Token belum diberi akses tulis ke repositori; atau `GITHUB_OWNER`/`GITHUB_REPO` salah |
| Inbox admin kosong tetapi pengunjung sukses | Admin belum login token, alamat server di CMS belum sama, atau klik *Muat ulang* |
| "Terlalu banyak kiriman" (429) | Pembatas per perangkat/harian; tunggu beberapa menit atau naikkan `MAX_PER_DAY` |

> Catatan: logika server dan alurnya diuji dengan database SQLite dan GitHub API tiruan, bukan di Cloudflare/GitHub asli. Lakukan uji pertama (langkah 5) sebelum website dipublikasikan ke pasien.
