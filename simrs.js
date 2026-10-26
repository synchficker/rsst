/* ========================================
   SIMRS - Sistem Informasi Rumah Sakit
   File: simrs.js
   ======================================== */

// ===== DATA GENERATORS =====
const FN = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rina', 'Andi', 'Eko', 'Sri', 'Hadi', 'Wati', 'Joko', 'Ani', 'Rudi', 'Lina', 'Fajar', 'Maya', 'Dian', 'Yoga', 'Nina', 'Bayu'];
const LN = ['Santoso', 'Wijaya', 'Pratama', 'Lestari', 'Hidayat', 'Kusuma', 'Saputra', 'Nugroho', 'Rahayu', 'Setiawan', 'Putri', 'Firmansyah', 'Wibowo'];
const DX = ['J06.9 ISPA', 'I10 Hipertensi', 'E11 Diabetes Melitus', 'K29 Gastritis', 'A09 Diare', 'J18 Pneumonia', 'M54 Nyeri punggung', 'N39 ISK'];
const KL = ['Demam', 'Batuk pilek', 'Nyeri dada', 'Sakit kepala', 'Mual muntah', 'Nyeri perut', 'Sesak napas', 'Pusing'];
const SP = ['Umum', 'Anak', 'Penyakit Dalam', 'Bedah', 'Kandungan', 'Jantung', 'Saraf', 'THT', 'Mata', 'Kulit', 'Gigi', 'Paru', 'Ortopedi', 'Urologi', 'Jiwa', 'Gizi', 'Rehab Medik', 'Onkologi', 'Ginjal', 'Bedah Saraf', 'Anestesi', 'Patologi', 'Radiologi', 'Endokrin', 'Geriatri'];

const pad = n => String(n).padStart(2, '0');
const P = (a, i, s) => a[(i * s + s) % a.length];
const dt = i => `2026-${pad(1 + i % 10)}-${pad(1 + i * 3 % 28)}`;
const nm = i => P(FN, i, 3) + ' ' + P(LN, i, 7);
const r = (i, s, n = 50) => 1 + (i * s) % n;
const rp = (i, s, m) => (1 + (i * s) % m) * 1e5;

// ===== SCHEMA DEFINITIONS =====
const S = {
  pasien: {
    t: 'Data Pasien', lbl: 'nama',
    f: [['no_rm', 'No. RM'], ['nama', 'Nama'], ['nik', 'NIK'], ['tgl_lahir', 'Tgl Lahir', 'date'], ['jk', 'JK', 'sel', ['L', 'P']], ['alamat', 'Alamat'], ['telp', 'Telepon'], ['penjamin', 'Penjamin', 'sel', ['Umum', 'BPJS', 'Asuransi']]],
    g: i => ({ no_rm: 'RM-' + (1000 + i), nama: nm(i), nik: '3171' + String(1e11 + i * 76543217), tgl_lahir: `${1950 + i % 50}-${pad(1 + i % 12)}-${pad(1 + i % 28)}`, jk: i % 2 ? 'P' : 'L', alamat: `Jl. Mawar No. ${i + 1}, Jakarta`, telp: '0812' + String(1e7 + i * 54321).slice(0, 8), penjamin: P(['Umum', 'BPJS', 'Asuransi'], i, 2) })
  },
  poli: {
    t: 'Poliklinik', lbl: 'nama',
    f: [['kode', 'Kode'], ['nama', 'Nama Poli'], ['lokasi', 'Lokasi'], ['status', 'Status', 'sel', ['Aktif', 'Nonaktif']]],
    g: i => ({ kode: 'PL' + pad(i + 1), nama: `Poli ${SP[i % 25]} (${i < 25 ? 'Reguler' : 'Eksekutif'})`, lokasi: `Gedung ${'ABC'[i % 3]} Lt. ${1 + i % 3}`, status: i % 17 ? 'Aktif' : 'Nonaktif' })
  },
  dokter: {
    t: 'Dokter', lbl: 'nama',
    f: [['nama', 'Nama Dokter'], ['spesialis', 'Spesialis'], ['poli', 'Poli', 'ref', 'poli'], ['sip', 'No. SIP'], ['jadwal', 'Jadwal Praktik']],
    g: i => ({ nama: 'dr. ' + nm(i + 5) + (i % 2 ? ', Sp.' + SP[i % 25].split(' ')[0] : ''), spesialis: SP[i % 25], poli: r(i, 3), sip: 'SIP/' + (2000 + i * 13) + '/2026', jadwal: P(['Sen-Rab 08-12', 'Sel-Kam 13-17', 'Jum-Sab 09-13', 'Sen-Jum 10-14'], i, 1) })
  },
  pendaftaran: {
    t: 'Pendaftaran & Rawat Jalan',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['poli', 'Poli', 'ref', 'poli'], ['dokter', 'Dokter', 'ref', 'dokter'], ['antrian', 'No. Antrian'], ['status', 'Status', 'sel', ['Terdaftar', 'Dilayani', 'Selesai', 'Batal']]],
    g: i => ({ tgl: dt(i), pasien: r(i, 7), poli: r(i, 3), dokter: r(i, 11), antrian: 'A-' + pad(i + 1), status: P(['Terdaftar', 'Dilayani', 'Selesai', 'Batal'], i, 3) })
  },
  rme: {
    t: 'Rekam Medis Elektronik',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['dokter', 'Dokter', 'ref', 'dokter'], ['keluhan', 'Keluhan'], ['diagnosa', 'Diagnosa (ICD-10)'], ['tindakan', 'Tindakan'], ['catatan', 'Catatan/SOAP', 'text']],
    g: i => ({ tgl: dt(i), pasien: r(i, 13), dokter: r(i, 7), keluhan: P(KL, i, 5), diagnosa: P(DX, i, 3), tindakan: P(['Pemeriksaan fisik', 'Nebulizer', 'Injeksi', 'Hecting', 'Edukasi'], i, 2), catatan: 'S: keluhan sejak 3 hari. O: TD 120/80, N 82. A/P: sesuai diagnosa, terapi oral.' })
  },
  igd: {
    t: 'IGD',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['triase', 'Triase', 'sel', ['Merah', 'Kuning', 'Hijau', 'Hitam']], ['keluhan', 'Keluhan'], ['dokter', 'Dokter Jaga', 'ref', 'dokter'], ['status', 'Status', 'sel', ['Penanganan', 'Observasi', 'Dirujuk', 'Pulang']]],
    g: i => ({ tgl: dt(i), pasien: r(i, 17), triase: P(['Merah', 'Kuning', 'Hijau', 'Hijau', 'Hitam'], i, 3), keluhan: P(KL, i, 3), dokter: r(i, 19), status: P(['Penanganan', 'Observasi', 'Dirujuk', 'Pulang'], i, 3) })
  },
  kamar: {
    t: 'Kamar & Tempat Tidur', lbl: 'kode',
    f: [['kode', 'Kode Kamar'], ['bangsal', 'Bangsal'], ['kelas', 'Kelas', 'sel', ['VIP', 'I', 'II', 'III']], ['tarif', 'Tarif/Hari', 'num'], ['status', 'Status', 'sel', ['Kosong', 'Terisi', 'Perawatan']]],
    g: i => ({ kode: `K-${100 + i}`, bangsal: P(['Melati', 'Mawar', 'Anggrek', 'Dahlia', 'Teratai'], i, 2), kelas: P(['VIP', 'I', 'II', 'III'], i, 3), tarif: [1500000, 800000, 500000, 300000][(i * 3 + 3) % 4], status: P(['Kosong', 'Terisi', 'Terisi', 'Perawatan'], i, 3) })
  },
  rawat_inap: {
    t: 'Rawat Inap',
    f: [['pasien', 'Pasien', 'ref', 'pasien'], ['kamar', 'Kamar', 'ref', 'kamar'], ['dokter', 'DPJP', 'ref', 'dokter'], ['masuk', 'Tgl Masuk', 'date'], ['keluar', 'Tgl Keluar', 'date'], ['diagnosa', 'Diagnosa'], ['status', 'Status', 'sel', ['Dirawat', 'Pulang']]],
    g: i => ({ pasien: r(i, 23), kamar: r(i, 7), dokter: r(i, 9), masuk: dt(i), keluar: i % 3 ? dt(i + 2) : '', diagnosa: P(DX, i, 5), status: i % 3 ? 'Pulang' : 'Dirawat' })
  },
  lab: {
    t: 'Laboratorium',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['periksa', 'Pemeriksaan'], ['hasil', 'Hasil'], ['rujukan', 'Nilai Rujukan'], ['status', 'Status', 'sel', ['Diproses', 'Selesai']]],
    g: i => ({ tgl: dt(i), pasien: r(i, 29), periksa: P(['Darah Lengkap', 'Gula Darah', 'Kolesterol', 'Asam Urat', 'Urinalisis', 'SGOT/SGPT'], i, 1), hasil: String(60 + i * 3 % 140), rujukan: P(['70-110', '<200', '3.5-7.2', 'Negatif'], i, 1), status: i % 4 ? 'Selesai' : 'Diproses' })
  },
  radiologi: {
    t: 'Radiologi',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['modalitas', 'Modalitas', 'sel', ['Rontgen', 'USG', 'CT Scan', 'MRI']], ['area', 'Area'], ['kesan', 'Kesan'], ['status', 'Status', 'sel', ['Dijadwalkan', 'Selesai']]],
    g: i => ({ tgl: dt(i), pasien: r(i, 31), modalitas: P(['Rontgen', 'USG', 'CT Scan', 'MRI'], i, 3), area: P(['Thorax', 'Abdomen', 'Kepala', 'Lutut', 'Pelvis'], i, 2), kesan: P(['Normal', 'Infiltrat minimal', 'Tidak tampak kelainan', 'Perlu korelasi klinis'], i, 3), status: i % 5 ? 'Selesai' : 'Dijadwalkan' })
  },
  obat: {
    t: 'Farmasi & Stok Obat', lbl: 'nama',
    f: [['kode', 'Kode'], ['nama', 'Nama Obat'], ['kategori', 'Kategori', 'sel', ['Tablet', 'Sirup', 'Injeksi', 'Salep', 'Alkes']], ['stok', 'Stok', 'num'], ['stok_min', 'Stok Minimum', 'num'], ['harga', 'Harga', 'num']],
    g: i => ({ kode: 'OB' + pad(i + 1), nama: P(['Paracetamol', 'Amoxicillin', 'Omeprazole', 'Metformin', 'Amlodipine', 'Cetirizine', 'Ibuprofen', 'Ranitidine', 'Simvastatin', 'Salbutamol'], i, 1) + ' ' + (100 + i * 25) + ' mg', kategori: P(['Tablet', 'Sirup', 'Injeksi', 'Salep', 'Alkes'], i, 3), stok: (i * 37) % 300, stok_min: 50, harga: 2000 + i * 850 })
  },
  resep: {
    t: 'Resep & Dispensing',
    f: [['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['dokter', 'Dokter', 'ref', 'dokter'], ['obat', 'Obat', 'ref', 'obat'], ['jumlah', 'Jumlah', 'num'], ['status', 'Status', 'sel', ['Menunggu', 'Disiapkan', 'Diserahkan']]],
    g: i => ({ tgl: dt(i), pasien: r(i, 37), dokter: r(i, 13), obat: r(i, 17), jumlah: 1 + i % 30, status: P(['Menunggu', 'Disiapkan', 'Diserahkan'], i, 2) })
  },
  tagihan: {
    t: 'Billing & Pembayaran', lbl: 'no',
    f: [['no', 'No. Tagihan'], ['tgl', 'Tanggal', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['total', 'Total', 'num'], ['dibayar', 'Dibayar', 'num'], ['metode', 'Metode', 'sel', ['Tunai', 'Debit', 'QRIS', 'Transfer', 'BPJS']], ['status', 'Status', 'sel', ['Belum Bayar', 'Sebagian', 'Lunas']]],
    g: i => { const t = rp(i, 7, 40) + 5e4, b = [0, t / 2, t][i % 3]; return { no: 'INV-26' + (1000 + i), tgl: dt(i), pasien: r(i, 41), total: t, dibayar: b, metode: P(['Tunai', 'Debit', 'QRIS', 'Transfer', 'BPJS'], i, 3), status: ['Belum Bayar', 'Sebagian', 'Lunas'][i % 3] } },
    calc: o => { o.status = +o.dibayar >= +o.total ? 'Lunas' : +o.dibayar > 0 ? 'Sebagian' : 'Belum Bayar' }
  },
  klaim: {
    t: 'Klaim BPJS / Asuransi',
    f: [['no', 'No. Klaim'], ['tgl', 'Tgl Pengajuan', 'date'], ['pasien', 'Pasien', 'ref', 'pasien'], ['tagihan', 'Tagihan', 'ref', 'tagihan'], ['jenis', 'Penjamin', 'sel', ['BPJS', 'Asuransi']], ['sep', 'No. SEP/Polis'], ['nilai', 'Nilai Klaim', 'num'], ['status', 'Status', 'sel', ['Diajukan', 'Verifikasi', 'Disetujui', 'Ditolak', 'Dibayar']]],
    g: i => ({ no: 'KLM-' + (500 + i), tgl: dt(i), pasien: r(i, 41), tagihan: i + 1, jenis: i % 3 ? 'BPJS' : 'Asuransi', sep: '0301R' + String(1e9 + i * 7777), nilai: rp(i, 9, 60) + 1e5, status: P(['Diajukan', 'Verifikasi', 'Disetujui', 'Ditolak', 'Dibayar'], i, 3) })
  },
  jurnal: {
    t: 'Akuntansi (Jurnal)',
    f: [['tgl', 'Tanggal', 'date'], ['akun', 'Akun'], ['ket', 'Keterangan'], ['debit', 'Debit', 'num'], ['kredit', 'Kredit', 'num']],
    g: i => ({ tgl: dt(i), akun: P(['Kas', 'Pendapatan Rawat Jalan', 'Pendapatan Rawat Inap', 'Beban Gaji', 'Beban Obat', 'Piutang BPJS', 'Beban Listrik'], i, 3), ket: 'Transaksi harian #' + (i + 1), debit: i % 2 ? 0 : rp(i, 5, 90), kredit: i % 2 ? rp(i, 5, 90) : 0 })
  },
  pegawai: {
    t: 'SDM / Kepegawaian', lbl: 'nama',
    f: [['nip', 'NIP'], ['nama', 'Nama'], ['jabatan', 'Jabatan', 'sel', ['Perawat', 'Bidan', 'Apoteker', 'Analis Lab', 'Radiografer', 'Admin', 'Kasir', 'Cleaning Service', 'Satpam']], ['unit', 'Unit'], ['masuk', 'Tgl Masuk', 'date'], ['gaji', 'Gaji Pokok', 'num'], ['status', 'Status', 'sel', ['Tetap', 'Kontrak', 'Cuti']]],
    g: i => ({ nip: 'EMP' + (2000 + i), nama: nm(i + 9), jabatan: P(['Perawat', 'Bidan', 'Apoteker', 'Analis Lab', 'Radiografer', 'Admin', 'Kasir', 'Cleaning Service', 'Satpam'], i, 4), unit: P(['IGD', 'Rawat Inap', 'Farmasi', 'Laboratorium', 'Administrasi', 'Radiologi'], i, 5), masuk: `${2012 + i % 14}-${pad(1 + i % 12)}-01`, gaji: 3e6 + (i % 10) * 5e5, status: P(['Tetap', 'Kontrak', 'Cuti'], i, 2) })
  },
  payroll: {
    t: 'Penggajian (Payroll)',
    f: [['periode', 'Periode'], ['pegawai', 'Pegawai', 'ref', 'pegawai'], ['gaji', 'Gaji Pokok', 'num'], ['tunjangan', 'Tunjangan', 'num'], ['potongan', 'Potongan', 'num'], ['total', 'Take Home Pay', 'num'], ['status', 'Status', 'sel', ['Draft', 'Dibayar']]],
    g: i => { const g = 3e6 + (i % 10) * 5e5, t = rp(i, 3, 8), p = rp(i, 7, 3) / 2; return { periode: '2026-09', pegawai: r(i, 1), gaji: g, tunjangan: t, potongan: p, total: g + t - p, status: i % 4 ? 'Dibayar' : 'Draft' } },
    calc: o => { o.total = +o.gaji + +o.tunjangan - +o.potongan }
  },
  aset: {
    t: 'Aset & Alat Medis',
    f: [['kode', 'Kode Aset'], ['nama', 'Nama Aset'], ['kategori', 'Kategori', 'sel', ['Alat Medis', 'Inventori', 'Kendaraan', 'Gedung']], ['lokasi', 'Lokasi'], ['beli', 'Tgl Beli', 'date'], ['nilai', 'Nilai', 'num'], ['kondisi', 'Kondisi', 'sel', ['Baik', 'Perlu Kalibrasi', 'Rusak']]],
    g: i => ({ kode: 'AST-' + (300 + i), nama: P(['Ventilator', 'USG Portable', 'Tempat Tidur Pasien', 'Defibrillator', 'Monitor Pasien', 'Ambulans', 'Infus Pump', 'Mesin X-Ray', 'Autoclave', 'AC Split'], i, 3) + ' #' + (i + 1), kategori: P(['Alat Medis', 'Inventori', 'Kendaraan', 'Gedung'], i, 3), lokasi: P(['IGD', 'ICU', 'Radiologi', 'Bangsal', 'Gudang'], i, 2), beli: `${2018 + i % 8}-${pad(1 + i % 12)}-10`, nilai: rp(i, 7, 300) * 10, kondisi: P(['Baik', 'Baik', 'Perlu Kalibrasi', 'Rusak'], i, 3) })
  },
  users: {
    t: 'Pengguna (Admin)', one: 1,
    f: [['username', 'Username'], ['nama', 'Nama'], ['password', 'Password'], ['role', 'Role']],
    g: () => ({ username: 'admin', nama: 'Administrator', password: 'admin123', role: 'Super Admin' })
  }
};

// ===== MENU & CONFIG =====
const MENU = [
  ['Pelayanan Klinis', ['pasien', 'pendaftaran', 'rme', 'igd', 'rawat_inap', 'kamar', 'lab', 'radiologi', 'obat', 'resep']],
  ['Administrasi & Keuangan', ['tagihan', 'klaim', 'jurnal', 'payroll']],
  ['Manajemen', ['aset', 'pegawai', 'dokter', 'poli']],
  ['Sistem', ['laporan', 'cms', 'publish', 'inbox', 'users']]
];
const TITLE = { dash: 'Dashboard', laporan: 'Laporan & SIRS', cms: 'CMS Rumah Sakit', publish: 'Publikasi GitHub', inbox: 'Inbox Website' };
const navLabel = x => {
  const t = (S[x] || {}).t || TITLE[x];
  if (x != 'inbox') return t;
  const n = inboxCount();
  return `${t}<span id="inbox-badge" class="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold ${n ? '' : 'hidden'}">${n}</span>`
};
const KEY = 'simrs_db4';
let db, ST = {};

// ===== STORAGE =====
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true }
  catch (e) { try { toast('Gagal menyimpan: penyimpanan browser penuh. Kurangi ukuran gambar atau backup lalu hapus data lama.', 1) } catch (_) { } return false }
};

function seed() {
  const d = {
    cms: {
      // Informasi Dasar
      nama: 'RS Sehat Sentosa',
      tagline: 'Melayani dengan Hati',
      alamat: 'Jl. Kesehatan No. 1, Jakarta',
      info: 'Selamat datang di SIMRS. IGD melayani 24 jam.',

      // Kontak
      telepon: '(021) 555-0100',
      telepon_igd: '(021) 555-0119',
      email: 'info@rssehatsentosa.co.id',
      whatsapp: '6281234567890',
      fax: '(021) 555-0101',

      // Social Media
      facebook: 'https://facebook.com/rssehatsentosa',
      instagram: 'https://instagram.com/rssehatsentosa',
      youtube: 'https://youtube.com/rssehatsentosa',
      tiktok: 'https://tiktok.com/@rssehatsentosa',

      // Jam Operasional
      jam_senin_jumat: '08.00 - 20.00',
      jam_sabtu: '08.00 - 15.00',
      jam_minggu: 'Tutup',
      jam_igd: '24 Jam',

      // Statistik
      stat_tenaga_medis: 150,
      stat_pasien_dilayani: 10000,
      stat_mitra: 50,
      stat_penghargaan: 25,

      // Tentang RS
      tentang_sejarah: 'RS Sehat Sentosa didirikan pada tahun 2000 dengan visi menjadi rumah sakit terpercaya yang melayani dengan hati.',
      tentang_visi: 'Menjadi rumah sakit terbaik yang memberikan pelayanan kesehatan berkualitas dan terjangkau.',
      tentang_misi: '1. Memberikan pelayanan kesehatan terbaik\n2. Mengembangkan SDM profesional\n3. Menyediakan fasilitas modern',

      // Copyright
      copyright: '2026 RS Sehat Sentosa. All rights reserved.',

      // Pengaturan Hero Slider
      hero_autoplay: true,
      hero_interval: 5,

      // Identitas visual & menu footer
      logo: '',
      favicon: '',
      nav_bottom_title: 'Link Cepat',

      // Bagian "Mengapa Memilih Kami?"
      mengapa_judul: 'Mengapa Memilih Kami?',

      // Pengiriman formulir website: auto | whatsapp | endpoint | lokal
      form_mode: 'auto',
      form_endpoint: '',
      inbox_url: '',

      // Section Poliklinik di website
      poli_judul: 'Poliklinik & Unit Layanan',
      poli_subjudul: 'Pilih poliklinik sesuai kebutuhan Anda, lihat lokasinya, dan daftar kunjungan dengan mudah.',

      // Kebijakan Privasi & Syarat Ketentuan (modal di website)
      kebijakan_judul: 'Kebijakan Privasi', kebijakan_aktif: true, kebijakan_update: new Date().toISOString().slice(0, 10), kebijakan_isi: LEGAL_PRIVASI,
      syarat_judul: 'Syarat & Ketentuan', syarat_aktif: true, syarat_update: new Date().toISOString().slice(0, 10), syarat_isi: LEGAL_SYARAT
    },

    // Hero Slides
    cms_hero: [
      { id: 1, badge: 'Rumah Sakit Terpercaya', judul: 'Kesehatan Anda, Prioritas Kami', subtitle: 'Layanan kesehatan berkualitas dengan dokter spesialis berpengalaman dan fasilitas modern untuk keluarga Anda.', cta1_text: 'Temukan Dokter', cta1_link: '#dokter', cta2_text: 'Lihat Layanan', cta2_link: '#layanan', warna: 'blue', aktif: true },
      { id: 2, badge: 'IGD 24 Jam', judul: 'Gawat Darurat? Kami Siap 24 Jam', subtitle: 'Tim medis profesional siap melayani Anda kapan saja. Hubungi IGD kami untuk penanganan cepat dan tepat.', cta1_text: 'Hubungi IGD', cta1_link: 'tel:0215550119', cta2_text: 'Lokasi Kami', cta2_link: '#kontak', warna: 'red', aktif: true },
      { id: 3, badge: 'Medical Checkup', judul: 'Cek Kesehatan Reguler Itu Penting', subtitle: 'Paket medical checkup lengkap dengan harga terjangkau. Deteksi dini untuk hidup lebih sehat.', cta1_text: 'Lihat Promo', cta1_link: '#promo', cta2_text: 'Buat Janji', cta2_link: '#janji', warna: 'blue', aktif: true }
    ],

    // Layanan Unggulan
    cms_layanan: [
      { id: 1, nama: 'Radiologi', deskripsi: 'Layanan pencitraan medis dengan teknologi modern untuk diagnosis yang akurat.', icon: 'fa-x-ray', aktif: true },
      { id: 2, nama: 'Medical Checkup', deskripsi: 'Pemeriksaan kesehatan menyeluruh untuk deteksi dini dan pencegahan penyakit.', icon: 'fa-heartbeat', aktif: true },
      { id: 3, nama: 'Laboratorium', deskripsi: 'Layanan pemeriksaan laboratorium dengan peralatan modern dan hasil yang akurat.', icon: 'fa-flask', aktif: true },
      { id: 4, nama: 'IGD 24 Jam', deskripsi: 'Layanan gawat darurat 24 jam dengan tim medis profesional dan peralatan lengkap.', icon: 'fa-ambulance', aktif: true, darurat: true },
      { id: 5, nama: 'Poli Anak', deskripsi: 'Layanan kesehatan anak dengan dokter spesialis anak yang ramah dan berpengalaman.', icon: 'fa-baby', aktif: true },
      { id: 6, nama: 'Poli Kandungan', deskripsi: 'Layanan kesehatan ibu dan kehamilan dengan fasilitas persalinan modern.', icon: 'fa-female', aktif: true },
      { id: 7, nama: 'Poli Saraf', deskripsi: 'Layanan konsultasi dan penanganan gangguan saraf dengan dokter spesialis neurologi.', icon: 'fa-brain', aktif: true },
      { id: 8, nama: 'Rawat Inap', deskripsi: 'Fasilitas rawat inap nyaman dengan berbagai kelas kamar dan pelayanan 24 jam.', icon: 'fa-procedures', aktif: true }
    ],

    // Promo
    cms_promo: [
      { id: 1, judul: 'Paket Medical Checkup', deskripsi: 'Paket pemeriksaan kesehatan lengkap dengan diskon spesial.', harga_asli: 1500000, harga_promo: 1050000, label: 'DISKON 30%', aktif: true },
      { id: 2, judul: 'Paket Persalinan', deskripsi: 'Paket persalinan normal dan caesar dengan fasilitas lengkap.', harga_asli: 0, harga_promo: 8000000, label: 'PAKET HEMAT', aktif: true },
      { id: 3, judul: 'Paket Gigi & Mulut', deskripsi: 'Konsultasi dokter gigi gratis + scaling gigi.', harga_asli: 0, harga_promo: 250000, label: 'GRATIS SCALING', aktif: true }
    ],

    // Berita/Artikel
    cms_berita: [
      { id: 1, judul: 'Pentingnya Medical Checkup Rutin untuk Deteksi Dini Penyakit', ringkasan: 'Medical checkup rutin membantu mendeteksi penyakit sejak dini sehingga penanganan dapat dilakukan lebih cepat dan efektif.', tanggal: '2026-01-15', kategori: 'Kesehatan', icon: 'fa-newspaper', aktif: true },
      { id: 2, judul: 'Tips Menjaga Kesehatan Jantung di Era Modern', ringkasan: 'Penyakit jantung masih menjadi pembunuh nomor satu di Indonesia. Berikut tips sederhana untuk menjaga kesehatan jantung Anda.', tanggal: '2026-01-10', kategori: 'Jantung', icon: 'fa-heart', aktif: true },
      { id: 3, judul: 'RS Sehat Sentosa Gelar Operasi Gratis untuk Warga Kurang Mampu', ringkasan: 'Dalam rangka HUT RS ke-10, kami mengadakan program operasi gratis bagi warga kurang mampu yang membutuhkan.', tanggal: '2026-01-05', kategori: 'Kegiatan RS', icon: 'fa-hospital', aktif: true }
    ],

    // Testimoni
    cms_testimoni: [
      { id: 1, nama: 'Budi Santoso', profesi: 'Pasien Rawat Jalan', ulasan: 'Pelayanan sangat memuaskan! Dokternya ramah dan penjelasan detail. Perawat juga sangat membantu. Fasilitas bersih dan nyaman.', rating: 5, aktif: true },
      { id: 2, nama: 'Siti Rahayu', profesi: 'Pasien Persalinan', ulasan: 'Proses persalinan di sini sangat nyaman. Tim medisnya profesional dan suportif. Kamar rawat inapnya juga bersih dan lengkap.', rating: 5, aktif: true },
      { id: 3, nama: 'Andi Wijaya', profesi: 'Pasien Medical Checkup', ulasan: 'Medical checkup di sini cepat dan hasilnya lengkap. Staffnya ramah dan membantu menjelaskan hasil pemeriksaan dengan detail.', rating: 4, aktif: true }
    ],

    // Menu navigasi atas (navbar)
    cms_nav_top: [
      { id: 1, label: 'Beranda', url: '#beranda', aktif: true, baru: false },
      { id: 2, label: 'Tentang', url: '#tentang', aktif: true, baru: false },
      { id: 3, label: 'Layanan', url: '#layanan', aktif: true, baru: false },
      { id: 4, label: 'Poliklinik', url: '#poliklinik', aktif: true, baru: false },
      { id: 5, label: 'Dokter', url: '#dokter', aktif: true, baru: false },
      { id: 6, label: 'Promo', url: '#promo', aktif: true, baru: false },
      { id: 7, label: 'Berita', url: '#berita', aktif: true, baru: false },
      { id: 8, label: 'Kontak', url: '#kontak', aktif: true, baru: false }
    ],

    // Menu navigasi bawah (footer): area 'kolom' = kolom Link Cepat, 'baris' = baris copyright
    cms_nav_bottom: [
      { id: 1, label: 'Beranda', url: '#beranda', area: 'kolom', aktif: true, baru: false },
      { id: 2, label: 'Layanan', url: '#layanan', area: 'kolom', aktif: true, baru: false },
      { id: 3, label: 'Poliklinik', url: '#poliklinik', area: 'kolom', aktif: true, baru: false },
      { id: 4, label: 'Dokter', url: '#dokter', area: 'kolom', aktif: true, baru: false },
      { id: 5, label: 'Promo', url: '#promo', area: 'kolom', aktif: true, baru: false },
      { id: 6, label: 'Berita', url: '#berita', area: 'kolom', aktif: true, baru: false },
      { id: 7, label: 'Kontak', url: '#kontak', area: 'kolom', aktif: true, baru: false },
      { id: 8, label: 'Kebijakan Privasi', url: '#kebijakan-privasi', area: 'baris', aktif: true, baru: false },
      { id: 9, label: 'Syarat & Ketentuan', url: '#syarat-ketentuan', area: 'baris', aktif: true, baru: false }
    ],

    // Bagian "Mengapa Memilih Kami?" (kartu keunggulan di Tentang Kami)
    cms_mengapa: [
      { id: 1, judul: 'Dokter Berpengalaman', deskripsi: 'Tim dokter spesialis dengan pengalaman lebih dari 10 tahun', icon: 'fa-user-md', aktif: true },
      { id: 2, judul: 'Fasilitas Modern', deskripsi: 'Peralatan medis terkini untuk diagnosis dan pengobatan akurat', icon: 'fa-microscope', aktif: true },
      { id: 3, judul: 'Pelayanan Prima', deskripsi: 'Komitmen memberikan pelayanan terbaik dengan penuh kasih sayang', icon: 'fa-heart', aktif: true },
      { id: 4, judul: 'IGD 24 Jam', deskripsi: 'Layanan gawat darurat siap melayani kapan saja', icon: 'fa-clock', aktif: true }
    ]
  };

  for (const k in S) d[k] = Array.from({ length: S[k].one ? 1 : 50 }, (_, i) => ({ id: i + 1, ...S[k].g(i) }));
  return d;
}

// ===== TEKS BAWAAN: KEBIJAKAN PRIVASI & SYARAT KETENTUAN =====
// Template umum - WAJIB disesuaikan dengan kondisi rumah sakit dan ditinjau penasihat hukum sebelum dipublikasikan.
// Format: "## judul", "- poin", "1. poin berurut", **tebal**, baris kosong = paragraf baru.
// Placeholder: {{nama}} {{alamat}} {{telepon}} {{telepon_igd}} {{email}} {{whatsapp}} (diisi otomatis dari CMS).
const LEGAL_PRIVASI = `## 1. Pendahuluan
{{nama}} ("kami") menghargai privasi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda saat menggunakan situs web ini, termasuk formulir pendaftaran online dan formulir kontak.

## 2. Data yang Kami Kumpulkan
- Data identitas dan kontak: nama lengkap, nomor telepon/WhatsApp, dan alamat email.
- Data kunjungan: poli/dokter yang dipilih, tanggal kunjungan, dan keluhan singkat yang Anda tulis.
- Isi pesan yang Anda kirim melalui formulir kontak.
- Data teknis dasar seperti jenis perangkat dan peramban, bila diperlukan untuk menjaga keamanan dan kinerja situs.

## 3. Tujuan Penggunaan Data
- Memproses dan mengonfirmasi pendaftaran kunjungan Anda.
- Menanggapi pertanyaan, saran, atau keluhan Anda.
- Meningkatkan mutu layanan dan pengalaman Anda di situs ini.
- Memenuhi kewajiban hukum dan peraturan di bidang kesehatan yang berlaku.

## 4. Informasi Medis
Formulir di situs ini bukan rekam medis. Mohon tidak menuliskan riwayat penyakit yang rinci pada kolom keluhan. Data kesehatan Anda yang sebenarnya dicatat dan dilindungi oleh {{nama}} sesuai ketentuan rekam medis dan kerahasiaan pasien yang berlaku.

## 5. Pembagian Data
Kami tidak menjual data pribadi Anda. Data hanya dapat dibagikan kepada pihak berwenang atau penyedia layanan yang membantu operasional kami, sebatas yang diperlukan dan dengan kewajiban menjaga kerahasiaan, atau bila diwajibkan oleh peraturan perundang-undangan.

## 6. Penyimpanan dan Keamanan
Kami menerapkan langkah teknis dan organisasi yang wajar untuk melindungi data dari akses, perubahan, atau pengungkapan yang tidak sah. Data disimpan selama diperlukan untuk tujuan di atas atau selama diwajibkan oleh peraturan.

## 7. Hak Anda
Sesuai peraturan yang berlaku, Anda dapat meminta akses, perbaikan, atau penghapusan data pribadi Anda, serta menarik persetujuan yang telah diberikan, dengan menghubungi kami melalui kontak di bawah.

## 8. Cookie dan Penyimpanan Peramban
Situs ini dapat menggunakan penyimpanan peramban (misalnya cookie atau localStorage) untuk menjalankan fitur situs. Anda dapat menghapusnya melalui pengaturan peramban.

## 9. Perubahan Kebijakan
Kebijakan ini dapat diperbarui sewaktu-waktu. Tanggal pembaruan terakhir tercantum pada bagian atas dokumen ini.

## 10. Hubungi Kami
**{{nama}}**
{{alamat}}
Telepon: {{telepon}} | Email: {{email}}`;

const LEGAL_SYARAT = `## 1. Penerimaan Ketentuan
Dengan mengakses dan menggunakan situs web {{nama}}, Anda menyatakan telah membaca, memahami, dan menyetujui syarat dan ketentuan ini.

## 2. Tujuan Situs
Situs ini menyediakan informasi layanan, jadwal dokter, promo, dan berita {{nama}}, serta fasilitas pendaftaran kunjungan dan pengiriman pesan secara online.

## 3. Bukan Pengganti Nasihat Medis
Seluruh informasi di situs ini bersifat umum dan tidak menggantikan pemeriksaan, diagnosis, atau pengobatan oleh tenaga medis. Jangan menunda atau mengabaikan saran medis karena informasi di situs ini. Dalam keadaan darurat, segera hubungi IGD kami di **{{telepon_igd}}** atau datang langsung ke rumah sakit.

## 4. Pendaftaran Online
- Pendaftaran online merupakan permintaan jadwal kunjungan dan baru berlaku setelah dikonfirmasi oleh petugas kami.
- Anda wajib mengisi data dengan benar dan lengkap.
- Jadwal dokter dapat berubah sewaktu-waktu karena keadaan tertentu; kami akan berusaha menginformasikan perubahan tersebut.
- Kami berhak menolak atau menjadwalkan ulang pendaftaran bila diperlukan.

## 5. Promo dan Harga
Promo, paket, dan harga yang tampil di situs dapat berubah tanpa pemberitahuan sebelumnya, berlaku selama periode dan syarat yang ditentukan, serta dapat memerlukan pemeriksaan atau ketentuan tambahan di rumah sakit.

## 6. Hak Kekayaan Intelektual
Seluruh konten situs (teks, logo, gambar, dan desain) merupakan milik {{nama}} atau digunakan dengan izin, dan tidak boleh disalin atau digunakan untuk tujuan komersial tanpa izin tertulis.

## 7. Penggunaan yang Dilarang
Anda dilarang menyalahgunakan situs, antara lain dengan mengirim data palsu, mengganggu keamanan atau kinerja situs, atau mengirim konten yang melanggar hukum.

## 8. Batasan Tanggung Jawab
Kami berupaya menjaga akurasi dan ketersediaan situs, namun tidak menjamin situs bebas dari gangguan atau kesalahan. Sejauh diizinkan oleh hukum, {{nama}} tidak bertanggung jawab atas kerugian yang timbul akibat penggunaan situs ini.

## 9. Tautan Pihak Ketiga
Situs dapat memuat tautan ke situs lain. Kami tidak bertanggung jawab atas isi maupun kebijakan situs tersebut.

## 10. Perubahan dan Hukum yang Berlaku
Kami dapat mengubah ketentuan ini sewaktu-waktu. Ketentuan ini tunduk pada hukum Republik Indonesia.

## 11. Kontak
Pertanyaan tentang ketentuan ini dapat disampaikan ke {{email}} atau {{telepon}}.`;

// ===== INIT DATABASE =====
const HERO_TONE_IDS = ['blue', 'red', 'emerald', 'indigo'];

// Menjamin struktur database SELALU lengkap: DB lama, hasil impor JSON, atau DB parsial
// (mis. yang pernah ditulis halaman publik versi lama) tidak lagi membuat panel admin error.
function applyFavicon() {
  const u = String((db.cms || {}).favicon || '').trim();
  const ok = !!u && (/^(https?:\/\/|data:image\/)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u));
  let l = document.querySelector('link[rel~="icon"]');
  if (!l) { if (!ok) return; l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l) }
  if (ok) { l.href = u; l.removeAttribute('type') } else l.removeAttribute('href')
}

function normalizeDb() {
  const base = seed();
  if (!db || typeof db !== 'object' || Array.isArray(db)) db = {};
  const partial = !Array.isArray(db.rme) || !Array.isArray(db.kamar) || !Array.isArray(db.tagihan);
  for (const k in base) {
    if (k == 'cms') continue;
    if (!Array.isArray(db[k]) || (partial && !k.startsWith('cms_'))) db[k] = base[k];
  }
  db.cms = { ...base.cms, ...(db.cms && typeof db.cms == 'object' ? db.cms : {}) };
  if (!db.users.length) db.users = base.users;
  db.cms_hero.forEach(h => { if (h.gambar == null) h.gambar = ''; if (!HERO_TONE_IDS.includes(h.warna)) h.warna = 'blue' });
  db.cms_berita.forEach(b => { if (b.isi == null) b.isi = '' });
  db.cms_layanan.forEach(l => { if (l.darurat == null) l.darurat = false });
  if (!db.cms.mig_poli_nav) {                   // sekali: tambahkan menu "Poliklinik" (di bawah Layanan) pada data lama
    const ins = (a, item) => {
      if (a.some(n => n.url == '#poliklinik')) return;
      const i = a.findIndex(n => n.url == '#layanan');
      a.splice(i >= 0 ? i + 1 : a.length, 0, { id: Math.max(0, ...a.map(n => n.id)) + 1, ...item });
    };
    ins(db.cms_nav_top, { label: 'Poliklinik', url: '#poliklinik', aktif: true, baru: false });
    ins(db.cms_nav_bottom, { label: 'Poliklinik', url: '#poliklinik', area: 'kolom', aktif: true, baru: false });
    db.cms.mig_poli_nav = true;
  }
  db.cms_promo.forEach(x => { if (x.gambar == null) x.gambar = '' });
  db.cms_berita.forEach(x => { if (x.gambar == null) x.gambar = '' });
  db.cms_nav_top.forEach(n => { if (n.baru == null) n.baru = false });
  db.cms_nav_bottom.forEach(n => {
    if (n.baru == null) n.baru = false;
    if (n.area != 'baris') n.area = 'kolom';
    if (!n.url || n.url == '#') {            // data lama: tautan legal "#" -> buka modal
      if (/kebijakan\s+privasi/i.test(n.label)) n.url = '#kebijakan-privasi';
      else if (/syarat/i.test(n.label)) n.url = '#syarat-ketentuan';
    }
  });
  return db;
}

try { db = JSON.parse(localStorage.getItem(KEY)) } catch (e) { db = null }
normalizeDb();
save();

// ===== UTILITY FUNCTIONS =====
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rup = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
const lab = (c, id) => { const x = db[c].find(o => o.id == id); return x ? x[S[c].lbl] : '-' };
const cell = (row, f) => {
  const v = row[f[0]];
  return f[2] == 'ref' ? lab(f[3], v) : f[2] == 'num' && /total|nilai|harga|tarif|gaji|tunjangan|potongan|debit|kredit|dibayar/.test(f[0]) ? rup(v) : v
};

// ===== BADGE COLORS =====
const BC = {
  Lunas: 'green', Selesai: 'green', Disetujui: 'green', Dibayar: 'green', Aktif: 'green', Kosong: 'green', Baik: 'green', Diserahkan: 'green',
  Pulang: 'slate', Merah: 'red', Ditolak: 'red', Rusak: 'red', 'Belum Bayar': 'red', Hitam: 'slate',
  Kuning: 'amber', Sebagian: 'amber', Diproses: 'amber', Menunggu: 'amber', Diajukan: 'amber', Verifikasi: 'amber',
  Dirawat: 'blue', Terisi: 'blue', Hijau: 'green', Penanganan: 'red', Observasi: 'amber', 'Perlu Kalibrasi': 'amber',
  Baru: 'amber', Diterima: 'green'
};
const badge = v => BC[v] ? `<span class="px-2 py-0.5 rounded-full text-xs font-medium bg-${BC[v]}-100 text-${BC[v]}-800">${esc(v)}</span>` : esc(v);

// ===== UI CLASSES =====
const card = 'bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700';
const inp = 'w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-900 rounded-lg px-3 py-2';
const btn = (c = 'blue') => `bg-${c}-600 hover:bg-${c}-700 text-white rounded-lg px-3 py-2 font-medium cursor-pointer`;
const authed = () => sessionStorage.getItem('simrs_auth') == '1' && (!GH_ON || !!ghTok());

// ===== PRINT TRANSACTION FUNCTION =====
function printTransaction(type, id) {
  const o = db[type].find(x => x.id == id);
  if (!o) return alert('Data tidak ditemukan');
  const rs = db.cms.nama, addr = db.cms.alamat, now = new Date().toLocaleString('id-ID');
  let title = S[type].t, body = '';
  const R = (l, v, bold) => `<tr${bold ? ' class="bold"' : ''}><td>${l}</td><td>${v}</td></tr>`;
  const HR = () => '<tr class="separator"><td colspan="2"></td></tr>';

  if (type == 'tagihan') {
    const p = db.pasien.find(x => x.id == o.pasien);
    body = `<h3 class="print-title">KWITANSI / INVOICE</h3>
<table class="print-table">
${R('No. Invoice', esc(o.no), 1)}${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Penjamin', esc(p?.penjamin || '-'))}
${HR()}
${(o.items || []).length ? `<tr><td colspan="2" style="padding:4px 0;font-weight:bold">RINCIAN LAYANAN</td></tr>` + o.items.map(i => `<tr class="item-row"><td>${esc(i.ket)}</td><td>${rup(i.amt)}</td></tr>`).join('') : '<tr><td colspan="2" style="color:#666;padding:4px 0">Tagihan manual (tanpa rincian)</td></tr>'}
${HR()}
${R('TOTAL', rup(o.total), 1)}${R('Dibayar', rup(o.dibayar))}${R('SISA', rup(o.total - o.dibayar), 1)}${R('Metode', esc(o.metode))}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'resep') {
    const p = db.pasien.find(x => x.id == o.pasien), dr = db.dokter.find(x => x.id == o.dokter), ob = db.obat.find(x => x.id == o.obat);
    body = `<h3 class="print-title">RESEP OBAT</h3>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Dokter', esc(dr?.nama || '-'))}
${HR()}
<tr><td colspan="2" style="padding:4px 0;font-weight:bold">OBAT</td></tr>
<tr class="item-row"><td>${esc(ob?.nama || '-')}</td><td>${o.jumlah} @ ${rup(ob?.harga || 0)}</td></tr>
${HR()}
${R('Total', rup((ob?.harga || 0) * o.jumlah), 1)}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'pendaftaran') {
    const p = db.pasien.find(x => x.id == o.pasien), pl = db.poli.find(x => x.id == o.poli), dr = db.dokter.find(x => x.id == o.dokter);
    body = `<h3 class="print-title">BUKTI PENDAFTARAN</h3>
<div class="print-antrian">${esc(o.antrian)}</div>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Poliklinik', esc(pl?.nama || '-'))}${R('Dokter', esc(dr?.nama || '-'))}${R('Penjamin', esc(p?.penjamin || '-'))}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'lab') {
    const p = db.pasien.find(x => x.id == o.pasien);
    body = `<h3 class="print-title">HASIL LABORATORIUM</h3>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}
${HR()}
<tr><td style="padding:4px 0;font-weight:bold">PEMERIKSAAN</td><td style="padding:4px 0;text-align:right">${esc(o.periksa)}</td></tr>
<tr class="total-row"><td style="padding:4px 0;font-weight:bold">HASIL</td><td style="padding:4px 0;text-align:right;font-weight:bold;font-size:14px">${esc(o.hasil)}</td></tr>
<tr><td style="padding:4px 0;font-weight:bold">NILAI RUJUKAN</td><td style="padding:4px 0;text-align:right">${esc(o.rujukan)}</td></tr>
${HR()}
${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'radiologi') {
    const p = db.pasien.find(x => x.id == o.pasien);
    body = `<h3 class="print-title">HASIL RADIOLOGI</h3>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}
${HR()}
${R('Modalitas', esc(o.modalitas))}${R('Area', esc(o.area))}
${HR()}
<tr><td colspan="2" style="padding:4px 0;font-weight:bold">KESAN:</td></tr>
<tr><td colspan="2" style="padding:4px 0">${esc(o.kesan)}</td></tr>
${HR()}
${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'rawat_inap') {
    const p = db.pasien.find(x => x.id == o.pasien), km = db.kamar.find(x => x.id == o.kamar), dr = db.dokter.find(x => x.id == o.dokter);
    const hari = o.keluar ? Math.max(1, Math.round((new Date(o.keluar) - new Date(o.masuk)) / 864e5)) + ' hari' : 'Masih dirawat';
    body = `<h3 class="print-title">BUKTI RAWAT INAP</h3>
<table class="print-table">
${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Kamar', esc(km?.kode || '-') + ' (' + esc(km?.kelas || '-') + ')')}${R('Bangsal', esc(km?.bangsal || '-'))}${R('DPJP', esc(dr?.nama || '-'))}${R('Tgl Masuk', o.masuk)}${R('Tgl Keluar', o.keluar || '-')}${R('Lama Rawat', hari)}${R('Tarif/Hari', rup(km?.tarif || 0))}${R('Diagnosa', esc(o.diagnosa))}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'igd') {
    const p = db.pasien.find(x => x.id == o.pasien), dr = db.dokter.find(x => x.id == o.dokter);
    const tc = o.triase == 'Merah' ? 'red' : o.triase == 'Kuning' ? '#d97706' : o.triase == 'Hijau' ? 'green' : '#333';
    body = `<h3 class="print-title">PELAYANAN IGD</h3>
<div class="print-triase" style="border-color:${tc};color:${tc}">TRIASE: ${esc(o.triase)}</div>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Keluhan', esc(o.keluhan))}${R('Dokter Jaga', esc(dr?.nama || '-'))}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'rme') {
    const p = db.pasien.find(x => x.id == o.pasien), dr = db.dokter.find(x => x.id == o.dokter);
    body = `<h3 class="print-title">CATATAN MEDIS (RME)</h3>
<table class="print-table">
${R('Tanggal', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Dokter', esc(dr?.nama || '-'))}
${HR()}
</table>
<div class="print-catatan">
<p><b>Keluhan:</b> ${esc(o.keluhan)}</p>
<p><b>Diagnosa:</b> ${esc(o.diagnosa)}</p>
<p><b>Tindakan:</b> ${esc(o.tindakan)}</p>
<p><b>Catatan:</b> ${esc(o.catatan)}</p>
</div>`;
  } else if (type == 'klaim') {
    const p = db.pasien.find(x => x.id == o.pasien);
    body = `<h3 class="print-title">BUKTI KLAIM ${esc(o.jenis)}</h3>
<table class="print-table">
${R('No. Klaim', esc(o.no), 1)}${R('Tgl Pengajuan', o.tgl)}${R('Pasien', esc(p?.nama || '-'))}${R('No. RM', esc(p?.no_rm || '-'))}${R('Penjamin', esc(o.jenis))}${R('No. SEP/Polis', esc(o.sep))}
${HR()}
${R('Nilai Klaim', rup(o.nilai), 1)}${R('Status', esc(o.status), 1)}
</table>`;
  } else if (type == 'payroll') {
    const pg = db.pegawai.find(x => x.id == o.pegawai);
    body = `<h3 class="print-title">SLIP GAJI</h3>
<table class="print-table">
${R('Periode', esc(o.periode))}${R('NIP', esc(pg?.nip || '-'))}${R('Nama', esc(pg?.nama || '-'))}${R('Jabatan', esc(pg?.jabatan || '-'))}
${HR()}
${R('Gaji Pokok', rup(o.gaji))}${R('Tunjangan', '+ ' + rup(o.tunjangan))}${R('Potongan', '- ' + rup(o.potongan))}
${HR()}
${R('TAKE HOME PAY', rup(o.total), 1)}${R('Status', esc(o.status), 1)}
</table>`;
  } else {
    body = '<p>Data tidak memiliki format cetak.</p>';
  }

  const w = window.open('', '_blank', 'width=500,height=700');
  if (!w) { alert('Popup diblokir! Izinkan popup di browser Anda.'); return }
  w.document.write(`<!DOCTYPE html><html><head><title>Cetak - ${title}</title>
<link rel="stylesheet" href="simrs.css">
</head><body>
<div class="print-body">
<div class="print-header"><h2>${esc(rs)}</h2><p>${esc(addr)}</p><p>Telp: ${esc(db.cms.telepon || '')}</p></div>
${body}
<div class="print-footer"><p>Terima kasih atas kepercayaan Anda.</p><p>Dicetak: ${now}</p><p>*** ${esc(rs)} ***</p></div>
</div>
<button class="btn-print" onclick="window.print()">🖨️ Cetak</button>
<button class="btn-close" onclick="window.close()">Tutup</button>
</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

// ===== AUTH FUNCTIONS =====
function login() {
  const c = db.cms;
  const head = `<div class="text-center"><div class="text-4xl">🏥</div><h1 class="text-xl font-bold mt-1">${esc(c.nama)}</h1><p class="text-slate-500">${GH_ON ? 'Panel Admin' : esc(c.tagline)}</p></div>`;
  $('#app').innerHTML = GH_ON
    ? `<div class="h-full grid place-items-center p-4"><form onsubmit="return doTokenLogin(event)" class="${card} p-8 w-full max-w-sm space-y-4" autocomplete="off">${head}
      <label class="block"><span class="text-xs text-slate-500">GitHub Personal Access Token</span><input id="lt" type="password" class="${inp}" placeholder="github_pat_..." autocomplete="off" spellcheck="false"></label>
      <p class="text-xs text-slate-500">Repositori: <b>${esc(GHCFG.owner)}/${esc(GHCFG.repo)}</b>. Hanya akun dengan akses <b>tulis</b> ke repositori ini yang dapat masuk. Token hanya disimpan di tab ini dan terhapus saat tab ditutup atau setelah 30 menit tanpa aktivitas.</p>
      <p id="le" class="text-red-600 text-xs hidden" role="alert"></p>
      <button id="lbtn" class="${btn()} w-full">Masuk dengan Token</button>
      <p class="text-xs text-center"><a class="text-blue-600 underline" target="_blank" rel="noopener noreferrer" href="https://github.com/settings/personal-access-tokens/new">Buat token (fine-grained)</a></p></form></div>`
    : `<div class="h-full grid place-items-center p-4"><form onsubmit="return doLogin(event)" class="${card} p-8 w-full max-w-sm space-y-4">${head}<input id="lu" class="${inp}" placeholder="Username" value="admin"><input id="lp" type="password" class="${inp}" placeholder="Password"><p id="le" class="text-red-600 text-xs hidden">Username atau password salah.</p><button class="${btn()} w-full">Masuk</button><p class="text-xs text-amber-600 text-center">Mode demo lokal: login ini TIDAK aman dan hanya untuk uji coba. Untuk hosting GitHub Pages, panel ini otomatis memakai login Token.</p><p class="text-xs text-slate-400 text-center">Demo: admin / admin123</p></form></div>`
}

let _fails = 0, _lock = 0;
function doLogin(e) {
  e.preventDefault();
  const le = $('#le'), left = Math.ceil((_lock - Date.now()) / 1000);
  if (left > 0) { le.textContent = `Terlalu banyak percobaan. Coba lagi dalam ${left} detik.`; le.classList.remove('hidden'); return false }
  const u = (db.users || []).find(x => x.username == $('#lu').value.trim() && x.password == $('#lp').value);
  if (u) {
    _fails = 0;
    sessionStorage.setItem('simrs_auth', '1');
    sessionStorage.setItem('simrs_user', u.nama || u.username);
    shell()
  } else {
    if (++_fails >= 5) { _lock = Date.now() + 30000; _fails = 0 }
    le.textContent = 'Username atau password salah.';
    le.classList.remove('hidden')
  }
  return false
}

function logout() {
  clearTimeout(_idle);
  ['simrs_auth', 'simrs_user', 'simrs_gh_token', 'simrs_gh_branch'].forEach(k => sessionStorage.removeItem(k));
  login()
}

// ===== SHELL / NAVIGATION =====
function shell() {
  const k = (location.hash || '#/dash').slice(2);
  const nav = MENU.map(([g, ks]) => `<div class="px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-slate-400">${g}</div>` + ks.map(x => `<a href="#/${x}" class="block px-4 py-2 rounded-lg mx-2 ${k == x ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}">${navLabel(x)}</a>`).join('')).join('');
  $('#app').innerHTML = `<div class="h-full flex"><aside id="sb" class="hidden md:block w-64 shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto pb-6"><div class="p-4 font-bold text-lg">${cmsSafeImg(db.cms.logo) ? `<img src="${esc(cmsSafeImg(db.cms.logo))}" alt="" class="inline-block h-7 w-7 object-contain align-middle mr-1">` : '🏥'} ${esc(db.cms.nama)}</div><a href="#/dash" class="block px-4 py-2 rounded-lg mx-2 ${k == 'dash' ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}">Dashboard</a>${nav}</aside><main class="flex-1 min-w-0 flex flex-col"><header class="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"><button class="md:hidden text-xl" onclick="$('#sb').classList.toggle('hidden');$('#sb').classList.toggle('fixed');$('#sb').classList.toggle('z-40');$('#sb').classList.toggle('h-full')">☰</button><h2 class="font-semibold text-base flex-1 truncate">${(S[k] || {}).t || TITLE[k] || ''}</h2><span class="hidden md:inline text-xs text-slate-500">${esc(sessionStorage.getItem('simrs_user') || '')}</span><a href="index.html?preview=1" target="_blank" rel="noopener" class="${btn('slate')} hidden sm:inline-block">🌐 Website</a><button class="${btn('slate')}" onclick="dbModal()">Data JSON</button><button class="${btn('red')}" onclick="logout()">Keluar</button></header><div id="main" class="flex-1 overflow-auto p-4"></div></main></div><div id="modal"></div><div id="dlg"></div><div id="toast" class="hidden"></div>`;
  ({ dash, laporan, cms, inbox, publish: publishPage }[k] || (S[k] ? () => table(k) : dash))()
}

// ===== DASHBOARD =====
function dash() {
  const c = (l, v, s = '') => `<div class="${card} p-4"><div class="text-slate-500">${l}</div><div class="text-2xl font-bold">${v}</div><div class="text-xs text-slate-400">${s}</div></div>`;
  const bor = Math.round(db.kamar.filter(x => x.status == 'Terisi').length / (db.kamar.length || 1) * 100);
  const lunas = db.tagihan.reduce((a, x) => a + +x.dibayar, 0);
  const tot = db.tagihan.reduce((a, x) => a + +x.total, 0);
  const bar = (t, rows) => { const m = Math.max(...rows.map(x => x[1]), 1); return `<div class="${card} p-4"><div class="font-semibold mb-3">${t}</div>` + rows.map(([l, n]) => `<div class="flex items-center gap-2 mb-2"><span class="w-28 text-xs">${l}</span><div class="flex-1 bg-slate-100 dark:bg-slate-700 rounded h-4"><div class="bg-blue-500 h-4 rounded" style="width:${n / m * 100}%"></div></div><span class="w-8 text-xs text-right">${n}</span></div>`).join('') + '</div>' };
  const cnt = (k, f, vs) => vs.map(v => [v, db[k].filter(x => x[f] == v).length]);
  $('#main').innerHTML = `<p class="mb-4 text-slate-500">${esc(db.cms.info)}</p><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">${c('Pasien', db.pasien.length)}${c('Kunjungan Rawat Jalan', db.pendaftaran.length)}${c('Kasus IGD', db.igd.length)}${c('Pasien Dirawat', db.rawat_inap.filter(x => x.status == 'Dirawat').length)}${c('BOR', bor + '%', 'Bed occupancy rate')}${c('Pendapatan Diterima', rup(lunas))}${c('Piutang', rup(tot - lunas))}${c('Obat Stok Kritis', db.obat.filter(x => +x.stok <= +x.stok_min).length)}</div><div class="grid md:grid-cols-3 gap-3">${bar('Triase IGD', cnt('igd', 'triase', ['Merah', 'Kuning', 'Hijau', 'Hitam']))}${bar('Status Tagihan', cnt('tagihan', 'status', ['Belum Bayar', 'Sebagian', 'Lunas']))}${bar('Status Klaim', cnt('klaim', 'status', ['Diajukan', 'Verifikasi', 'Disetujui', 'Ditolak', 'Dibayar']))}</div>`
}

// ===== LAPORAN =====
function laporan() {
  const R = [['Jumlah pasien terdaftar', db.pasien.length], ['Kunjungan rawat jalan (selesai)', db.pendaftaran.filter(x => x.status == 'Selesai').length], ['Kunjungan IGD', db.igd.length], ['Pasien rawat inap aktif', db.rawat_inap.filter(x => x.status == 'Dirawat').length], ['Tempat tidur tersedia', db.kamar.length], ['BOR (%)', Math.round(db.kamar.filter(x => x.status == 'Terisi').length / (db.kamar.length || 1) * 100)], ['Pemeriksaan laboratorium', db.lab.length], ['Pemeriksaan radiologi', db.radiologi.length], ['Total tagihan', rup(db.tagihan.reduce((a, x) => a + +x.total, 0))], ['Klaim BPJS (nilai)', rup(db.klaim.filter(x => x.jenis == 'BPJS').reduce((a, x) => a + +x.nilai, 0))], ['Total gaji dibayar', rup(db.payroll.filter(x => x.status == 'Dibayar').reduce((a, x) => a + +x.total, 0))], ['Aset perlu kalibrasi/rusak', db.aset.filter(x => x.kondisi != 'Baik').length], ['Jumlah pegawai', db.pegawai.length]];
  const top = Object.entries(db.rme.reduce((a, x) => (a[x.diagnosa] = (a[x.diagnosa] || 0) + 1, a), {})).sort((a, b) => b[1] - a[1]);
  $('#main').innerHTML = `<div class="${card} p-5 max-w-3xl"><div class="flex justify-between mb-3"><div><h3 class="font-bold text-base">Laporan Rekapitulasi (format data SIRS)</h3><p class="text-slate-500">${esc(db.cms.nama)} – dihitung otomatis dari data</p></div><button class="${btn()}" onclick="window.print()">Cetak</button></div><table class="w-full">${R.map(([a, b]) => `<tr class="border-t border-slate-200 dark:border-slate-700"><td class="py-2">${a}</td><td class="py-2 text-right font-medium">${b}</td></tr>`).join('')}</table><h4 class="font-semibold mt-5 mb-2">10 Besar Penyakit (RME)</h4><table class="w-full">${top.slice(0, 10).map(([a, b]) => `<tr class="border-t border-slate-200 dark:border-slate-700"><td class="py-1">${a}</td><td class="text-right">${b}</td></tr>`).join('')}</table></div>`
}

// ===== CMS =====
function cms() {
  const c = db.cms;
  $('#main').innerHTML = `
    <div class="grid md:grid-cols-2 gap-4">
      <div class="${card} p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i class="fas fa-globe text-blue-600 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg">Kelola Konten Website</h3>
            <p class="text-sm text-slate-500">Edit semua konten halaman publik</p>
          </div>
        </div>
        <p class="text-slate-600 text-sm mb-4">
          Kelola informasi dasar, kontak, layanan, promo, berita, testimoni, dan semua konten yang ditampilkan di website publik rumah sakit.
        </p>
        <button class="${btn()} w-full" onclick="cmsAdmin()">
          <i class="fas fa-edit mr-2"></i>Buka Editor CMS
        </button>
      </div>

      <div class="${card} p-6">
        <h3 class="font-bold text-lg mb-4">Informasi Saat Ini</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Nama RS</span>
            <span class="font-medium">${esc(c.nama)}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Tagline</span>
            <span class="font-medium">${esc(c.tagline)}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Telepon</span>
            <span class="font-medium">${esc(c.telepon)}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Email</span>
            <span class="font-medium">${esc(c.email)}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Hero Slides</span>
            <span class="font-medium">${(db.cms_hero || []).length} slide</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Layanan</span>
            <span class="font-medium">${(db.cms_layanan || []).length} layanan</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Promo</span>
            <span class="font-medium">${(db.cms_promo || []).length} promo</span>
          </div>
          <div class="flex justify-between py-2 border-b border-slate-100">
            <span class="text-slate-500">Berita</span>
            <span class="font-medium">${(db.cms_berita || []).length} artikel</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-slate-500">Testimoni</span>
            <span class="font-medium">${(db.cms_testimoni || []).length} testimoni</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ===== TABLE VIEW =====
function table(k, focus) {
  const s = S[k], st = ST[k] = ST[k] || { q: '', p: 1 }, cols = s.f.filter(f => f[2] != 'text').slice(0, 8);
  const rows = db[k].filter(o => !st.q || s.f.map(f => cell(o, f)).join(' ').toLowerCase().includes(st.q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(rows.length / 10));
  st.p = Math.min(st.p, pages);
  const low = o => k == 'obat' && +o.stok <= +o.stok_min;
  const PRINTABLE = ['tagihan', 'resep', 'pendaftaran', 'lab', 'radiologi', 'rawat_inap', 'igd', 'rme', 'klaim', 'payroll'];
  $('#main').innerHTML = `<div class="${card} p-4"><div class="flex flex-wrap gap-2 mb-3"><input id="q" class="${inp} max-w-xs" placeholder="Cari…" value="${esc(st.q)}" oninput="ST['${k}'].q=this.value;ST['${k}'].p=1;rowsOnly('${k}')">${s.one ? '' : `<button class="${btn()}" onclick="openForm('${k}')">+ Tambah</button>`}<span class="ml-auto self-center text-slate-500">${rows.length} data</span></div><div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b border-slate-200 dark:border-slate-700 text-slate-500"><th class="py-2 pr-3">#</th>${cols.map(f => `<th class="py-2 pr-3 whitespace-nowrap">${f[1]}</th>`).join('')}<th></th></tr></thead><tbody>${rows.slice((st.p - 1) * 10, st.p * 10).map(o => `<tr class="border-b border-slate-100 dark:border-slate-700 ${low(o) ? 'bg-red-50 dark:bg-red-950' : ''}"><td class="py-2 pr-3">${o.id}</td>${cols.map(f => `<td class="py-2 pr-3 whitespace-nowrap">${f[2] == 'sel' ? badge(o[f[0]]) : esc(cell(o, f))}</td>`).join('')}<td class="py-2 whitespace-nowrap text-right">${k == 'pasien' ? `<button class="text-emerald-600 mr-1" onclick="riwayat(${o.id})">Riwayat</button>` : k == 'tagihan' ? `<button class="text-emerald-600 mr-1" onclick="rincian(${o.id})">Rincian</button>` : ''}${PRINTABLE.includes(k) ? `<button class="text-purple-600 mr-1" onclick="printTransaction('${k}',${o.id})" title="Cetak">🖨️</button>` : ''}<button class="text-slate-500 mr-1" onclick="lihat('${k}',${o.id})">Lihat</button><button class="text-blue-600 mr-1" onclick="openForm('${k}',${o.id})">Edit</button>${s.one ? '' : `<button class="text-red-600" onclick="del('${k}',${o.id})">Hapus</button>`}</td></tr>`).join('') || `<tr><td colspan="9" class="py-6 text-center text-slate-400">Tidak ada data</td></tr>`}</tbody></table></div><div class="flex justify-between items-center mt-3"><button class="${btn('slate')}" ${st.p < 2 ? 'disabled' : ''} onclick="ST['${k}'].p--;table('${k}')">‹</button><span>Hal ${st.p} / ${pages}</span><button class="${btn('slate')}" ${st.p >= pages ? 'disabled' : ''} onclick="ST['${k}'].p++;table('${k}')">›</button></div></div>`;
  if (focus) { const q = $('#q'); q.focus(); q.setSelectionRange(q.value.length, q.value.length) }
}
const rowsOnly = k => table(k, true);

// ===== FORM MODAL =====
function openForm(k, id) {
  const s = S[k], o = id ? db[k].find(x => x.id == id) : {};
  const fld = f => {
    const [n, l, t, x] = f, v = o[n] ?? '';
    let i;
    if (t == 'sel') i = `<select name="${n}" class="${inp}">${x.map(a => `<option ${a == v ? 'selected' : ''}>${a}</option>`).join('')}</select>`;
    else if (t == 'ref') i = `<select name="${n}" class="${inp}">${db[x].map(a => `<option value="${a.id}" ${a.id == v ? 'selected' : ''}>${esc(a[S[x].lbl])}</option>`).join('')}</select>`;
    else if (t == 'text') i = `<textarea name="${n}" rows="3" class="${inp}">${esc(v)}</textarea>`;
    else i = `<input name="${n}" type="${t == 'num' ? 'number' : t == 'date' ? 'date' : 'text'}" value="${esc(v)}" class="${inp}" ${t == 'num' ? 'min="0"' : ''} ${n != 'keluar' ? 'required' : ''}>`;
    return `<label class="block"><span class="text-xs text-slate-500">${l}</span>${i}</label>`
  };
  $('#modal').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><form onsubmit="return saveRow(event,'${k}',${id || 0})" class="${card} w-full max-w-lg max-h-full overflow-auto p-5 space-y-3"><h3 class="font-bold text-base">${id ? 'Edit' : 'Tambah'} – ${s.t}</h3>${s.f.map(fld).join('')}<div class="flex gap-2 justify-end"><button type="button" class="${btn('slate')}" onclick="closeM()">Batal</button><button class="${btn()}">Simpan</button></div></form></div>`
}
const closeM = () => { const m = $('#modal'); if (m) m.innerHTML = '' };

// ===== SAVE ROW =====
function saveRow(e, k, id) {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(e.target));
  S[k].f.forEach(f => { if (f[2] == 'ref' || f[2] == 'num') d[f[0]] = +d[f[0]] });
  if (S[k].calc) S[k].calc(d);
  const old = id ? { ...db[k].find(x => x.id == id) } : null;
  if (k == 'rawat_inap' && d.status == 'Pulang' && !d.keluar) d.keluar = today();
  if (k == 'resep' && d.status == 'Diserahkan') {
    const ob = db.obat.find(x => x.id == d.obat);
    const av = +ob.stok + (old && old.status == 'Diserahkan' && old.obat == d.obat ? +old.jumlah : 0);
    if (d.jumlah > av) { toast('Stok ' + ob.nama + ' tidak cukup (tersedia ' + av + ')', 1); return false }
  }
  let row;
  if (id) { row = db[k].find(x => x.id == id); Object.assign(row, d) }
  else { row = { id: Math.max(0, ...db[k].map(x => x.id)) + 1, ...d }; db[k].push(row) }
  sync(k, old, row); save(); closeM(); table(k); toast(id ? 'Perubahan disimpan' : 'Data baru ditambahkan');
  return false
}

// ===== DELETE =====
function del(k, id) {
  const u = used(k, id);
  if (u.length) return toast('Tidak bisa dihapus, masih dipakai oleh: ' + u.map(x => x[0] + ' (' + x[1] + ')').join(', '), 1);
  ask('Hapus data ini? Tindakan tidak dapat dibatalkan.', () => {
    const o = db[k].find(x => x.id == id);
    db[k] = db[k].filter(x => x.id != id);
    sync(k, o, null); save(); table(k); toast('Data dihapus')
  })
}

// ===== TOAST & CONFIRM =====
let _cb, _tt;
function toast(m, bad) {
  const t = $('#toast');
  t.textContent = m;
  t.className = 'fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white shadow-lg max-w-sm bg-' + (bad ? 'red' : 'green') + '-600';
  t.style.zIndex = 70;
  clearTimeout(_tt);
  _tt = setTimeout(() => t.className = 'hidden', 3500)
}

function ask(m, cb) {
  _cb = cb;
  $('#dlg').innerHTML = `<div class="fixed inset-0 bg-black/50 grid place-items-center p-4" style="z-index:60"><div class="${card} p-5 w-full max-w-sm space-y-4"><p>${esc(m)}</p><div class="flex gap-2 justify-end"><button class="${btn('slate')}" onclick="$('#dlg').innerHTML=''">Batal</button><button class="${btn('red')}" onclick="$('#dlg').innerHTML='';_cb()">Ya, lanjutkan</button></div></div></div>`
}

// ===== VIEW DETAIL =====
function lihat(k, id) {
  const o = db[k].find(x => x.id == id);
  const PRINTABLE = ['tagihan', 'resep', 'pendaftaran', 'lab', 'radiologi', 'rawat_inap', 'igd', 'rme', 'klaim', 'payroll'];
  const printBtn = PRINTABLE.includes(k) ? `<button class="${btn()}" onclick="printTransaction('${k}',${o.id})">🖨️ Cetak</button>` : '';
  $('#modal').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="${card} w-full max-w-lg max-h-full overflow-auto p-5"><h3 class="font-bold text-base mb-2">Detail – ${S[k].t} #${o.id}</h3><table class="w-full">${S[k].f.map(f => `<tr class="border-t border-slate-100 dark:border-slate-700"><td class="py-1 pr-3 text-slate-500 align-top">${f[1]}</td><td>${f[2] == 'sel' ? badge(o[f[0]]) : esc(cell(o, f))}</td></tr>`).join('')}</table><div class="flex gap-2 justify-end mt-4"><button class="${btn('slate')}" onclick="closeM()">Tutup</button>${printBtn}<button class="${btn()}" onclick="closeM();openForm('${k}',${o.id})">Edit</button></div></div></div>`
}

// ===== REFERENCE CHECK =====
const used = (k, id) => Object.keys(S).flatMap(c => S[c].f.filter(f => f[2] == 'ref' && f[3] == k).map(f => [S[c].t, db[c].filter(o => o[f[0]] == id).length])).filter(x => x[1]);

// ===== HELPERS =====
const today = () => new Date().toISOString().slice(0, 10);
const nid = c => Math.max(0, ...db[c].map(x => x.id)) + 1;

// ===== BILLING CONSTANTS =====
const TR = { Merah: 750000, Kuning: 400000, Hijau: 200000, Hitam: 100000 };
const RAD = { Rontgen: 200000, USG: 300000, 'CT Scan': 1500000, MRI: 3000000 };
const tstat = t => t.status = t.dibayar >= t.total && t.total > 0 ? 'Lunas' : t.dibayar > 0 ? 'Sebagian' : 'Belum Bayar';

// ===== BILLING FUNCTIONS =====
function unbill(src) {
  db.tagihan.forEach(t => {
    const it = (t.items || []).filter(i => i.src == src);
    if (it.length) { t.items = t.items.filter(i => i.src != src); t.total -= it.reduce((a, i) => a + i.amt, 0); tstat(t) }
  })
}

function bill(p, src, ket, amt) {
  unbill(src);
  let t = db.tagihan.find(x => x.auto && x.pasien == p && x.status != 'Lunas');
  if (!t) { const i = nid('tagihan'); t = { id: i, no: 'INV-A' + i, tgl: today(), pasien: p, total: 0, dibayar: 0, metode: 'Tunai', status: 'Belum Bayar', items: [], auto: true }; db.tagihan.push(t) }
  t.items.push({ src, ket, amt }); t.total += amt; tstat(t)
}

const jr = (src, akun, ket, d, k) => db.jurnal.push({ id: nid('jurnal'), tgl: today(), akun, ket, debit: d, kredit: k, src });
const unjr = src => db.jurnal = db.jurnal.filter(j => j.src != src);
const stok = (i, d) => { const x = db.obat.find(o => o.id == i); if (x) x.stok = +x.stok + d };
const setK = (i, s) => { const x = db.kamar.find(o => o.id == i); if (x) x.status = s };

// ===== SYNC MODULES =====
function sync(k, o, n) {
  const id = (n || o).id;
  if (k == 'resep') { if (o && o.status == 'Diserahkan') stok(o.obat, +o.jumlah); unbill('rs' + id); if (n && n.status == 'Diserahkan') { stok(n.obat, -n.jumlah); const ob = db.obat.find(x => x.id == n.obat); bill(n.pasien, 'rs' + id, `Obat ${ob.nama} x${n.jumlah}`, ob.harga * n.jumlah) } }
  if (k == 'pendaftaran') { unbill('pd' + id); if (n && n.status == 'Selesai') bill(n.pasien, 'pd' + id, 'Konsultasi dokter – ' + lab('poli', n.poli), 150000) }
  if (k == 'igd') { unbill('ig' + id); if (n && ['Pulang', 'Dirujuk'].includes(n.status)) bill(n.pasien, 'ig' + id, 'Tindakan IGD (triase ' + n.triase + ')', TR[n.triase]) }
  if (k == 'lab') { unbill('lb' + id); if (n && n.status == 'Selesai') bill(n.pasien, 'lb' + id, 'Lab: ' + n.periksa, 120000) }
  if (k == 'radiologi') { unbill('rd' + id); if (n && n.status == 'Selesai') bill(n.pasien, 'rd' + id, 'Radiologi: ' + n.modalitas + ' ' + n.area, RAD[n.modalitas]) }
  if (k == 'rawat_inap') { if (o && o.status == 'Dirawat') setK(o.kamar, 'Kosong'); unbill('ri' + id); if (n) { if (n.status == 'Dirawat') setK(n.kamar, 'Terisi'); else { const h = Math.max(1, Math.round((new Date(n.keluar || today()) - new Date(n.masuk)) / 864e5)), kt = db.kamar.find(x => x.id == n.kamar); bill(n.pasien, 'ri' + id, `Rawat inap ${kt.kode} (kelas ${kt.kelas}) ${h} hari`, kt.tarif * h) } } }
  if (k == 'tagihan' && n) { const d = +n.dibayar - (o ? +o.dibayar : 0); if (d > 0) { const s = 'tg' + id + '-' + Date.now(); jr(s, 'Kas', 'Pembayaran ' + n.no, d, 0); jr(s, 'Pendapatan Pasien', 'Pembayaran ' + n.no, 0, d) } }
  if (k == 'klaim' && n && n.status == 'Dibayar' && (!o || o.status != 'Dibayar')) { const t = db.tagihan.find(x => x.id == n.tagihan); if (t) { t.dibayar = Math.min(t.total, +t.dibayar + +n.nilai); t.metode = 'BPJS'; tstat(t) } jr('kl' + id, 'Kas', 'Pencairan klaim ' + n.no, +n.nilai, 0); jr('kl' + id, 'Piutang BPJS', 'Pencairan klaim ' + n.no, 0, +n.nilai) }
  if (k == 'payroll') { unjr('pr' + id); if (n && n.status == 'Dibayar') { const t = 'Gaji ' + lab('pegawai', n.pegawai) + ' ' + n.periode; jr('pr' + id, 'Beban Gaji', t, n.total, 0); jr('pr' + id, 'Kas', t, 0, n.total) } }
}

// ===== RIWAYAT PASIEN =====
function riwayat(id) {
  const p = db.pasien.find(x => x.id == id);
  const sec = ['pendaftaran', 'rme', 'igd', 'rawat_inap', 'lab', 'radiologi', 'resep', 'tagihan', 'klaim'].map(c => {
    const rs = db[c].filter(o => o.pasien == id);
    return rs.length ? `<h4 class="font-semibold mt-3">${S[c].t} (${rs.length})</h4>` + rs.map(o => `<div class="text-xs border-t border-slate-100 dark:border-slate-700 py-1 flex justify-between"><span>${S[c].f.filter(f => f[0] != 'pasien' && f[2] != 'text').slice(0, 6).map(f => esc(cell(o, f))).join(' · ')}</span><button class="text-purple-600 underline ml-2 shrink-0" onclick="printTransaction('${c}',${o.id})">🖨️</button></div>`).join('') : ''
  }).join('');
  $('#modal').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="${card} w-full max-w-2xl max-h-full overflow-auto p-5"><h3 class="font-bold text-base">Riwayat Pasien: ${esc(p.nama)} (${p.no_rm})</h3><p class="text-slate-500">${p.jk} · lahir ${p.tgl_lahir} · ${p.penjamin}</p>${sec || '<p class="mt-3 text-slate-400">Belum ada riwayat layanan.</p>'}<div class="text-right mt-4"><button class="${btn('slate')}" onclick="closeM()">Tutup</button></div></div></div>`
}

// ===== RINCIAN TAGIHAN =====
function rincian(id) {
  const t = db.tagihan.find(x => x.id == id);
  $('#modal').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="${card} w-full max-w-lg max-h-full overflow-auto p-5"><h3 class="font-bold text-base">Rincian ${t.no}</h3><p class="text-slate-500">${esc(lab('pasien', t.pasien))} · ${t.tgl}</p><table class="w-full mt-3">${(t.items || []).map(i => `<tr class="border-t border-slate-100 dark:border-slate-700"><td class="py-1">${esc(i.ket)}</td><td class="text-right">${rup(i.amt)}</td></tr>`).join('') || '<tr><td class="text-slate-400 py-2">Tagihan manual / data awal (tanpa rincian layanan)</td></tr>'}<tr class="border-t font-semibold"><td class="py-1">Total</td><td class="text-right">${rup(t.total)}</td></tr><tr><td>Dibayar</td><td class="text-right">${rup(t.dibayar)}</td></tr><tr><td>Sisa</td><td class="text-right">${rup(t.total - t.dibayar)}</td></tr></table><div class="flex gap-2 justify-end mt-4"><button class="${btn('slate')}" onclick="closeM()">Tutup</button><button class="${btn()}" onclick="printTransaction('tagihan',${t.id})">🖨️ Cetak Invoice</button></div></div></div>`
}

// ===== DATABASE MODAL =====
function dbModal() {
  $('#modal').innerHTML = `<div class="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4"><div class="${card} w-full max-w-2xl max-h-full overflow-auto p-5 space-y-3"><h3 class="font-bold text-base">Basis Data JSON</h3><p class="text-slate-500">Backup berisi seluruh data (termasuk kata sandi pengguna) - simpan di tempat aman. Tempel/pilih file JSON lalu klik Impor untuk memulihkan.</p><textarea id="jt" rows="10" class="${inp} font-mono text-xs">${esc(JSON.stringify(db))}</textarea><div class="flex flex-wrap gap-2 items-center"><button class="${btn('emerald')}" onclick="dbDownload()">⬇ Unduh backup (.json)</button><label class="${btn('slate')} inline-block">Pilih file…<input type="file" accept="application/json,.json" class="hidden" onchange="dbFile(this)"></label></div><div class="flex gap-2 justify-end"><button class="${btn('red')} mr-auto" onclick="ask('Reset ke data dummy awal? Semua perubahan akan hilang.',()=>{db=seed();normalizeDb();save();closeM();shell();toast('Data direset ke dummy awal')})">Reset Dummy</button><button class="${btn('slate')}" onclick="closeM()">Tutup</button><button class="${btn()}" onclick="dbImport()">Impor</button></div></div></div>`
}

function dbDownload() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
  a.download = 'simrs-backup-' + today() + '.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500)
}

function dbFile(inp) {
  const f = inp.files && inp.files[0];
  if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { $('#jt').value = rd.result; toast('File dimuat. Klik "Impor" untuk menerapkan.') };
  rd.readAsText(f)
}

function dbImport() {
  try {
    const x = JSON.parse($('#jt').value);
    if (!x || typeof x != 'object' || Array.isArray(x) || !Object.keys(x).some(k => k == 'cms' || k in S)) throw 0;
    const prev = db;
    db = x; normalizeDb();
    if (!save()) { db = prev; return }
    closeM(); shell(); toast('Data berhasil diimpor')
  } catch (e) { toast('JSON tidak valid', 1) }
}

// ===== CMS ADMIN - KELOLA KONTEN WEBSITE PUBLIK (v2) =====
// Perbaikan utama:
//  - Konten tab dirender ULANG dari data terbaru (tidak lagi memakai snapshot HTML usang
//    yang menimpa perubahan saat berpindah tab).
//  - Field berawalan "c:" -> tersimpan semua, termasuk yang namanya mengandung "_"
//    (telepon_igd, jam_*, stat_*, tentang_* sebelumnya TIDAK pernah tersimpan).
//  - Semua tombol di dalam form bertipe "button" (tidak memicu submit tanpa sengaja).
//  - Tambah / hapus / urutkan item tidak lagi membuang tab aktif & perubahan yang belum disimpan.
// ----- Spesifikasi gambar (ditampilkan di tiap kolom unggah & ditegakkan saat upload) -----
const IMG_MAX_PX = 6000;      // resolusi maksimum file asli (lebar/tinggi)
const IMG_SPECS = {
  hero:    { w: 1600, h: 900, fit: 'inside', type: 'jpeg', outKB: 450, maxFileMB: 5,   rec: '1920 × 800 px (lanskap)',            tip: 'Pilih foto dengan area kosong di sisi kiri agar teks terbaca.' },
  poli:    { w: 800,  h: 450, fit: 'cover',  type: 'jpeg', outKB: 110, maxFileMB: 3,   rec: '800 × 450 px (16:9)',                 tip: 'Foto ruang/area poliklinik. Tanpa foto, kartu memakai ikon.' },
  dokter:  { w: 400,  h: 400, fit: 'cover',  type: 'jpeg', outKB: 70,  maxFileMB: 2,   rec: '400 × 400 px (persegi 1:1)',          tip: 'Foto setengah badan, wajah di bagian atas, latar polos.', top: true },
  promo:   { w: 800,  h: 450, fit: 'cover',  type: 'jpeg', outKB: 110, maxFileMB: 3,   rec: '800 × 450 px (16:9)',                 tip: 'Teks penting jangan terlalu di pinggir karena tepi bisa terpotong.' },
  berita:  { w: 800,  h: 450, fit: 'cover',  type: 'jpeg', outKB: 110, maxFileMB: 3,   rec: '800 × 450 px (16:9)',                 tip: 'Tampil sebagai gambar kartu dan header artikel.' },
  logo:    { w: 400,  h: 400, fit: 'inside', type: 'png',  outKB: 100, maxFileMB: 1,   rec: 'maks. 400 × 400 px (PNG transparan)', tip: 'Gunakan logo dengan latar transparan agar rapi di navbar & footer.' },
  favicon: { w: 128,  h: 128, fit: 'cover',  type: 'png',  outKB: 40,  maxFileMB: 0.5, rec: '128 × 128 px (persegi, min. 64 px)',  tip: 'Ikon kecil di tab browser; gunakan gambar sederhana.' }
};
const fmtKB = b => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB';
const imgFileLimit = sp => sp.maxFileMB >= 1 ? sp.maxFileMB + ' MB' : Math.round(sp.maxFileMB * 1024) + ' KB';
const imgSpecText = k => { const x = IMG_SPECS[k]; return `Ukuran ideal: <b>${x.rec}</b> · Resolusi file maks. <b>${IMG_MAX_PX} × ${IMG_MAX_PX} px</b> · Ukuran file maks. <b>${imgFileLimit(x)}</b> · Format JPG / PNG / WebP. ${x.tip} Hasil otomatis ${x.fit == 'cover' ? 'dipotong &amp; ' : ''}diperkecil dan dikompres (≤ ${x.outKB} KB).` };
const imgSpecShort = k => { const x = IMG_SPECS[k]; return `${x.rec} · maks. file ${imgFileLimit(x)}` };

// Penyimpanan browser (localStorage) terbatas ±5 MB: tampilkan pemakaian agar admin tahu sisa ruang
const STORAGE_LIMIT = 5 * 1024 * 1024;
function storageUsed() {
  let n = 0;
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += k.length + (localStorage.getItem(k) || '').length } } catch (e) { }
  return n
}
function storageBadge() {
  const u = storageUsed(), pct = Math.round(u / STORAGE_LIMIT * 100);
  return `<span id="cms-storage" class="text-xs ${pct >= 80 ? 'text-red-600 font-semibold' : 'text-slate-500'}">Penyimpanan browser: ${(u / 1048576).toFixed(2)} MB dari ±5 MB (${pct}%)${pct >= 80 ? ' — hampir penuh, kecilkan/hapus gambar atau backup data' : ''}</span>`
}
const FA_ICONS = ['fa-user-md', 'fa-microscope', 'fa-heart', 'fa-heartbeat', 'fa-clock', 'fa-ambulance', 'fa-stethoscope', 'fa-hospital', 'fa-procedures', 'fa-x-ray', 'fa-flask', 'fa-pills', 'fa-syringe', 'fa-shield-alt', 'fa-award', 'fa-star', 'fa-hands-helping', 'fa-users', 'fa-check-circle', 'fa-phone-alt', 'fa-parking', 'fa-wifi'];
const cmsStorageUpdate = () => { const e = $('#cms-storage'); if (e) e.outerHTML = storageBadge() };

// Baca file -> potong/perkecil -> kompres hingga di bawah batas, kembalikan data URL
function imgPrepare(file, sp) {
  return new Promise((res, rej) => {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return rej(new Error('Format tidak didukung. Gunakan JPG, PNG, atau WebP.'));
    if (file.size > sp.maxFileMB * 1048576) return rej(new Error(`Ukuran file ${fmtKB(file.size)} melebihi batas ${imgFileLimit(sp)}. Perkecil file lalu coba lagi.`));
    const url = URL.createObjectURL(file), img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('File gambar rusak atau tidak dapat dibaca.')) };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const W = img.naturalWidth, H = img.naturalHeight;
      if (W > IMG_MAX_PX || H > IMG_MAX_PX) return rej(new Error(`Resolusi ${W} × ${H} px melebihi batas ${IMG_MAX_PX} × ${IMG_MAX_PX} px.`));
      let sx = 0, sy = 0, sw = W, sh = H;
      if (sp.fit == 'cover') {                       // potong ke rasio target (tengah; foto orang: condong ke atas)
        const ar = sp.w / sp.h;
        if (sw / sh > ar) { sw = Math.round(sh * ar); sx = Math.round((W - sw) / 2) }
        else { sh = Math.round(sw / ar); sy = Math.round((H - sh) * (sp.top ? 0.15 : 0.5)) }
      }
      let scale = Math.min(1, sp.w / sw, sp.h / sh);  // tidak pernah memperbesar
      const png = sp.type == 'png';
      for (let t = 0; t < 6; t++) {
        const cw = Math.max(1, Math.round(sw * scale)), ch = Math.max(1, Math.round(sh * scale));
        const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
        const g = cv.getContext('2d');
        if (!png) { g.fillStyle = '#fff'; g.fillRect(0, 0, cw, ch) }
        g.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
        for (const q of png ? [undefined] : [0.85, 0.75, 0.65, 0.55, 0.45]) {
          const data = cv.toDataURL(png ? 'image/png' : 'image/jpeg', q), kb = Math.round(data.length * 0.75 / 1024);
          if (kb <= sp.outKB) return res({ data, w: cw, h: ch, kb });
        }
        scale *= 0.8;
      }
      rej(new Error(`Gambar terlalu detail untuk dikompres hingga ≤ ${sp.outKB} KB. Gunakan gambar yang lebih sederhana atau lebih kecil.`));
    };
    img.src = url;
  });
}

// Komponen kolom gambar: pratinjau + unggah + hapus + keterangan ukuran
function cmsImage(name, value, spec, o = {}) {
  const v = String(value || ''), isData = /^data:/i.test(v), pv = cmsSafeImg(v), nm = esc(name);
  const box = (o.box || 'w-28 h-16') + ' ' + (o.round ? 'rounded-full' : 'rounded-lg');
  const hidden = `<input type="hidden" name="${nm}" value="${esc(v)}">`;
  const field = o.compact ? hidden
    : isData ? hidden + `<div class="text-xs text-slate-500">Gambar diunggah (${fmtKB(v.length * 0.75)})</div>`
      : `<input name="${nm}" class="${inp}" value="${esc(v)}" placeholder="Unggah gambar, atau tempel URL https://...">`;
  const preview = `<div class="shrink-0 ${box} overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-[10px] text-slate-400 text-center leading-tight">${pv ? `<img src="${esc(pv)}" alt="" class="w-full h-full ${o.contain ? 'object-contain' : 'object-cover'}" onerror="this.remove()">` : 'Belum ada gambar'}</div>`;
  const btns = `<div class="flex flex-wrap items-center gap-2"><label class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer">${v ? 'Ganti' : 'Unggah'} gambar<input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" onchange="cmsImgUpload(this,'${spec}','${nm}')"></label>${v ? `<button type="button" class="text-xs text-red-600 underline" onclick="cmsImgClear('${nm}')">Hapus</button>` : ''}</div>`;
  const note = `<p class="text-[11px] leading-snug text-slate-400">${o.compact ? imgSpecShort(spec) : imgSpecText(spec)}</p>`;
  return `<div class="space-y-1.5">${o.label ? `<span class="text-xs text-slate-500 dark:text-slate-400">${o.label}</span>` : ''}<div class="flex items-start gap-3">${preview}<div class="flex-1 min-w-[180px] space-y-1.5">${field}${btns}${note}</div></div></div>`;
}

const CMS_TABS = [
  { id: 'info', label: 'Informasi Dasar', icon: 'fa-info-circle' },
  { id: 'kontak', label: 'Kontak & Sosmed', icon: 'fa-phone' },
  { id: 'jam', label: 'Jam Operasional', icon: 'fa-clock' },
  { id: 'stat', label: 'Statistik', icon: 'fa-chart-bar' },
  { id: 'tentang', label: 'Tentang RS & Logo', icon: 'fa-hospital' },
  { id: 'navtop', label: 'Menu Atas', icon: 'fa-bars' },
  { id: 'navbawah', label: 'Menu Bawah', icon: 'fa-link' },
  { id: 'legal', label: 'Kebijakan & Syarat', icon: 'fa-file-contract' },
  { id: 'hero', label: 'Hero Slider', icon: 'fa-images' },
  { id: 'poli', label: 'Poliklinik', icon: 'fa-house-medical' },
  { id: 'dokter', label: 'Foto Dokter', icon: 'fa-user-md' },
  { id: 'layanan', label: 'Layanan', icon: 'fa-stethoscope' },
  { id: 'promo', label: 'Promo', icon: 'fa-tag' },
  { id: 'berita', label: 'Berita', icon: 'fa-newspaper' },
  { id: 'testi', label: 'Testimoni', icon: 'fa-comments' }
];
let CMS_TAB = 'info', CMS_DOK_Q = '', CMS_POLI_Q = '';

// Spesifikasi field per koleksi: [nama, tipe]  (tipe: bool | num | rating | teks default)
const CMS_ITEMS = {
  cms_hero: { p: 'hero', f: [['badge'], ['judul'], ['subtitle'], ['cta1_text'], ['cta1_link'], ['cta2_text'], ['cta2_link'], ['gambar'], ['warna'], ['aktif', 'bool']] },
  cms_layanan: { p: 'layanan', f: [['nama'], ['deskripsi'], ['icon'], ['aktif', 'bool'], ['darurat', 'bool']] },
  cms_promo: { p: 'promo', f: [['judul'], ['deskripsi'], ['harga_asli', 'num'], ['harga_promo', 'num'], ['label'], ['gambar'], ['aktif', 'bool']] },
  cms_berita: { p: 'berita', f: [['judul'], ['ringkasan'], ['isi'], ['tanggal'], ['kategori'], ['icon'], ['gambar'], ['aktif', 'bool']] },
  cms_testimoni: { p: 'testi', f: [['nama'], ['profesi'], ['ulasan'], ['rating', 'rating'], ['aktif', 'bool']] },
  cms_mengapa: { p: 'mengapa', f: [['judul'], ['deskripsi'], ['icon'], ['aktif', 'bool']] },
  cms_nav_top: { p: 'navtop', f: [['label'], ['url'], ['aktif', 'bool'], ['baru', 'bool']] },
  cms_nav_bottom: { p: 'navbawah', f: [['label'], ['url'], ['area'], ['aktif', 'bool'], ['baru', 'bool']] },
  poli: { p: 'poli', f: [['icon'], ['deskripsi'], ['foto'], ['tampil', 'bool']] },   // tampilan poliklinik di website
  dokter: { p: 'dokter', f: [['foto'], ['tampil', 'bool']] }          // foto & visibilitas dokter di website
};
const HERO_TONES = [['blue', 'Biru (default)'], ['red', 'Merah (darurat)'], ['emerald', 'Hijau'], ['indigo', 'Indigo']];

const cmsTabCls = on => 'px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap ' +
  (on ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600');
const cmsBox = 'border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-2';
const cmsSafeImg = u => { u = String(u || '').trim(); return u && (/^(https?:\/\/|data:image\/)/i.test(u) || !/^[a-z][a-z0-9+.-]*:/i.test(u)) ? u : '' };

function cmsField(name, label, val, o = {}) {
  const t = o.type || 'text', ph = o.ph ? ` placeholder="${esc(o.ph)}"` : '', ex = o.attrs || '';
  const input = t == 'textarea'
    ? `<textarea name="${name}" rows="${o.rows || 3}" class="${inp}"${ph}>${esc(val)}</textarea>`
    : `<input name="${name}" type="${t}" class="${inp}" value="${esc(val)}"${ph} ${ex}>`;
  return `<label class="block ${o.cls || ''}"><span class="text-xs text-slate-500 dark:text-slate-400">${label}</span>${input}${o.hint ? `<span class="block text-[11px] text-slate-400 mt-0.5">${o.hint}</span>` : ''}</label>`;
}
const cmsCheck = (name, label, on) => `<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}> ${label}</label>`;

function cmsItemHead(col, id, title, i, n) {
  const b = 'px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 disabled:opacity-30';
  return `<div class="flex justify-between items-center gap-2"><h4 class="font-semibold text-sm truncate">${i + 1}. ${esc(title)}</h4><div class="flex gap-1 shrink-0">` +
    `<button type="button" class="${b}" ${i == 0 ? 'disabled' : ''} onclick="moveCmsItem('${col}',${id},-1)" title="Naikkan">↑</button>` +
    `<button type="button" class="${b}" ${i == n - 1 ? 'disabled' : ''} onclick="moveCmsItem('${col}',${id},1)" title="Turunkan">↓</button>` +
    `<button type="button" class="px-2 py-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onclick="deleteCmsItem('${col}',${id})">Hapus</button></div></div>`;
}
const cmsAddBtn = (col, label) => `<button type="button" class="${btn()} w-full" onclick="addCmsItem('${col}')">+ ${label}</button>`;
const cmsEmpty = t => `<p class="text-slate-400 text-center py-6">Belum ada ${t}. Klik tombol tambah di bawah.</p>`;

function cmsTab(id) {
  const c = db.cms, H = t => `<h3 class="font-bold text-lg mb-4">${t}</h3>`;
  const list = k => db[k] || [];
  if (id == 'info') return H('Informasi Dasar Rumah Sakit') + `<div class="space-y-3">
    ${cmsField('c:nama', 'Nama Rumah Sakit', c.nama)}
    ${cmsField('c:tagline', 'Tagline', c.tagline)}
    ${cmsField('c:alamat', 'Alamat (dipakai juga untuk peta di website)', c.alamat, { type: 'textarea', rows: 2 })}
    ${cmsField('c:info', 'Info Dashboard', c.info)}
    ${cmsField('c:copyright', 'Copyright', c.copyright)}</div>`;
  if (id == 'kontak') return H('Kontak & Social Media') + `<div class="space-y-3">
    ${cmsField('c:telepon', 'Telepon Utama', c.telepon)}
    ${cmsField('c:telepon_igd', 'Telepon IGD', c.telepon_igd)}
    ${cmsField('c:email', 'Email', c.email, { type: 'email' })}
    ${cmsField('c:whatsapp', 'WhatsApp (dengan kode negara)', c.whatsapp, { ph: '6281234567890', hint: 'Angka saja, tanpa + atau spasi. Contoh: 6281234567890' })}
    ${cmsField('c:fax', 'Fax', c.fax)}
    <hr class="my-4 border-slate-200 dark:border-slate-700">
    ${cmsField('c:facebook', 'Facebook URL', c.facebook, { ph: 'https://facebook.com/...', hint: 'Kosongkan untuk menyembunyikan ikon di website.' })}
    ${cmsField('c:instagram', 'Instagram URL', c.instagram, { ph: 'https://instagram.com/...' })}
    ${cmsField('c:youtube', 'YouTube URL', c.youtube, { ph: 'https://youtube.com/...' })}
    ${cmsField('c:tiktok', 'TikTok URL', c.tiktok, { ph: 'https://tiktok.com/@...' })}
    <hr class="my-4 border-slate-200 dark:border-slate-700">
    <h4 class="font-semibold text-sm">Pengiriman Formulir Website</h4>
    <p class="text-xs text-slate-500">Menentukan ke mana pendaftaran online &amp; pesan dari website dikirim. Agar langsung masuk ke menu <b>Inbox Website</b> (dengan persetujuan admin) di situs GitHub Pages, siapkan <b>Server Inbox</b> (gratis) - lihat <b>PANDUAN-INBOX-ONLINE.md</b> - lalu isi alamatnya di bawah dan terbitkan.</p>
    ${cmsField('c:inbox_url', 'Alamat Server Inbox (https)', c.inbox_url, { ph: 'https://inbox-rs.nama-akun.workers.dev', hint: 'Alamat Cloudflare Worker dari panduan. Kosongkan bila belum disiapkan.' })}
    <label class="block"><span class="text-xs text-slate-500 dark:text-slate-400">Cara pengiriman</span><select name="c:form_mode" class="${inp}">
      <option value="auto" ${(c.form_mode || 'auto') == 'auto' ? 'selected' : ''}>Otomatis: Server Inbox bila alamat diisi; uji lokal → inbox lokal; selain itu → WhatsApp</option>
      <option value="inbox" ${c.form_mode == 'inbox' ? 'selected' : ''}>Server Inbox → masuk ke menu Inbox Website, menunggu persetujuan admin (disarankan)</option>
      <option value="whatsapp" ${c.form_mode == 'whatsapp' ? 'selected' : ''}>WhatsApp (pesan terisi dikirim ke nomor RS di atas)</option>
      <option value="endpoint" ${c.form_mode == 'endpoint' ? 'selected' : ''}>Endpoint formulir pihak ketiga (Formspree, Web3Forms, dll.)</option>
      <option value="lokal" ${c.form_mode == 'lokal' ? 'selected' : ''}>Inbox lokal (hanya uji coba; tidak sampai ke admin bila pengunjung beda browser)</option></select></label>
    ${cmsField('c:form_endpoint', 'URL endpoint formulir pihak ketiga (https)', c.form_endpoint, { ph: 'https://formspree.io/f/xxxxxxx', hint: 'Hanya dipakai bila cara pengiriman = Endpoint. Data dikirim sebagai JSON via POST.' })}</div>`;
  if (id == 'jam') return H('Jam Operasional') + `<div class="space-y-3">
    ${cmsField('c:jam_senin_jumat', 'Senin - Jumat', c.jam_senin_jumat)}
    ${cmsField('c:jam_sabtu', 'Sabtu', c.jam_sabtu)}
    ${cmsField('c:jam_minggu', 'Minggu', c.jam_minggu)}
    ${cmsField('c:jam_igd', 'IGD', c.jam_igd)}</div>`;
  if (id == 'stat') return H('Statistik Rumah Sakit') + `<div class="space-y-3">
    ${cmsField('c:stat_tenaga_medis', 'Jumlah Tenaga Medis', c.stat_tenaga_medis, { type: 'number', attrs: 'min="0"' })}
    ${cmsField('c:stat_pasien_dilayani', 'Jumlah Pasien Dilayani', c.stat_pasien_dilayani, { type: 'number', attrs: 'min="0"' })}
    ${cmsField('c:stat_mitra', 'Jumlah Mitra Kerjasama', c.stat_mitra, { type: 'number', attrs: 'min="0"' })}
    ${cmsField('c:stat_penghargaan', 'Jumlah Penghargaan', c.stat_penghargaan, { type: 'number', attrs: 'min="0"' })}</div>`;
  if (id == 'tentang') return H('Tentang Rumah Sakit') + `<div class="space-y-3">
    ${cmsField('c:tentang_sejarah', 'Sejarah', c.tentang_sejarah, { type: 'textarea', rows: 3 })}
    ${cmsField('c:tentang_visi', 'Visi', c.tentang_visi, { type: 'textarea', rows: 2 })}
    ${cmsField('c:tentang_misi', 'Misi', c.tentang_misi, { type: 'textarea', rows: 5, hint: 'Satu poin per baris.' })}</div>
    <h3 class="font-bold text-lg mt-8 mb-1">Bagian "Mengapa Memilih Kami?"</h3>
    <p class="text-xs text-slate-500 mb-3">Kartu keunggulan di sisi kanan bagian Tentang Kami. Isi kolom <b>Icon</b> dengan nama Font Awesome (mis. <code>fa-user-md</code>, <code>fa-heart</code>); pilihan umum tersedia di daftar saat mengetik. Bila semua item nonaktif/dihapus, kartu disembunyikan.</p>
    <datalist id="fa-icons">${FA_ICONS.map(i => `<option value="${i}">`).join('')}</datalist>
    <div class="space-y-3">
      ${cmsField('c:mengapa_judul', 'Judul bagian', c.mengapa_judul)}
      ${((M) => M.map((x, i) => `<div class="${cmsBox}">${cmsItemHead('cms_mengapa', x.id, x.judul || '(tanpa judul)', i, M.length)}
        ${cmsField('mengapa_' + x.id + '_judul', 'Judul keunggulan', x.judul)}
        ${cmsField('mengapa_' + x.id + '_deskripsi', 'Deskripsi', x.deskripsi, { type: 'textarea', rows: 2 })}
        ${cmsField('mengapa_' + x.id + '_icon', 'Icon (Font Awesome)', x.icon, { ph: 'fa-user-md', attrs: 'list="fa-icons"' })}
        ${cmsCheck('mengapa_' + x.id + '_aktif', 'Aktif (tampil)', x.aktif)}</div>`).join('') || cmsEmpty('keunggulan'))(list('cms_mengapa'))}
      ${cmsAddBtn('cms_mengapa', 'Tambah Keunggulan')}
    </div>
    <h3 class="font-bold text-lg mt-8 mb-1">Identitas Visual</h3>
    <p class="text-xs text-slate-500 mb-3">Logo tampil di navbar, footer, dan bagian Tentang; favicon tampil di tab browser (website &amp; panel admin).</p>
    <div class="grid md:grid-cols-2 gap-4">
      <div class="${cmsBox}">${cmsImage('c:logo', c.logo, 'logo', { label: 'Logo Rumah Sakit', box: 'w-24 h-24', contain: true })}</div>
      <div class="${cmsBox}">${cmsImage('c:favicon', c.favicon, 'favicon', { label: 'Favicon', box: 'w-16 h-16', contain: true })}</div>
    </div>`;

  if (id == 'hero') {
    const L = list('cms_hero');
    return H('Hero Slider') + `<div class="${cmsBox} mb-4 bg-slate-50 dark:bg-slate-900/40">
      <h4 class="font-semibold text-sm">Pengaturan Slideshow</h4>
      <div class="grid sm:grid-cols-2 gap-3 items-end">
        ${cmsField('c:hero_interval', 'Durasi tiap slide (detik)', c.hero_interval ?? 5, { type: 'number', attrs: 'min="2" max="20"' })}
        ${cmsCheck('c:hero_autoplay', 'Putar otomatis (autoplay)', c.hero_autoplay !== false)}
      </div>
      <p class="text-xs text-slate-400">Navigasi di website: panah kiri/kanan, titik slide, tombol jeda, geser (swipe) di layar sentuh, dan tombol keyboard ← →. Hanya slide berstatus <b>Aktif</b> yang tampil.</p></div>
      <div class="space-y-4">${L.map((h, i) => `<div class="${cmsBox}">${cmsItemHead('cms_hero', h.id, h.judul, i, L.length)}
        ${cmsField('hero_' + h.id + '_badge', 'Badge', h.badge)}
        ${cmsField('hero_' + h.id + '_judul', 'Judul', h.judul)}
        ${cmsField('hero_' + h.id + '_subtitle', 'Subtitle', h.subtitle, { type: 'textarea', rows: 2 })}
        <div class="grid sm:grid-cols-2 gap-2">
          ${cmsField('hero_' + h.id + '_cta1_text', 'Tombol 1 - Teks', h.cta1_text)}
          ${cmsField('hero_' + h.id + '_cta1_link', 'Tombol 1 - Link', h.cta1_link, { ph: '#dokter, tel:..., https://...' })}
          ${cmsField('hero_' + h.id + '_cta2_text', 'Tombol 2 - Teks', h.cta2_text)}
          ${cmsField('hero_' + h.id + '_cta2_link', 'Tombol 2 - Link', h.cta2_link)}
        </div>
        ${cmsImage('hero_' + h.id + '_gambar', h.gambar, 'hero', { label: 'Gambar latar (kosong = gambar bawaan)', box: 'w-32 h-20' })}
        <label class="block"><span class="text-xs text-slate-500 dark:text-slate-400">Warna overlay</span><select name="hero_${h.id}_warna" class="${inp}">${HERO_TONES.map(([v, l]) => `<option value="${v}" ${h.warna == v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        ${cmsCheck('hero_' + h.id + '_aktif', 'Aktif (tampil di website)', h.aktif)}</div>`).join('') || cmsEmpty('slide')}${cmsAddBtn('cms_hero', 'Tambah Slide')}</div>`;
  }

  if (id == 'navtop' || id == 'navbawah') {
    const bottom = id == 'navbawah', col = bottom ? 'cms_nav_bottom' : 'cms_nav_top', pf = bottom ? 'navbawah' : 'navtop', L = list(col);
    return H(bottom ? 'Menu Navigasi Bawah (Footer)' : 'Menu Navigasi Atas (Navbar)') +
      `<div class="${cmsBox} mb-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500">
        ${bottom ? 'Menu bawah tampil di <b>footer</b>: area <b>Kolom Link Cepat</b> (daftar tautan) dan <b>Baris bawah</b> (di samping copyright).' : 'Menu atas tampil di <b>navbar</b> (desktop &amp; menu mobile).'}
        Tautan ke bagian halaman: <code>#beranda</code>, <code>#layanan</code>, <code>#dokter</code>, dst. Bisa juga <code>https://…</code>, <code>tel:…</code>, atau <code>mailto:…</code>.
        Tautan khusus <code>#kebijakan-privasi</code> dan <code>#syarat-ketentuan</code> membuka jendela modal (isi diatur di tab <b>Kebijakan &amp; Syarat</b>). Menu nonaktif / tautan kosong tidak ditampilkan. Menu ke bagian yang kosong (mis. Promo tanpa item aktif) otomatis disembunyikan.</div>
      <datalist id="nav-anchors">${['#beranda', '#tentang', '#layanan', '#dokter', '#promo', '#janji', '#berita', '#kontak', '#kebijakan-privasi', '#syarat-ketentuan'].map(a => `<option value="${a}">`).join('')}</datalist>
      ${bottom ? `<div class="mb-4">${cmsField('c:nav_bottom_title', 'Judul kolom Link Cepat di footer', c.nav_bottom_title)}</div>` : ''}
      <div class="space-y-3">${L.map((n, i) => `<div class="${cmsBox}">${cmsItemHead(col, n.id, n.label || '(tanpa label)', i, L.length)}
        <div class="grid sm:grid-cols-2 gap-2">
          ${cmsField(pf + '_' + n.id + '_label', 'Label menu', n.label)}
          ${cmsField(pf + '_' + n.id + '_url', 'Tautan (URL)', n.url, { ph: '#dokter atau https://...', attrs: 'list="nav-anchors"' })}
        </div>
        ${bottom ? `<label class="block"><span class="text-xs text-slate-500 dark:text-slate-400">Letak di footer</span><select name="${pf}_${n.id}_area" class="${inp}"><option value="kolom" ${n.area != 'baris' ? 'selected' : ''}>Kolom Link Cepat</option><option value="baris" ${n.area == 'baris' ? 'selected' : ''}>Baris bawah (dekat copyright)</option></select></label>` : ''}
        <div class="flex flex-wrap gap-4">${cmsCheck(pf + '_' + n.id + '_aktif', 'Aktif (tampil)', n.aktif)}${cmsCheck(pf + '_' + n.id + '_baru', 'Buka di tab baru', n.baru)}</div></div>`).join('') || cmsEmpty('menu')}${cmsAddBtn(col, bottom ? 'Tambah Menu Bawah' : 'Tambah Menu Atas')}</div>`;
  }

  if (id == 'dokter') {
    const L = list('dokter'), q = CMS_DOK_Q.trim().toLowerCase(), row = 'border border-slate-200 dark:border-slate-700 rounded-lg p-3';
    return H('Foto Dokter di Website') + `<div class="${cmsBox} mb-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500"><b>Foto dokter</b> — ${imgSpecText('dokter')}<br>Nama, spesialis, dan jadwal diubah di menu <a class="text-blue-600 underline" href="#/dokter">Data Dokter</a>. Hilangkan centang <b>Tampil</b> untuk menyembunyikan dokter dari website.</div>
      <input type="search" id="cms-dok-q" value="${esc(CMS_DOK_Q)}" oninput="cmsFilterDokter(this.value)" onkeydown="if(event.key==='Enter')event.preventDefault()" placeholder="Cari dokter / spesialis..." class="${inp} mb-3">
      <div class="space-y-2">${L.map(d => {
        const key = (d.nama + ' ' + (d.spesialis || '')).toLowerCase();
        return `<div class="cms-dok flex flex-wrap items-center gap-3 ${row}" data-q="${esc(key)}" ${q && !key.includes(q) ? 'style="display:none"' : ''}>
          <div class="flex-1 min-w-[150px]"><div class="font-medium text-sm">${esc(d.nama)}</div><div class="text-xs text-slate-500">${esc(d.spesialis || '')}</div></div>
          ${cmsImage('dokter_' + d.id + '_foto', d.foto, 'dokter', { compact: true, round: true, box: 'w-16 h-16' })}
          ${cmsCheck('dokter_' + d.id + '_tampil', 'Tampil', d.tampil !== false)}</div>`
      }).join('') || cmsEmpty('dokter')}</div>`;
  }

  if (id == 'legal') {
    const doc = (key, title) => `<div class="${cmsBox}">
      <div class="flex flex-wrap items-center justify-between gap-2"><h4 class="font-semibold">${title}</h4>${cmsCheck('c:' + key + '_aktif', 'Aktif (tampil di website)', c[key + '_aktif'] !== false)}</div>
      <div class="grid sm:grid-cols-2 gap-2">
        ${cmsField('c:' + key + '_judul', 'Judul dokumen', c[key + '_judul'])}
        ${cmsField('c:' + key + '_update', 'Terakhir diperbarui', c[key + '_update'], { type: 'date' })}
      </div>
      ${cmsField('c:' + key + '_isi', 'Isi dokumen', c[key + '_isi'], { type: 'textarea', rows: 16, hint: 'Format: <code>## Judul bagian</code> · <code>- poin</code> · <code>1. poin berurut</code> · <code>**tebal**</code> · baris kosong = paragraf baru.' })}
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class="${btn('slate')}" onclick="cmsLegalPreview('${key}')">Pratinjau</button>
        <button type="button" class="text-xs text-red-600 underline" onclick="cmsLegalReset('${key}')">Kembalikan ke teks bawaan</button>
      </div>
      <div id="legal-prev-${key}" class="hidden border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-96 overflow-auto"></div></div>`;
    return H('Kebijakan Privasi &amp; Syarat Ketentuan') + `<div class="${cmsBox} mb-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500">
      Dokumen ini tampil sebagai <b>jendela modal</b> di website: lewat tautan di footer (menu bawah), tautan pada formulir, atau alamat <code>…/index.html#kebijakan-privasi</code> dan <code>#syarat-ketentuan</code>.<br>
      Placeholder otomatis dari data RS: <code>{{nama}}</code> <code>{{alamat}}</code> <code>{{telepon}}</code> <code>{{telepon_igd}}</code> <code>{{email}}</code> <code>{{whatsapp}}</code>.<br>
      <b class="text-amber-600">Penting:</b> teks bawaan hanyalah <b>template umum</b>. Sesuaikan dengan praktik nyata rumah sakit dan minta peninjauan penasihat hukum sebelum dipublikasikan.</div>
      <div class="space-y-4">${doc('kebijakan', 'Kebijakan Privasi')}${doc('syarat', 'Syarat &amp; Ketentuan')}</div>`;
  }

  if (id == 'poli') {
    const L = list('poli'), q = CMS_POLI_Q.trim().toLowerCase(), row = 'border border-slate-200 dark:border-slate-700 rounded-lg p-3';
    return H('Poliklinik di Website') + `<div class="${cmsBox} mb-4 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500">Atur tampilan tiap poliklinik di bagian <b>Poliklinik</b> website (di bawah Layanan): foto atau ikon, deskripsi singkat, dan tampil/sembunyi. Nama, kode, lokasi, dan status diubah di menu <a class="text-blue-600 underline" href="#/poli">Poliklinik</a>; poli berstatus <b>Nonaktif</b> tidak tampil. Poli yang disembunyikan juga tidak muncul di formulir pendaftaran.<br><b>Foto poli</b> - ${imgSpecText('poli')}</div>
      <datalist id="fa-icons">${FA_ICONS.map(i => `<option value="${i}">`).join('')}</datalist>
      <div class="space-y-3 mb-4">
        ${cmsField('c:poli_judul', 'Judul bagian', c.poli_judul)}
        ${cmsField('c:poli_subjudul', 'Subjudul', c.poli_subjudul, { type: 'textarea', rows: 2 })}
      </div>
      <input type="search" id="cms-poli-q" value="${esc(CMS_POLI_Q)}" oninput="cmsFilterPoli(this.value)" onkeydown="if(event.key==='Enter')event.preventDefault()" placeholder="Cari poliklinik / lokasi..." class="${inp} mb-3">
      <div class="space-y-2">${L.map(p => {
        const key = ((p.nama || '') + ' ' + (p.lokasi || '')).toLowerCase();
        return `<div class="cms-poli ${row}" data-q="${esc(key)}" ${q && !key.includes(q) ? 'style="display:none"' : ''}>
          <div class="flex flex-wrap items-start gap-4">
            <div class="flex-1 min-w-[220px] space-y-2">
              <div><span class="font-medium text-sm">${esc(p.nama)}</span>${p.status == 'Nonaktif' ? ' <span class="text-xs text-red-500">(Nonaktif - tidak tampil)</span>' : ''}<div class="text-xs text-slate-500">${esc(p.lokasi || '-')}</div></div>
              ${cmsField('poli_' + p.id + '_deskripsi', 'Deskripsi singkat', p.deskripsi || '', { ph: 'mis. Pemeriksaan dan konsultasi penyakit anak' })}
              <div class="flex flex-wrap items-end gap-4">${cmsField('poli_' + p.id + '_icon', 'Ikon (opsional)', p.icon || '', { ph: 'otomatis', attrs: 'list="fa-icons"', cls: 'w-40' })}${cmsCheck('poli_' + p.id + '_tampil', 'Tampil di website', p.tampil !== false)}</div>
            </div>
            ${cmsImage('poli_' + p.id + '_foto', p.foto, 'poli', { compact: true, box: 'w-32 h-[72px]' })}
          </div></div>`
      }).join('') || cmsEmpty('poliklinik')}</div>`;
  }

  if (id == 'layanan') {
    const L = list('cms_layanan');
    return H('Layanan Unggulan') + `<div class="space-y-3">${L.map((l, i) => `<div class="${cmsBox}">${cmsItemHead('cms_layanan', l.id, l.nama, i, L.length)}
      ${cmsField('layanan_' + l.id + '_nama', 'Nama Layanan', l.nama)}
      ${cmsField('layanan_' + l.id + '_deskripsi', 'Deskripsi', l.deskripsi, { type: 'textarea', rows: 2 })}
      ${cmsField('layanan_' + l.id + '_icon', 'Icon (Font Awesome)', l.icon, { ph: 'fa-stethoscope' })}
      <div class="flex gap-4">${cmsCheck('layanan_' + l.id + '_aktif', 'Aktif', l.aktif)}${cmsCheck('layanan_' + l.id + '_darurat', 'Darurat (IGD)', l.darurat)}</div></div>`).join('') || cmsEmpty('layanan')}${cmsAddBtn('cms_layanan', 'Tambah Layanan')}</div>`;
  }
  if (id == 'promo') {
    const L = list('cms_promo');
    return H('Promo & Penawaran') + `<div class="space-y-3">${L.map((p, i) => `<div class="${cmsBox}">${cmsItemHead('cms_promo', p.id, p.judul, i, L.length)}
      ${cmsField('promo_' + p.id + '_judul', 'Judul Promo', p.judul)}
      ${cmsField('promo_' + p.id + '_deskripsi', 'Deskripsi', p.deskripsi, { type: 'textarea', rows: 2 })}
      <div class="grid grid-cols-2 gap-2">
        ${cmsField('promo_' + p.id + '_harga_asli', 'Harga Asli (0 = tidak dicoret)', p.harga_asli, { type: 'number', attrs: 'min="0"' })}
        ${cmsField('promo_' + p.id + '_harga_promo', 'Harga Promo (0 = "Hubungi kami")', p.harga_promo, { type: 'number', attrs: 'min="0"' })}</div>
      ${cmsField('promo_' + p.id + '_label', 'Label', p.label)}
      ${cmsImage('promo_' + p.id + '_gambar', p.gambar, 'promo', { label: 'Gambar promo (opsional)', box: 'w-32 h-[72px]' })}
      ${cmsCheck('promo_' + p.id + '_aktif', 'Aktif', p.aktif)}</div>`).join('') || cmsEmpty('promo')}${cmsAddBtn('cms_promo', 'Tambah Promo')}</div>`;
  }
  if (id == 'berita') {
    const L = list('cms_berita');
    return H('Berita & Artikel') + `<div class="space-y-3">${L.map((b, i) => `<div class="${cmsBox}">${cmsItemHead('cms_berita', b.id, b.judul, i, L.length)}
      ${cmsField('berita_' + b.id + '_judul', 'Judul', b.judul)}
      ${cmsField('berita_' + b.id + '_ringkasan', 'Ringkasan (tampil di kartu)', b.ringkasan, { type: 'textarea', rows: 2 })}
      ${cmsField('berita_' + b.id + '_isi', 'Isi artikel lengkap', b.isi, { type: 'textarea', rows: 5, hint: 'Tampil saat pengunjung klik "Baca Selengkapnya". Pisahkan paragraf dengan baris baru. Kosong = pakai ringkasan.' })}
      <div class="grid grid-cols-2 gap-2">
        ${cmsField('berita_' + b.id + '_tanggal', 'Tanggal', b.tanggal, { type: 'date' })}
        ${cmsField('berita_' + b.id + '_kategori', 'Kategori', b.kategori)}</div>
      ${cmsField('berita_' + b.id + '_icon', 'Icon (Font Awesome, dipakai bila tanpa gambar)', b.icon, { ph: 'fa-newspaper' })}
      ${cmsImage('berita_' + b.id + '_gambar', b.gambar, 'berita', { label: 'Gambar berita (opsional)', box: 'w-32 h-[72px]' })}
      ${cmsCheck('berita_' + b.id + '_aktif', 'Aktif', b.aktif)}</div>`).join('') || cmsEmpty('berita')}${cmsAddBtn('cms_berita', 'Tambah Berita')}</div>`;
  }
  if (id == 'testi') {
    const L = list('cms_testimoni');
    return H('Testimoni Pasien') + `<div class="space-y-3">${L.map((t, i) => `<div class="${cmsBox}">${cmsItemHead('cms_testimoni', t.id, t.nama, i, L.length)}
      ${cmsField('testi_' + t.id + '_nama', 'Nama', t.nama)}
      ${cmsField('testi_' + t.id + '_profesi', 'Profesi / Keterangan', t.profesi)}
      ${cmsField('testi_' + t.id + '_ulasan', 'Ulasan', t.ulasan, { type: 'textarea', rows: 3 })}
      ${cmsField('testi_' + t.id + '_rating', 'Rating (1-5)', t.rating, { type: 'number', attrs: 'min="1" max="5"' })}
      ${cmsCheck('testi_' + t.id + '_aktif', 'Aktif', t.aktif)}</div>`).join('') || cmsEmpty('testimoni')}${cmsAddBtn('cms_testimoni', 'Tambah Testimoni')}</div>`;
  }
  return '';
}

function cmsAdmin(tab) {
  if (tab) CMS_TAB = tab;
  $('#main').innerHTML = `<div class="${card} p-5">
    <div class="flex flex-wrap items-center justify-between gap-2 mb-1">
      <h2 class="text-xl font-bold">Kelola Konten Website Publik</h2>
      <a href="index.html?preview=1" target="_blank" rel="noopener" class="${btn('slate')} inline-block">🌐 Lihat Website</a>
    </div>
    <p class="text-slate-500 mb-1">Edit konten, lalu klik <b>Simpan Perubahan</b>. Tambah, hapus, urutan item, dan unggah gambar langsung tersimpan.</p>
    <p class="mb-4">${storageBadge()}</p>
    <div class="flex flex-wrap gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
      ${CMS_TABS.map(t => `<button type="button" onclick="switchCmsTab('${t.id}')" id="cms-tab-${t.id}" class="${cmsTabCls(t.id == CMS_TAB)}"><i class="fas ${t.icon} mr-1"></i>${t.label}</button>`).join('')}
    </div>
    <form id="cmsForm" onsubmit="return saveCmsAdmin(event)">
      <div id="cms-content">${cmsTab(CMS_TAB)}</div>
      <div class="flex gap-2 justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button type="button" class="${btn('slate')}" onclick="cmsClose()">Tutup (tanpa simpan)</button>
        <button type="submit" class="${btn()}">Simpan Perubahan</button>
      </div>
    </form></div>`;
}

function cmsRenderTab() {
  const c = $('#cms-content');
  if (c) c.innerHTML = cmsTab(CMS_TAB);
  CMS_TABS.forEach(t => { const b = $('#cms-tab-' + t.id); if (b) b.className = cmsTabCls(t.id == CMS_TAB) });
  cmsStorageUpdate();
}

function switchCmsTab(id) {
  saveCmsFormData();           // simpan isian tab lama ke memori
  CMS_TAB = id;
  cmsRenderTab();              // render ulang dari data TERBARU
}

// Baca isian form yang sedang tampil -> db (di memori). Persist dilakukan oleh save().
function saveCmsFormData() {
  const form = $('#cmsForm');
  if (!form) return;
  const E = form.elements, c = db.cms;
  Array.from(E).forEach(el => {
    if (!el.name || !el.name.startsWith('c:')) return;
    const k = el.name.slice(2);
    if (el.type == 'checkbox') c[k] = el.checked;
    else if (el.type == 'number') {
      let n = Math.max(0, +el.value || 0);
      if (k == 'hero_interval') n = Math.min(20, Math.max(2, n || 5));
      c[k] = n
    } else c[k] = el.value;
  });
  for (const [col, spec] of Object.entries(CMS_ITEMS)) {
    (db[col] || []).forEach(it => {
      if (!E[`${spec.p}_${it.id}_${spec.f[0][0]}`]) return;   // item ini tidak sedang tampil
      spec.f.forEach(([k, t]) => {
        const el = E[`${spec.p}_${it.id}_${k}`];
        if (!el) return;
        if (t == 'bool') it[k] = el.checked;
        else if (t == 'num') it[k] = Math.max(0, +el.value || 0);
        else if (t == 'rating') it[k] = Math.min(5, Math.max(1, Math.round(+el.value || 5)));
        else it[k] = el.value;
      });
    });
  }
}

function saveCmsAdmin(e) {
  e.preventDefault();
  saveCmsFormData();
  if (!String(db.cms.nama || '').trim()) { toast('Nama rumah sakit wajib diisi', 1); return false }
  if (save()) toast('Konten website publik berhasil diperbarui!');
  applyFavicon();
  cmsRenderTab();
  return false;
}

function cmsClose() {
  // buang perubahan yang belum disimpan: muat ulang dari penyimpanan
  try { db = JSON.parse(localStorage.getItem(KEY)) } catch (e) { }
  normalizeDb(); applyFavicon();
  cms();
}

const CMS_DEFAULTS = {
  cms_hero: () => ({ badge: 'Badge Baru', judul: 'Judul Baru', subtitle: 'Subtitle baru', cta1_text: 'Selengkapnya', cta1_link: '#layanan', cta2_text: '', cta2_link: '#', gambar: '', warna: 'blue', aktif: true }),
  cms_layanan: () => ({ nama: 'Layanan Baru', deskripsi: 'Deskripsi layanan', icon: 'fa-stethoscope', aktif: true, darurat: false }),
  cms_promo: () => ({ judul: 'Promo Baru', deskripsi: 'Deskripsi promo', harga_asli: 0, harga_promo: 0, label: 'PROMO', gambar: '', aktif: true }),
  cms_berita: () => ({ judul: 'Berita Baru', ringkasan: 'Ringkasan berita', isi: '', tanggal: today(), kategori: 'Umum', icon: 'fa-newspaper', gambar: '', aktif: true }),
  cms_testimoni: () => ({ nama: 'Nama Pasien', profesi: 'Pasien', ulasan: 'Ulasan pasien', rating: 5, aktif: true }),
  cms_mengapa: () => ({ judul: 'Keunggulan Baru', deskripsi: 'Deskripsi keunggulan', icon: 'fa-check-circle', aktif: true }),
  cms_nav_top: () => ({ label: 'Menu Baru', url: '#', aktif: true, baru: false }),
  cms_nav_bottom: () => ({ label: 'Link Baru', url: '#', area: 'kolom', aktif: true, baru: false })
};

function addCmsItem(collection) {
  saveCmsFormData();
  if (!db[collection]) db[collection] = [];
  const mk = CMS_DEFAULTS[collection];
  if (!mk) return;
  db[collection].push({ id: nid(collection), ...mk() });
  if (save()) toast('Item baru ditambahkan');
  cmsRenderTab();
  const cards = document.querySelectorAll('#cms-content .space-y-3 > div, #cms-content .space-y-4 > div');
  const last = cards[cards.length - 1];
  if (last && last.scrollIntoView) last.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteCmsItem(collection, id) {
  ask('Hapus item ini dari website?', () => {
    saveCmsFormData();
    db[collection] = db[collection].filter(x => x.id != id);
    if (save()) toast('Item dihapus');
    cmsRenderTab();
  });
}

function moveCmsItem(collection, id, dir) {
  saveCmsFormData();
  const a = db[collection], i = a.findIndex(x => x.id == id), j = i + dir;
  if (i < 0 || j < 0 || j >= a.length) return;
  [a[i], a[j]] = [a[j], a[i]];
  save();
  cmsRenderTab();
}

// Unggah gambar generik (hero, promo, berita, dokter, logo, favicon)
async function cmsImgUpload(inp, spec, name) {
  const f = inp.files && inp.files[0];
  inp.value = '';
  if (!f) return;
  try {
    toast('Memproses gambar…');
    const r = await imgPrepare(f, IMG_SPECS[spec]);
    saveCmsFormData();
    const el = $('#cmsForm') && $('#cmsForm').elements[name];
    if (!el) return;
    const old = el.value;
    if (storageUsed() + r.data.length - String(old).length > STORAGE_LIMIT * 0.95) throw new Error('Penyimpanan browser hampir penuh. Hapus gambar lain atau backup data terlebih dulu.');
    el.value = r.data; saveCmsFormData();
    if (!save()) { el.value = old; saveCmsFormData(); return }
    if (name == 'c:favicon') applyFavicon();
    cmsRenderTab();
    toast(`Gambar tersimpan: ${r.w} × ${r.h} px, ${r.kb} KB (file asli ${fmtKB(f.size)}).`);
  } catch (e) { toast(e.message || 'Gagal memproses gambar', 1) }
}
function cmsImgClear(name) {
  saveCmsFormData();
  const el = $('#cmsForm') && $('#cmsForm').elements[name];
  if (!el) return;
  el.value = ''; saveCmsFormData(); save();
  if (name == 'c:favicon') applyFavicon();
  cmsRenderTab();
  toast('Gambar dihapus');
}
function cmsFilterPoli(q) {
  CMS_POLI_Q = q;
  const t = q.trim().toLowerCase();
  document.querySelectorAll('.cms-poli').forEach(r => { r.style.display = !t || r.dataset.q.includes(t) ? '' : 'none' });
}
function cmsFilterDokter(q) {
  CMS_DOK_Q = q;
  const t = q.trim().toLowerCase();
  document.querySelectorAll('.cms-dok').forEach(r => { r.style.display = !t || r.dataset.q.includes(t) ? '' : 'none' });
}

// Pratinjau & reset teks legal
function legalHtml(text) {
  const c = db.cms, vars = { nama: c.nama, alamat: c.alamat, telepon: c.telepon, telepon_igd: c.telepon_igd, email: c.email, whatsapp: c.whatsapp };
  const src = String(text || '').replace(/\r/g, '').replace(/\{\{(\w+)\}\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const out = []; let list = null, para = [];
  const flushP = () => { if (para.length) { out.push(`<p class="mb-3">${para.map(inline).join('<br>')}</p>`); para = [] } };
  const flushL = () => { if (list) { out.push(`<${list.t} class="${list.t == 'ol' ? 'list-decimal' : 'list-disc'} pl-6 space-y-1 mb-3">${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.t}>`); list = null } };
  src.split('\n').forEach(raw => {
    const line = raw.trim(); let m;
    if (!line) { flushP(); flushL(); return }
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) { flushP(); flushL(); out.push(m[1].length == 1 ? `<h3 class="text-lg font-bold mt-4 mb-2">${inline(m[2])}</h3>` : `<h4 class="font-semibold mt-4 mb-1">${inline(m[2])}</h4>`); return }
    if ((m = line.match(/^[-*•]\s+(.*)$/))) { flushP(); if (!list || list.t != 'ul') { flushL(); list = { t: 'ul', items: [] } } list.items.push(m[1]); return }
    if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushP(); if (!list || list.t != 'ol') { flushL(); list = { t: 'ol', items: [] } } list.items.push(m[1]); return }
    flushL(); para.push(line);
  });
  flushP(); flushL();
  return out.join('')
}
function cmsLegalPreview(key) {
  const ta = $('#cmsForm') && $('#cmsForm').elements['c:' + key + '_isi'], box = $('#legal-prev-' + key);
  if (!ta || !box) return;
  saveCmsFormData();
  box.innerHTML = ta.value.trim() ? legalHtml(ta.value) : '<p class="text-slate-400">Isi dokumen masih kosong.</p>';
  box.classList.remove('hidden');
}
function cmsLegalReset(key) {
  ask('Kembalikan isi dokumen ke teks bawaan? Teks yang sudah Anda ubah akan hilang.', () => {
    const ta = $('#cmsForm') && $('#cmsForm').elements['c:' + key + '_isi'];
    if (!ta) return;
    ta.value = key == 'kebijakan' ? LEGAL_PRIVASI : LEGAL_SYARAT;
    saveCmsFormData();
    cmsRenderTab();
    toast('Teks bawaan dipulihkan. Klik Simpan Perubahan untuk menerapkan.')
  })
}


// ===== INBOX WEBSITE (pendaftaran online & pesan dari halaman publik) =====
// Sumber data: (1) SERVER INBOX (Cloudflare Worker + D1) - kiriman pengunjung situs publik di mana pun,
// (2) inbox LOKAL (browser ini) - hanya untuk uji coba. Keduanya digabung dalam satu daftar.
const INBOX_KEY = 'simrs_inbox', MSG_KEY = 'simrs_pesan';
const lsRead = k => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : [] } catch (e) { return [] } };
const lsWrite = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true } catch (e) { toast('Gagal menyimpan inbox', 1); return false } };
const digitsOnly = s => String(s || '').replace(/\D/g, '');
const waNum = s => { let d = digitsOnly(s); if (d.startsWith('0')) d = '62' + d.slice(1); return d };
const fmtDt = iso => { const d = new Date(iso); return isNaN(d) ? '-' : d.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) };

const inboxUrl = () => { const u = String((db.cms || {}).inbox_url || '').trim().replace(/\/+$/, ''); return /^https:\/\//i.test(u) ? u : '' };
const INB = { reg: [], msg: [], err: '', at: 0, loading: false, remote: false };
const byNewest = (a, b) => String(b.dibuat).localeCompare(String(a.dibuat));

function inboxLocalInit() { INB.reg = lsRead(INBOX_KEY).slice().sort(byNewest); INB.msg = lsRead(MSG_KEY).slice().sort(byNewest) }
const inboxCount = () => {
  if (!INB.at) inboxLocalInit();
  return INB.reg.filter(x => x.status == 'Baru').length + INB.msg.filter(x => !x.dibaca).length
};

async function inboxApi(method, path, body) {
  let r;
  try {
    r = await fetch(inboxUrl() + path, { method, cache: 'no-store', headers: Object.assign({ Authorization: 'Bearer ' + ghTok() }, body ? { 'Content-Type': 'application/json' } : {}), body: body ? JSON.stringify(body) : undefined });
  } catch (e) { throw new Error('Tidak dapat terhubung ke server inbox.') }
  let j = {}; try { j = await r.json() } catch (e) { }
  if (!r.ok) throw new Error(j.error || 'Server inbox: HTTP ' + r.status);
  return j;
}
const remReg = x => ({ id: 'r' + x.id, rid: x.id, remote: true, kode: x.kode, nama: x.nama, telp: x.telp, poliId: x.poliId, poli: x.poli, dokterId: x.dokterId, dokter: x.dokter, tgl: x.tgl, keluhan: x.keluhan, status: x.status, antrian: x.antrian || '', dibuat: x.dibuat });
const remMsg = x => ({ id: 'r' + x.id, rid: x.id, remote: true, nama: x.nama, email: x.email, subjek: x.subjek, pesan: x.pesan, dibuat: x.dibuat, dibaca: !!x.dibaca });

async function inboxRefresh() {
  const reg = lsRead(INBOX_KEY), msg = lsRead(MSG_KEY);
  INB.err = ''; INB.remote = false;
  if (inboxUrl()) {
    if (!GH_ON || !ghTok()) INB.err = 'Login dengan token GitHub untuk memuat inbox dari server.';
    else try {
      const j = await inboxApi('GET', '/inbox');
      (j.items || []).forEach(x => (x.jenis == 'pendaftaran' ? reg : msg).push(x.jenis == 'pendaftaran' ? remReg(x) : remMsg(x)));
      INB.remote = true;
    } catch (e) { INB.err = e.message }
  }
  INB.reg = reg.sort(byNewest); INB.msg = msg.sort(byNewest); INB.at = Date.now();
}

function refreshBadge() {
  const b = $('#inbox-badge');
  if (!b) return;
  const n = inboxCount();
  b.textContent = n;
  b.classList.toggle('hidden', !n);
}

// Muat ulang dari server/lokal, perbarui badge dan (bila sedang dibuka) halaman Inbox
async function inboxPoll(manual) {
  if (INB.loading) return;
  INB.loading = true;
  try { await inboxRefresh() } finally { INB.loading = false }
  refreshBadge();
  if (authed() && (location.hash || '').slice(2) == 'inbox') inboxRender();
  if (manual) toast(INB.err ? INB.err : 'Inbox diperbarui', !!INB.err);
}

function inbox(tab) {
  const st = ST.inbox = ST.inbox || { tab: 'reg' };
  if (tab) st.tab = tab;
  inboxRender();      // tampilkan data yang sudah ada lebih dulu
  inboxPoll();        // lalu segarkan dari server
}

function inboxRender() {
  if (!INB.at) inboxLocalInit();
  const st = ST.inbox = ST.inbox || { tab: 'reg' }, regs = INB.reg, msgs = INB.msg;
  const nReg = regs.filter(x => x.status == 'Baru').length, nMsg = msgs.filter(x => !x.dibaca).length;
  const tb = (id, label, n) => `<button type="button" class="${cmsTabCls(st.tab == id)}" onclick="inbox('${id}')">${label}${n ? ` <span class="ml-1 px-1.5 rounded-full bg-red-500 text-white text-[10px]">${n}</span>` : ''}</button>`;
  const th = 'py-2 pr-3 whitespace-nowrap text-slate-500', td = 'py-2 pr-3 align-top';
  const src = x => x.remote ? '<span class="ml-1 px-1 rounded bg-blue-100 text-blue-700 text-[10px]">Server</span>' : '<span class="ml-1 px-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 text-[10px]">Lokal</span>';
  let body;
  if (st.tab == 'reg') {
    body = regs.length ? `<div class="overflow-x-auto"><table class="w-full text-left"><thead><tr class="border-b border-slate-200 dark:border-slate-700"><th class="${th}">Kode</th><th class="${th}">Masuk</th><th class="${th}">Pasien</th><th class="${th}">Poli / Dokter</th><th class="${th}">Kunjungan</th><th class="${th}">Keluhan</th><th class="${th}">Status</th><th></th></tr></thead><tbody>${regs.map(x => `<tr class="border-b border-slate-100 dark:border-slate-700 ${x.status == 'Baru' ? 'bg-amber-50 dark:bg-amber-950/30' : ''}">
      <td class="${td} font-mono text-xs">${esc(x.kode)}${src(x)}</td><td class="${td} whitespace-nowrap text-xs">${fmtDt(x.dibuat)}</td>
      <td class="${td}"><div class="font-medium">${esc(x.nama)}</div><a class="text-emerald-600 text-xs" target="_blank" rel="noopener" href="https://wa.me/${waNum(x.telp)}">${esc(x.telp)} ↗ WA</a></td>
      <td class="${td}">${esc(x.poli)}${x.dokter ? `<div class="text-xs text-slate-500">${esc(x.dokter)}</div>` : ''}</td>
      <td class="${td} whitespace-nowrap">${esc(x.tgl)}${x.antrian ? `<div class="text-xs text-slate-500">Antrian ${esc(x.antrian)}</div>` : ''}</td>
      <td class="${td} max-w-xs">${esc(x.keluhan || '-')}</td><td class="${td}">${badge(x.status)}</td>
      <td class="${td} whitespace-nowrap text-right">${x.status == 'Baru' ? `<button class="text-emerald-600 mr-2 font-medium" onclick="inboxTerima('${x.id}')">Terima</button><button class="text-amber-600 mr-2" onclick="inboxTolak('${x.id}')">Tolak</button>` : ''}<button class="text-red-600" onclick="inboxHapus('${INBOX_KEY}','${x.id}')">Hapus</button></td></tr>`).join('')}</tbody></table></div>`
      : '<p class="py-8 text-center text-slate-400">Belum ada pendaftaran online dari website.</p>';
  } else {
    body = msgs.length ? msgs.map(x => `<div class="border-t border-slate-100 dark:border-slate-700 py-3 ${x.dibaca ? '' : 'bg-amber-50 dark:bg-amber-950/30 px-3 rounded'}">
      <div class="flex flex-wrap justify-between gap-2"><div><span class="font-semibold">${esc(x.subjek)}</span>${src(x)} <span class="text-xs text-slate-500">dari ${esc(x.nama)} · ${esc(x.email)} · ${fmtDt(x.dibuat)}</span></div>
      <div class="whitespace-nowrap"><a class="text-blue-600 mr-3" href="mailto:${esc(x.email)}?subject=${encodeURIComponent('Re: ' + x.subjek)}" onclick="inboxBaca('${x.id}',true)">Balas</a><button class="text-slate-500 mr-3" onclick="inboxBaca('${x.id}')">${x.dibaca ? 'Tandai belum dibaca' : 'Tandai dibaca'}</button><button class="text-red-600" onclick="inboxHapus('${MSG_KEY}','${x.id}')">Hapus</button></div></div>
      <p class="mt-1 whitespace-pre-wrap">${esc(x.pesan)}</p></div>`).join('')
      : '<p class="py-8 text-center text-slate-400">Belum ada pesan dari website.</p>';
  }
  const status = INB.err ? `<span class="text-red-600" role="alert">${esc(INB.err)}</span>`
    : INB.remote ? `<span class="text-emerald-600">● Server inbox terhubung · ${fmtDt(new Date(INB.at).toISOString())}</span>`
      : inboxUrl() ? 'Memuat dari server...' : 'Inbox lokal (browser ini)';
  const notice = inboxUrl() ? '' : `<div class="mb-4 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">Server inbox belum diatur, sehingga kiriman pengunjung dari website tidak sampai ke sini (hanya inbox lokal di browser ini). Siapkan server inbox (gratis) mengikuti <b>PANDUAN-INBOX-ONLINE.md</b>, lalu isi alamatnya di <b>CMS → Kontak &amp; Sosmed → Pengiriman Formulir</b> dan terbitkan.</div>`;
  $('#main').innerHTML = `<div class="${card} p-5"><div class="flex flex-wrap items-center justify-between gap-2 mb-4"><div class="flex gap-2">${tb('reg', 'Pendaftaran Online', nReg)}${tb('pesan', 'Pesan Masuk', nMsg)}</div><div class="flex items-center gap-3 text-xs text-slate-400">${status}<button type="button" class="${btn('slate')}" onclick="inboxPoll(true)">↻ Muat ulang</button></div></div>${notice}${body}</div>`;
  refreshBadge();
}

// Ubah status di server (bila kiriman dari server) atau di inbox lokal
async function inboxPatch(it, patch, isMsg) {
  if (it.remote) await inboxApi('PATCH', '/inbox/' + it.rid, patch);
  else {
    const key = isMsg ? MSG_KEY : INBOX_KEY, list = lsRead(key), x = list.find(y => y.id == it.id);
    if (x) { Object.assign(x, patch); lsWrite(key, list) }
  }
  Object.assign(it, patch);
}

// Terima pendaftaran online (persetujuan admin) -> buat/cocokkan pasien + catat di Pendaftaran & Rawat Jalan
async function inboxTerima(id) {
  const it = INB.reg.find(x => x.id == id);
  if (!it || it.status != 'Baru') return;
  if (!db.poli.length || !db.dokter.length) return toast('Data Poli/Dokter kosong. Tambahkan dulu di menu Manajemen.', 1);
  const poli = db.poli.find(x => x.id == it.poliId) || db.poli.find(x => x.nama == it.poli) || db.poli[0];
  const dok = db.dokter.find(x => x.id == it.dokterId) || db.dokter.find(x => x.poli == poli.id) || db.dokter[0];
  const antrian = 'A-' + pad(db.pendaftaran.filter(x => x.tgl == it.tgl).length + 1);
  try { await inboxPatch(it, { status: 'Diterima', antrian }) }      // server dulu: bila gagal, tidak ada data ganda saat dicoba ulang
  catch (e) { return toast('Gagal memperbarui status di server: ' + e.message, 1) }
  let p = db.pasien.find(x => digitsOnly(x.telp) && digitsOnly(x.telp) == digitsOnly(it.telp) && String(x.nama).toLowerCase() == String(it.nama).toLowerCase());
  const baru = !p;
  if (!p) {
    const i = nid('pasien');
    p = { id: i, no_rm: 'RM-' + (1000 + i), nama: it.nama, nik: '', tgl_lahir: '', jk: '', alamat: '(Daftar online - lengkapi data pasien)', telp: it.telp, penjamin: 'Umum' };
    db.pasien.push(p);
  }
  const row = { id: nid('pendaftaran'), tgl: it.tgl, pasien: p.id, poli: poli.id, dokter: dok.id, antrian, status: 'Terdaftar' };
  db.pendaftaran.push(row);
  sync('pendaftaran', null, row);
  if (!save()) {                                                       // gagal simpan lokal -> kembalikan status agar bisa dicoba lagi
    db.pendaftaran.pop(); if (baru) db.pasien.pop();
    try { await inboxPatch(it, { status: 'Baru', antrian: '' }) } catch (e) { }
    return inboxRender();
  }
  toast(`Diterima - antrian ${antrian}${baru ? ` · pasien baru ${p.no_rm} (lengkapi data di Data Pasien)` : ''}`);
  inboxPoll();
}
function inboxTolak(id) {
  ask('Tolak pendaftaran online ini?', async () => {
    const it = INB.reg.find(x => x.id == id);
    if (!it) return;
    try { await inboxPatch(it, { status: 'Ditolak' }) } catch (e) { toast(e.message, 1) }
    inboxPoll();
  });
}
function inboxHapus(key, id) {
  ask('Hapus data ini dari inbox?', async () => {
    const isMsg = key == MSG_KEY, it = (isMsg ? INB.msg : INB.reg).find(x => x.id == id);
    if (!it) return;
    try {
      if (it.remote) await inboxApi('DELETE', '/inbox/' + it.rid);
      else lsWrite(key, lsRead(key).filter(x => x.id != it.id));
    } catch (e) { toast(e.message, 1) }
    inboxPoll();
  });
}
async function inboxBaca(id, forceRead) {
  const it = INB.msg.find(x => x.id == id);
  if (!it) return;
  try { await inboxPatch(it, { dibaca: forceRead ? true : !it.dibaca }, true) } catch (e) { toast(e.message, 1) }
  if (!forceRead) inboxRender(); else refreshBadge();
}

// ===== HOSTING GITHUB PAGES: LOGIN TOKEN & PUBLIKASI =====
// Alur: admin login memakai GitHub Personal Access Token (hanya akun dengan akses TULIS ke repositori yang lolos).
// "Publikasikan" mengirim KONTEN PUBLIK (CMS, daftar dokter & poli tanpa data sensitif) ke repositori sebagai
// data/site.json + gambar di assets/img/, dalam SATU commit. Data klinis (pasien, RME, tagihan, SIP, kata sandi) tidak pernah dikirim.
const GHCFG = Object.assign({ owner: '', repo: '', branch: '', dataPath: 'data/site.json', imgDir: 'assets/img', allowedUsers: [] }, window.SIMRS_CONFIG || {});
GHCFG.imgDir = String(GHCFG.imgDir || 'assets/img').replace(/^\/+|\/+$/g, '');
GHCFG.dataPath = String(GHCFG.dataPath || 'data/site.json').replace(/^\/+/, '');
if (!GHCFG.owner || !GHCFG.repo) {                 // deteksi otomatis dari https://<owner>.github.io/<repo>/
  const m = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
  if (m) {
    const seg = location.pathname.split('/')[1];
    GHCFG.owner = GHCFG.owner || m[1];
    GHCFG.repo = GHCFG.repo || (seg && !/\.[a-z0-9]+$/i.test(seg) ? seg : m[1] + '.github.io');
  }
}
const GH_ON = !!(GHCFG.owner && GHCFG.repo);
const ghTok = () => sessionStorage.getItem('simrs_gh_token') || '';
const ghBranch = () => sessionStorage.getItem('simrs_gh_branch') || GHCFG.branch || '';
const ghRepoPath = () => `/repos/${encodeURIComponent(GHCFG.owner)}/${encodeURIComponent(GHCFG.repo)}`;
const ghSiteUrl = () => GHCFG.repo.toLowerCase() == GHCFG.owner.toLowerCase() + '.github.io'
  ? `https://${GHCFG.owner}.github.io/` : `https://${GHCFG.owner}.github.io/${GHCFG.repo}/`;

function ghMsg(s, m) {
  if (s == 401) return 'Token tidak valid atau sudah kedaluwarsa.';
  if (s == 403) return /rate limit/i.test(m || '') ? 'Batas permintaan GitHub tercapai. Coba lagi beberapa menit lagi.' : 'Token tidak memiliki izin yang cukup (butuh Contents: Read and write pada repositori ini).';
  if (s == 404) return 'Repositori/branch tidak ditemukan, atau token tidak diberi akses ke repositori ini.';
  if (s == 409 || s == 422) return 'Konflik di GitHub: ' + (m || 'coba lagi.');
  return 'GitHub: ' + (m || 'HTTP ' + s);
}
async function gh(path, opt = {}) {
  let r;
  try {
    r = await fetch('https://api.github.com' + path, {
      method: opt.method || 'GET', cache: 'no-store',
      headers: Object.assign({ Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', Authorization: 'Bearer ' + (opt.token || ghTok()) },
        opt.body ? { 'Content-Type': 'application/json' } : {}, opt.headers || {}),
      body: opt.body ? JSON.stringify(opt.body) : undefined
    });
  } catch (e) { const err = new Error('Tidak dapat terhubung ke GitHub. Periksa koneksi internet Anda.'); err.status = 0; throw err }
  if (!r.ok) {
    let m = ''; try { m = (await r.json()).message } catch (e) { }
    const err = new Error(ghMsg(r.status, m)); err.status = r.status; throw err;
  }
  if (opt.raw) return r;
  return r.status == 204 ? null : r.json();
}

// ----- Login token -----
async function doTokenLogin(e) {
  e.preventDefault();
  const le = $('#le'), bt = $('#lbtn'), tok = $('#lt').value.trim();
  const show = m => { le.textContent = m; le.classList.remove('hidden') };
  const left = Math.ceil((_lock - Date.now()) / 1000);
  if (left > 0) return show(`Terlalu banyak percobaan. Coba lagi dalam ${left} detik.`), false;
  if (!/^(github_pat_|ghp_)[A-Za-z0-9_]{30,}$/.test(tok)) return show('Format token tidak dikenali. Gunakan Personal Access Token GitHub (diawali github_pat_ atau ghp_).'), false;
  bt.disabled = true; bt.textContent = 'Memverifikasi...'; le.classList.add('hidden');
  try {
    const repo = await gh(ghRepoPath(), { token: tok });
    const pm = repo.permissions || {};
    if (!(pm.push || pm.admin || pm.maintain)) throw new Error('Token valid, tetapi tidak memiliki izin TULIS ke repositori ini.');
    let login = '';
    try { login = (await gh('/user', { token: tok })).login || '' } catch (_) { }
    const allow = (GHCFG.allowedUsers || []).map(x => String(x).toLowerCase());
    if (allow.length && !allow.includes(login.toLowerCase())) throw new Error('Akun GitHub ini tidak termasuk daftar admin yang diizinkan.');
    _fails = 0;
    sessionStorage.setItem('simrs_gh_token', tok);
    sessionStorage.setItem('simrs_gh_branch', GHCFG.branch || repo.default_branch || 'main');
    sessionStorage.setItem('simrs_auth', '1');
    sessionStorage.setItem('simrs_user', login ? '@' + login : 'admin');
    idleReset(); shell(); ghCheckSync(); inboxPoll();
  } catch (err) {
    if (++_fails >= 5) { _lock = Date.now() + 30000; _fails = 0 }
    show(err.message || 'Login gagal.');
    bt.disabled = false; bt.textContent = 'Masuk dengan Token';
  }
  return false
}

// Sesi otomatis berakhir bila tidak ada aktivitas 30 menit
const IDLE_MS = 30 * 60 * 1000;
let _idle = 0;
function idleReset() {
  clearTimeout(_idle);
  if (!authed()) return;
  _idle = setTimeout(() => {
    logout();
    const le = $('#le');
    if (le) { le.textContent = 'Sesi berakhir karena tidak ada aktivitas. Silakan masuk kembali.'; le.classList.remove('hidden') }
  }, IDLE_MS)
}
['click', 'keydown', 'pointerdown', 'touchstart'].forEach(ev => addEventListener(ev, idleReset, { passive: true }));

// ----- Data yang diterbitkan -----
const PUB_COLL = ['cms_hero', 'cms_layanan', 'cms_promo', 'cms_berita', 'cms_testimoni', 'cms_nav_top', 'cms_nav_bottom', 'cms_mengapa'];
const PUB = { busy: false, log: [] };
const pubMeta = () => { try { return JSON.parse(localStorage.getItem('simrs_pub_meta')) || {} } catch (e) { return {} } };
const pubSetMeta = m => { try { localStorage.setItem('simrs_pub_meta', JSON.stringify(m)) } catch (e) { } };

// HANYA konten publik. Tidak memuat: pasien, RME, tagihan, pengguna/kata sandi, No. SIP dokter, lokasi internal, dll.
function pubBuildPayload() {
  const clone = o => JSON.parse(JSON.stringify(o));
  const p = { version: 1, generatedAt: new Date().toISOString(), cms: clone(db.cms) };
  delete p.cms.info;                                   // catatan internal dashboard
  PUB_COLL.forEach(k => { p[k] = clone(db[k] || []) });
  p.poli = db.poli.filter(x => x.status != 'Nonaktif' && x.tampil !== false).map(x => ({ id: x.id, nama: x.nama, status: x.status || 'Aktif', lokasi: x.lokasi || '', deskripsi: x.deskripsi || '', icon: x.icon || '', foto: x.foto || '' }));
  p.poli_hidden = db.poli.filter(x => x.tampil === false).map(x => x.id);
  p.dokter = db.dokter.filter(d => d.tampil !== false).map(d => ({ id: d.id, nama: d.nama, spesialis: d.spesialis, poli: d.poli, jadwal: d.jadwal, foto: d.foto || '' }));
  p.dokter_hidden = db.dokter.filter(d => d.tampil === false).map(d => d.id);
  return p;
}

async function sha256hex(str) {
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  const h = seed => {                                   // cadangan bila konteks tidak aman
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677) }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0')
  };
  return h(1) + h(2) + h(3);
}
const stableStr = o => Array.isArray(o) ? '[' + o.map(stableStr).join(',') + ']' : o && typeof o == 'object'
  ? '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + stableStr(o[k])).join(',') + '}' : JSON.stringify(o);
async function pubFp(json) { const { generatedAt, ...rest } = json; return (await sha256hex(stableStr(rest))).slice(0, 20) }

// Gambar data-URL -> file di repositori (nama = hash isi, sehingga tidak diunggah ulang bila tidak berubah)
const _imgHash = new Map();
async function pubPrepared() {
  const json = pubBuildPayload(), files = {};
  const conv = async (obj, key) => {
    const v = obj[key], m = typeof v == 'string' && v.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return;
    let h = _imgHash.get(v);
    if (!h) { h = (await sha256hex(v)).slice(0, 16); _imgHash.set(v, h) }
    const path = `${GHCFG.imgDir}/${h}.${m[1] == 'jpeg' ? 'jpg' : m[1]}`;
    files[path] = m[2]; obj[key] = path;
  };
  await conv(json.cms, 'logo'); await conv(json.cms, 'favicon');
  for (const [col, key] of [['cms_hero', 'gambar'], ['cms_promo', 'gambar'], ['cms_berita', 'gambar'], ['dokter', 'foto'], ['poli', 'foto']]) for (const it of json[col]) await conv(it, key);
  return { json, files };
}
const pubUsedPaths = json => {
  const used = new Set(), pre = GHCFG.imgDir + '/', add = v => { if (typeof v == 'string' && v.startsWith(pre)) used.add(v) };
  add(json.cms.logo); add(json.cms.favicon);
  [['cms_hero', 'gambar'], ['cms_promo', 'gambar'], ['cms_berita', 'gambar'], ['dokter', 'foto'], ['poli', 'foto']].forEach(([c, k]) => json[c].forEach(it => add(it[k])));
  return used;
};

const pubLog = m => {
  PUB.log.push(new Date().toLocaleTimeString('id-ID') + '  ' + m);
  const el = $('#pub-log');
  if (el) { el.textContent = PUB.log.join('\n'); el.scrollTop = el.scrollHeight }
};
function pubBusy(b) { PUB.busy = b; document.querySelectorAll('[data-pub-btn]').forEach(x => { x.disabled = b; x.classList.toggle('opacity-50', b) }) }

async function pubFetchRemote() {
  try {
    const r = await gh(`${ghRepoPath()}/contents/${GHCFG.dataPath}?ref=${encodeURIComponent(ghBranch())}`, { raw: true, headers: { Accept: 'application/vnd.github.raw+json' } });
    const j = await r.json();
    return j && j.cms ? j : null;
  } catch (e) { if (e.status == 404) return null; throw e }
}

function pubApplyRemote(j) {
  if (Array.isArray(j.cms_hero) !== true && !j.cms) throw new Error('Format data terbit tidak dikenali.');
  PUB_COLL.forEach(k => { if (Array.isArray(j[k])) db[k] = j[k] });
  db.cms = { ...db.cms, ...(j.cms || {}) };           // catatan internal (info) tetap lokal
  (j.poli || []).forEach(p => {
    const v = { nama: p.nama, tampil: true };
    ['status', 'lokasi', 'deskripsi', 'icon', 'foto'].forEach(k => { if (p[k] !== undefined) v[k] = p[k] });
    const x = db.poli.find(y => y.id == p.id);
    if (x) Object.assign(x, v); else db.poli.push({ id: p.id, kode: 'PL' + pad(p.id), lokasi: '', status: 'Aktif', ...v });
  });
  (j.poli_hidden || []).forEach(id => { const x = db.poli.find(y => y.id == id); if (x) x.tampil = false });
  (j.dokter || []).forEach(d => {
    const x = db.dokter.find(y => y.id == d.id), v = { nama: d.nama, spesialis: d.spesialis, poli: d.poli, jadwal: d.jadwal, foto: d.foto || '', tampil: true };
    if (x) Object.assign(x, v); else db.dokter.push({ id: d.id, sip: '', ...v });
  });
  (j.dokter_hidden || []).forEach(id => { const x = db.dokter.find(y => y.id == id); if (x) x.tampil = false });
  normalizeDb(); save(); applyFavicon();
}

async function ghCheckSync() {
  if (!GH_ON || !ghTok()) return;
  try {
    const j = await pubFetchRemote();
    if (!j) return;
    const { json } = await pubPrepared(), rfp = await pubFp(j), lfp = await pubFp(json), meta = pubMeta();
    if (rfp == lfp) { pubSetMeta({ at: j.generatedAt, fp: rfp }); return }
    if (meta.fp && meta.at == j.generatedAt) return;   // sudah sinkron dengan versi terbit ini; selisih = perubahan lokal
    ask(`Data terbit di GitHub (${fmtDt(j.generatedAt)}) berbeda dengan data CMS di perangkat ini. Ambil data terbit sekarang? Konten CMS lokal akan diganti.`, () => {
      try { pubApplyRemote(j); pubSetMeta({ at: j.generatedAt, fp: rfp }); toast('Data terbit diambil dari GitHub'); shell() } catch (e) { toast(e.message, 1) }
    });
  } catch (e) { /* bisa dicek manual di menu Publikasi GitHub */ }
}

function pubRun() {
  if (PUB.busy) return;
  if (!GH_ON || !ghTok()) return toast('Login dengan token GitHub terlebih dulu', 1);
  ask('Publikasikan konten ke website publik? Teks, gambar, menu, dokumen legal, serta daftar dokter & poli di CMS akan menjadi PUBLIK. Data klinis (pasien, RME, tagihan, SIP, dll.) TIDAK ikut dikirim. Pastikan data Dokter & Poli sudah diganti dengan data asli (bukan data dummy bawaan).', async () => {
    pubBusy(true); PUB.log = [];
    try {
      const o = GHCFG.owner, rp = ghRepoPath();
      pubLog('Memeriksa akses repositori...');
      const repo = await gh(rp), pm = repo.permissions || {};
      if (!(pm.push || pm.admin || pm.maintain)) throw new Error('Token tidak memiliki izin tulis ke repositori ini.');
      const br = ghBranch() || repo.default_branch || 'main';
      pubLog(`Branch: ${br}`);

      const { json, files } = await pubPrepared();
      const used = pubUsedPaths(json);
      let existing = [];
      try { existing = (await gh(`${rp}/contents/${GHCFG.imgDir}?ref=${encodeURIComponent(br)}`)).map(x => x.path) } catch (e) { if (e.status != 404) throw e }
      const reImg = new RegExp('^' + GHCFG.imgDir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/[0-9a-f]{16}\\.(jpg|png|webp)$');
      const toUpload = Object.keys(files).filter(p => !existing.includes(p));
      const toDelete = existing.filter(p => reImg.test(p) && !used.has(p));
      pubLog(`Gambar: ${Object.keys(files).length} dipakai, ${toUpload.length} baru, ${toDelete.length} tidak terpakai (dihapus).`);

      pubLog('Mengambil commit terakhir...');
      const ref = await gh(`${rp}/git/ref/heads/${br}`);
      const headSha = ref.object.sha, head = await gh(`${rp}/git/commits/${headSha}`);
      const tree = [];
      for (const p of toUpload) {
        pubLog(`Mengunggah ${p}...`);
        const b = await gh(`${rp}/git/blobs`, { method: 'POST', body: { content: files[p], encoding: 'base64' } });
        tree.push({ path: p, mode: '100644', type: 'blob', sha: b.sha });
      }
      pubLog('Menyimpan data konten...');
      const jb = await gh(`${rp}/git/blobs`, { method: 'POST', body: { content: JSON.stringify(json, null, 1), encoding: 'utf-8' } });
      tree.push({ path: GHCFG.dataPath, mode: '100644', type: 'blob', sha: jb.sha });
      toDelete.forEach(p => tree.push({ path: p, mode: '100644', type: 'blob', sha: null }));
      const nt = await gh(`${rp}/git/trees`, { method: 'POST', body: { base_tree: head.tree.sha, tree } });
      pubLog('Membuat commit...');
      const c = await gh(`${rp}/git/commits`, { method: 'POST', body: { message: 'CMS: publikasi konten ' + new Date().toLocaleString('id-ID'), tree: nt.sha, parents: [headSha] } });
      await gh(`${rp}/git/refs/heads/${br}`, { method: 'PATCH', body: { sha: c.sha, force: false } });

      pubSetMeta({ at: json.generatedAt, fp: await pubFp(json), sha: c.sha, branch: br });
      pubLog(`BERHASIL. Commit ${c.sha.slice(0, 7)}. GitHub Pages memperbarui situs dalam ±1-2 menit.`);
      toast('Berhasil diterbitkan. Situs diperbarui dalam ±1-2 menit.');
      pubStatus();
    } catch (e) {
      pubLog('GAGAL: ' + (e.message || e));
      toast(e.message || 'Publikasi gagal', 1);
    }
    pubBusy(false);
  });
}

function pubPull() {
  if (PUB.busy) return;
  if (!GH_ON || !ghTok()) return toast('Login dengan token GitHub terlebih dulu', 1);
  ask('Ambil data terbit dari GitHub? Konten CMS di perangkat ini (yang belum diterbitkan) akan diganti.', async () => {
    pubBusy(true); PUB.log = [];
    try {
      pubLog('Mengambil data terbit dari GitHub...');
      const j = await pubFetchRemote();
      if (!j) throw new Error(`Belum ada ${GHCFG.dataPath} di repositori. Gunakan "Publikasikan" terlebih dulu.`);
      pubApplyRemote(j);
      pubSetMeta({ at: j.generatedAt, fp: await pubFp(j) });
      pubLog(`Selesai. Data terbit tanggal ${fmtDt(j.generatedAt)} dimuat.`);
      toast('Data terbit berhasil diambil');
      pubStatus();
    } catch (e) { pubLog('GAGAL: ' + (e.message || e)); toast(e.message || 'Gagal mengambil data', 1) }
    pubBusy(false);
  });
}

function pubDownload() {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(pubBuildPayload(), null, 1)], { type: 'application/json' }));
  a.download = 'site.json';
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove() }, 500);
}

async function pubStatus() {
  const el = $('#pub-status');
  if (!el) return;
  try {
    const { json } = await pubPrepared(), fp = await pubFp(json), m = pubMeta();
    const e2 = $('#pub-status');
    if (!e2) return;
    e2.innerHTML = !m.fp ? '<span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700">Belum pernah diterbitkan dari perangkat ini</span>'
      : fp == m.fp ? '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Sinkron dengan versi terbit</span>'
        : '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-700">Ada perubahan yang belum diterbitkan</span>';
    const t = $('#pub-last');
    if (t) t.textContent = m.at ? fmtDt(m.at) + (m.sha ? ` (commit ${String(m.sha).slice(0, 7)})` : '') : '-';
  } catch (e) { el.textContent = '-' }
}

function publishPage() {
  const site = GH_ON ? ghSiteUrl() : '';
  const row = (k, v) => `<tr class="border-b border-slate-100 dark:border-slate-700"><td class="py-2 pr-4 text-slate-500 whitespace-nowrap">${k}</td><td class="py-2">${v}</td></tr>`;
  const b = (txt, fn, cls = btn()) => `<button type="button" data-pub-btn class="${cls}" onclick="${fn}" ${GH_ON ? '' : 'disabled'}>${txt}</button>`;
  $('#main').innerHTML = `<div class="${card} p-5 space-y-5">
    <div><h2 class="text-xl font-bold">Publikasi ke GitHub Pages</h2>
    <p class="text-slate-500">Konten publik diterbitkan ke repositori sebagai <code>${esc(GHCFG.dataPath)}</code> dan <code>${esc(GHCFG.imgDir)}/</code>. Pengunjung website membaca file tersebut.</p></div>
    ${GH_ON && !inboxUrl() ? `<div class="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm"><b>Server Inbox belum diatur.</b> Pendaftaran &amp; pesan pengunjung belum bisa masuk ke menu <i>Inbox Website</i> (pengunjung diarahkan ke WhatsApp). Ikuti <b>PANDUAN-INBOX-ONLINE.md</b>, lalu isi alamatnya di CMS → Kontak &amp; Sosmed → Pengiriman Formulir.</div>` : ''}
    ${GH_ON ? `<table class="w-full text-left">${row('Repositori', `<b>${esc(GHCFG.owner)}/${esc(GHCFG.repo)}</b>`)}${row('Branch', esc(ghBranch() || '(default)'))}${row('Alamat situs', `<a class="text-blue-600 underline" target="_blank" rel="noopener" href="${esc(site)}">${esc(site)}</a>`)}${row('Login sebagai', esc(sessionStorage.getItem('simrs_user') || '-'))}${row('Terakhir terbit', '<span id="pub-last">-</span>')}${row('Status', '<span id="pub-status">memeriksa...</span>')}</table>`
      : `<div class="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm">Mode GitHub belum aktif. Isi <code>owner</code> dan <code>repo</code> di <code>config.js</code>, atau buka panel ini dari <code>https://&lt;owner&gt;.github.io/&lt;repo&gt;/simrs.html</code> (terdeteksi otomatis). Lihat <b>PANDUAN-GITHUB-PAGES.md</b>.</div>`}
    <div class="flex flex-wrap gap-2">
      ${b('⬆ Publikasikan ke GitHub', 'pubRun()')}
      ${b('⬇ Ambil data terbit', 'pubPull()', btn('slate'))}
      <a class="${btn('slate')} inline-block" target="_blank" rel="noopener" href="index.html?preview=1">Pratinjau draft ↗</a>
      ${GH_ON ? `<a class="${btn('slate')} inline-block" target="_blank" rel="noopener" href="${esc(site)}">Lihat situs publik ↗</a>` : ''}
      <button type="button" class="${btn('slate')}" onclick="pubDownload()">Unduh site.json (manual)</button>
    </div>
    <div class="grid md:grid-cols-2 gap-3 text-sm">
      <div class="${cmsBox}"><h4 class="font-semibold">Ikut diterbitkan (publik)</h4><ul class="list-disc pl-5 text-slate-500 space-y-0.5"><li>Seluruh konten CMS: info RS, kontak, jam, statistik, tentang, menu, hero, layanan, promo, berita, testimoni, kebijakan &amp; syarat</li><li>Gambar CMS (logo, favicon, hero, promo, berita, foto dokter &amp; poliklinik)</li><li>Dokter yang berstatus <i>Tampil</i> (nama, spesialis, poli, jadwal, foto) dan poliklinik aktif yang <i>Tampil</i> (nama, lokasi, deskripsi, ikon/foto)</li></ul></div>
      <div class="${cmsBox}"><h4 class="font-semibold text-red-600">TIDAK pernah dikirim</h4><ul class="list-disc pl-5 text-slate-500 space-y-0.5"><li>Data pasien, RME, pendaftaran, tagihan, kamar, lab, radiologi, farmasi, dll.</li><li>No. SIP dokter, kata sandi pengguna, catatan internal dashboard</li><li>Token GitHub Anda (hanya di tab ini, hilang saat tab ditutup)</li></ul></div>
    </div>
    <div><h4 class="font-semibold mb-1">Log</h4><pre id="pub-log" class="text-xs bg-slate-900 text-slate-100 rounded-lg p-3 min-h-[5rem] max-h-64 overflow-auto whitespace-pre-wrap">${esc(PUB.log.join('\n'))}</pre></div></div>`;
  if (GH_ON) pubStatus();
}

// ===== MAKE FUNCTIONS GLOBALLY ACCESSIBLE =====
Object.assign(window, { cmsAdmin, switchCmsTab, saveCmsFormData, saveCmsAdmin, cmsClose, addCmsItem, deleteCmsItem, moveCmsItem,
  cmsImgUpload, cmsImgClear, cmsFilterDokter, cmsFilterPoli, cmsLegalPreview, cmsLegalReset, doTokenLogin, pubRun, pubPull, pubDownload, publishPage, inbox, inboxTerima, inboxTolak, inboxHapus, inboxBaca });

// ===== EVENT LISTENERS =====
addEventListener('hashchange', () => authed() && shell());

// Tekan Esc untuk menutup dialog / modal
addEventListener('keydown', e => {
  if (e.key != 'Escape') return;
  const d = $('#dlg'), m = $('#modal');
  if (d && d.innerHTML) d.innerHTML = ''; else if (m && m.innerHTML) m.innerHTML = '';
});

// Data baru dari website publik (tab lain) -> perbarui badge / halaman inbox
addEventListener('storage', e => {
  if (!authed() || (e.key != INBOX_KEY && e.key != MSG_KEY)) return;
  inboxPoll();
});

// Periksa kiriman baru dari server inbox tiap 60 detik (saat sesi aktif & tab terlihat)
setInterval(() => { if (authed() && inboxUrl() && !document.hidden) inboxPoll() }, 60000);

applyFavicon();
authed() ? (shell(), inboxPoll()) : login();
