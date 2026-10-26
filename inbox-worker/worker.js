/* ==========================================================================
   INBOX ONLINE RS - Cloudflare Worker + D1
   --------------------------------------------------------------------------
   Menerima pendaftaran online & pesan dari website publik (GitHub Pages) dan
   menyediakannya untuk Panel Admin SIMRS.

   Endpoint
     POST   /submit        publik   : kirim pendaftaran / pesan (divalidasi & dibatasi)
     GET    /inbox         admin    : daftar kiriman (terbaru dulu, maks. 500)
     PATCH  /inbox/:id     admin    : ubah status / antrian / dibaca
     DELETE /inbox/:id     admin    : hapus
     GET    /health        publik   : cek server

   Keamanan
     - Admin = pemilik token GitHub yang punya izin TULIS ke repositori website
       (diverifikasi langsung ke GitHub; hasil di-cache 5 menit).
     - CORS dibatasi ke ALLOWED_ORIGINS. Origin lain ditolak.
     - Validasi ketat, batas ukuran, honeypot, pembatasan 5 kiriman / 10 menit /
       perangkat, batas harian, dan penghapusan otomatis data lama (RETENTION_DAYS).
     - Alamat IP tidak disimpan di inbox (hanya hash di tabel pembatas, hapus otomatis).

   Variabel lingkungan: ALLOWED_ORIGINS, GITHUB_OWNER, GITHUB_REPO,
     [ADMIN_USERS], [RETENTION_DAYS], [MAX_PER_DAY]. Binding D1: DB.
   ========================================================================== */

const JSON_H = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' };
const RATE = { max: 5, windowMs: 10 * 60 * 1000 };
const adminCache = new Map();

const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const one = (v, max) => String(v == null ? '' : v).replace(CTRL, '').replace(/\s+/g, ' ').trim().slice(0, max);
const multi = (v, max) => String(v == null ? '' : v).replace(/\r/g, '').replace(CTRL, '').trim().slice(0, max);
const digits = s => String(s || '').replace(/\D/g, '');
const intOrNull = v => (Number.isInteger(v) && v >= 0 && v < 1e9 ? v : null);
const validDate = s => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
};

async function sha256hex(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}

function cors(req, env) {
  const origin = req.headers.get('Origin') || '';
  const list = String(env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean);
  const allowed = !origin || list.includes(origin);   // tanpa Origin (curl/server) diproses; origin asing ditolak
  const h = { Vary: 'Origin' };
  if (origin && allowed) {
    Object.assign(h, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      'Access-Control-Max-Age': '600'
    });
  }
  return { allowed, h };
}

// Admin = token GitHub dengan izin tulis ke repositori website
async function adminOk(req, env) {
  const m = (req.headers.get('Authorization') || '').match(/^Bearer\s+([A-Za-z0-9_]{20,})$/);
  if (!m) return { status: 401, error: 'Token admin diperlukan.' };
  if (!env.GITHUB_OWNER || !env.GITHUB_REPO) return { status: 500, error: 'Server belum dikonfigurasi (GITHUB_OWNER / GITHUB_REPO).' };
  const tok = m[1], key = await sha256hex([tok, env.GITHUB_OWNER, env.GITHUB_REPO, env.ADMIN_USERS || ''].join('|')), now = Date.now();   // pengaturan ikut menentukan kunci cache
  const c = adminCache.get(key);
  if (c && c.exp > now) return c.res;
  const hdr = { Authorization: 'Bearer ' + tok, Accept: 'application/vnd.github+json', 'User-Agent': 'simrs-inbox-worker', 'X-GitHub-Api-Version': '2022-11-28' };
  let res;
  try {
    const r = await fetch(`https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}`, { headers: hdr });
    if (r.status === 401) res = { status: 401, error: 'Token tidak valid atau sudah kedaluwarsa.' };
    else if (!r.ok) res = { status: 403, error: 'Token tidak memiliki akses ke repositori website.' };
    else {
      const p = (await r.json()).permissions || {};
      if (!(p.push || p.admin || p.maintain)) res = { status: 403, error: 'Token tidak memiliki izin tulis ke repositori website.' };
      else {
        res = { ok: true };
        const users = String(env.ADMIN_USERS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (users.length) {
          const u = await fetch('https://api.github.com/user', { headers: hdr });
          const login = u.ok ? String((await u.json()).login || '').toLowerCase() : '';
          if (!users.includes(login)) res = { status: 403, error: 'Akun GitHub ini tidak termasuk daftar admin inbox.' };
        }
      }
    }
  } catch (e) {
    return { status: 502, error: 'Tidak dapat memverifikasi token ke GitHub. Coba lagi.' };   // tidak di-cache
  }
  if (adminCache.size > 200) adminCache.clear();
  adminCache.set(key, { exp: now + (res.ok ? 5 * 60 * 1000 : 30 * 1000), res });
  return res;
}

const toApi = r => ({
  id: r.id, jenis: r.jenis, kode: r.kode, nama: r.nama, telp: r.telp, email: r.email,
  poli: r.poli, poliId: r.poli_id, dokter: r.dokter, dokterId: r.dokter_id, tgl: r.tgl,
  keluhan: r.keluhan, subjek: r.subjek, pesan: r.pesan, status: r.status, antrian: r.antrian,
  dibaca: !!r.dibaca, dibuat: r.dibuat
});

async function submit(req, env, reply) {
  if (Number(req.headers.get('content-length') || 0) > 8000) return reply({ error: 'Data terlalu besar.' }, 413);
  let b;
  try { b = await req.json(); } catch (e) { return reply({ error: 'Format data tidak valid.' }, 400); }
  if (!b || typeof b !== 'object' || Array.isArray(b)) return reply({ error: 'Format data tidak valid.' }, 400);
  if (b.website) return reply({ ok: true, kode: '' });            // honeypot: pura-pura berhasil

  const now = Date.now(), iso = new Date(now).toISOString();
  const keepDays = Math.max(7, Number(env.RETENTION_DAYS) || 180);
  await env.DB.prepare('DELETE FROM inbox WHERE dibuat < ?').bind(new Date(now - keepDays * 864e5).toISOString()).run();
  await env.DB.prepare('DELETE FROM rl WHERE ts < ?').bind(now - RATE.windowMs).run();

  let rec;
  if (b.jenis === 'pendaftaran') {
    const nama = one(b.nama, 80), telp = one(b.telp, 20), poli = one(b.poli, 80), tgl = one(b.tgl, 10), dn = digits(telp).length;
    const today = new Date(now).toISOString().slice(0, 10), min = new Date(now - 864e5).toISOString().slice(0, 10), max = new Date(now + 366 * 864e5).toISOString().slice(0, 10);
    if (nama.length < 3) return reply({ error: 'Nama lengkap minimal 3 karakter.' }, 400);
    if (dn < 9 || dn > 15) return reply({ error: 'Nomor telepon tidak valid (9-15 digit).' }, 400);
    if (!poli) return reply({ error: 'Poli wajib dipilih.' }, 400);
    if (!validDate(tgl) || tgl < min || tgl > max) return reply({ error: 'Tanggal kunjungan tidak valid (' + today + ' atau setelahnya).' }, 400);
    rec = { jenis: 'pendaftaran', nama, telp, poli, poli_id: intOrNull(b.poliId), dokter: one(b.dokter, 80), dokter_id: intOrNull(b.dokterId), tgl, keluhan: multi(b.keluhan, 300) };
  } else if (b.jenis === 'pesan') {
    const nama = one(b.nama, 80), email = one(b.email, 100), subjek = one(b.subjek, 120), pesan = multi(b.pesan, 1000);
    if (nama.length < 2) return reply({ error: 'Nama wajib diisi.' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: 'Format email tidak valid.' }, 400);
    if (subjek.length < 3) return reply({ error: 'Subjek minimal 3 karakter.' }, 400);
    if (pesan.length < 10) return reply({ error: 'Pesan minimal 10 karakter.' }, 400);
    rec = { jenis: 'pesan', nama, email, subjek, pesan };
  } else {
    return reply({ error: 'Jenis kiriman tidak dikenal.' }, 400);
  }

  const ip = await sha256hex((req.headers.get('CF-Connecting-IP') || 'unknown') + '|rl');
  const rl = await env.DB.prepare('SELECT COUNT(*) AS n FROM rl WHERE ip = ? AND ts > ?').bind(ip, now - RATE.windowMs).first();
  if (rl && rl.n >= RATE.max) return reply({ error: 'Terlalu banyak kiriman dari perangkat Anda. Coba lagi dalam beberapa menit.' }, 429);
  const day = await env.DB.prepare('SELECT COUNT(*) AS n FROM inbox WHERE dibuat > ?').bind(new Date(now - 864e5).toISOString()).first();
  if (day && day.n >= (Number(env.MAX_PER_DAY) || 500)) return reply({ error: 'Penerimaan online sedang penuh. Silakan hubungi kami via telepon.' }, 429);
  await env.DB.prepare('INSERT INTO rl (ip, ts) VALUES (?, ?)').bind(ip, now).run();

  const r = await env.DB.prepare(
    'INSERT INTO inbox (jenis, kode, nama, telp, email, poli, poli_id, dokter, dokter_id, tgl, keluhan, subjek, pesan, status, antrian, dibaca, dibuat) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(rec.jenis, '', rec.nama, rec.telp || '', rec.email || '', rec.poli || '', rec.poli_id == null ? null : rec.poli_id,
    rec.dokter || '', rec.dokter_id == null ? null : rec.dokter_id, rec.tgl || '', rec.keluhan || '', rec.subjek || '', rec.pesan || '', 'Baru', '', 0, iso).run();
  const id = r.meta.last_row_id;
  let kode = '';
  if (rec.jenis === 'pendaftaran') {
    kode = 'JNJ-' + rec.tgl.replace(/-/g, '').slice(2) + '-' + String(id).padStart(3, '0');
    await env.DB.prepare('UPDATE inbox SET kode = ? WHERE id = ?').bind(kode, id).run();
  }
  return reply({ ok: true, id, kode }, 201);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '') || '/', c = cors(req, env);
    const reply = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { ...JSON_H, ...c.h } });

    if (!c.allowed) return reply({ error: 'Origin tidak diizinkan.' }, 403);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: c.h });
    if (path === '/health') return reply({ ok: true });
    if (!env.DB) return reply({ error: 'Server belum dikonfigurasi (binding database DB).' }, 500);

    try {
      if (path === '/submit' && req.method === 'POST') return await submit(req, env, reply);

      if (path === '/inbox' || path.startsWith('/inbox/')) {
        const a = await adminOk(req, env);
        if (!a.ok) return reply({ error: a.error }, a.status);

        if (path === '/inbox' && req.method === 'GET') {
          const { results } = await env.DB.prepare('SELECT * FROM inbox ORDER BY id DESC LIMIT 500').all();
          return reply({ items: (results || []).map(toApi) });
        }
        const m = path.match(/^\/inbox\/(\d+)$/);
        if (m) {
          const id = Number(m[1]);
          const ex = await env.DB.prepare('SELECT id FROM inbox WHERE id = ?').bind(id).first();
          if (!ex) return reply({ error: 'Data tidak ditemukan.' }, 404);
          if (req.method === 'DELETE') {
            await env.DB.prepare('DELETE FROM inbox WHERE id = ?').bind(id).run();
            return reply({ ok: true });
          }
          if (req.method === 'PATCH') {
            let b; try { b = await req.json(); } catch (e) { return reply({ error: 'Format data tidak valid.' }, 400); }
            const sets = [], vals = [];
            if (b.status !== undefined) {
              if (!['Baru', 'Diterima', 'Ditolak'].includes(b.status)) return reply({ error: 'Status tidak valid.' }, 400);
              sets.push('status = ?'); vals.push(b.status);
            }
            if (b.antrian !== undefined) { sets.push('antrian = ?'); vals.push(one(b.antrian, 20)); }
            if (b.dibaca !== undefined) { sets.push('dibaca = ?'); vals.push(b.dibaca ? 1 : 0); }
            if (!sets.length) return reply({ error: 'Tidak ada perubahan.' }, 400);
            await env.DB.prepare(`UPDATE inbox SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run();
            return reply({ ok: true });
          }
        }
      }
      return reply({ error: 'Tidak ditemukan.' }, 404);
    } catch (e) {
      return reply({ error: 'Terjadi kesalahan pada server.' }, 500);
    }
  }
};
