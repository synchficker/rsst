-- Skema database inbox (Cloudflare D1)
CREATE TABLE IF NOT EXISTS inbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jenis TEXT NOT NULL,                 -- 'pendaftaran' | 'pesan'
  kode TEXT NOT NULL DEFAULT '',       -- kode booking (pendaftaran)
  nama TEXT NOT NULL DEFAULT '',
  telp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  poli TEXT NOT NULL DEFAULT '',
  poli_id INTEGER,
  dokter TEXT NOT NULL DEFAULT '',
  dokter_id INTEGER,
  tgl TEXT NOT NULL DEFAULT '',        -- tanggal kunjungan YYYY-MM-DD
  keluhan TEXT NOT NULL DEFAULT '',
  subjek TEXT NOT NULL DEFAULT '',
  pesan TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Baru', -- 'Baru' | 'Diterima' | 'Ditolak'
  antrian TEXT NOT NULL DEFAULT '',
  dibaca INTEGER NOT NULL DEFAULT 0,
  dibuat TEXT NOT NULL                 -- ISO 8601 (UTC)
);
CREATE INDEX IF NOT EXISTS idx_inbox_dibuat ON inbox (dibuat);

-- Pembatasan kiriman per perangkat (IP disimpan dalam bentuk hash, dihapus otomatis)
CREATE TABLE IF NOT EXISTS rl (
  ip TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rl ON rl (ip, ts);
