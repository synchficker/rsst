/* ========================================
   SIMRS - Halaman Publik (v2)
   File: public.js
   Sumber data (berurutan):
   1. ?preview=1  -> draft CMS di localStorage browser admin (pratinjau sebelum terbit)
   2. data/site.json (hasil "Publikasikan" dari panel admin) -> yang dilihat pengunjung di GitHub Pages
   3. localStorage (mode lokal / file:// untuk uji coba)
   Form pendaftaran/kontak: WhatsApp, endpoint formulir (mis. Formspree), atau inbox lokal (demo).
   Tidak pernah menulis ke database admin.
   ======================================== */
(function () {
  'use strict';

  // ===== KONFIGURASI =====
  const SIMRS_KEY = 'simrs_db4';
  const INBOX_KEY = 'simrs_inbox';
  const MSG_KEY = 'simrs_pesan';
  const MAX_ITEMS = 300;
  const CFG = Object.assign({ dataPath: 'data/site.json' }, window.SIMRS_CONFIG || {});
  let SOURCE = 'local';      // 'published' | 'draft' | 'local'
  let PUBDB = null;

  const DEFAULT_CMS = {
    nama: 'RS Sehat Sentosa', tagline: 'Melayani dengan Hati',
    alamat: 'Jl. Kesehatan No. 1, Jakarta',
    telepon: '(021) 555-0100', telepon_igd: '(021) 555-0119',
    email: 'info@rssehatsentosa.co.id', whatsapp: '6281234567890',
    facebook: '', instagram: '', youtube: '', tiktok: '',
    jam_senin_jumat: '08.00 - 20.00', jam_sabtu: '08.00 - 15.00', jam_minggu: 'Tutup', jam_igd: '24 Jam',
    stat_tenaga_medis: 150, stat_pasien_dilayani: 10000, stat_mitra: 50, stat_penghargaan: 25,
    tentang_sejarah: 'RS Sehat Sentosa didirikan pada tahun 2000 dengan visi menjadi rumah sakit terpercaya yang melayani dengan hati.',
    tentang_visi: 'Menjadi rumah sakit terbaik yang memberikan pelayanan kesehatan berkualitas dan terjangkau.',
    tentang_misi: '1. Memberikan pelayanan kesehatan terbaik\n2. Mengembangkan SDM profesional\n3. Menyediakan fasilitas modern',
    copyright: '2026 RS Sehat Sentosa. All rights reserved.',
    hero_autoplay: true, hero_interval: 5,
    logo: '', favicon: '', nav_bottom_title: 'Link Cepat',
    mengapa_judul: 'Mengapa Memilih Kami?',
    kebijakan_judul: 'Kebijakan Privasi', kebijakan_isi: '', kebijakan_update: '', kebijakan_aktif: true,
    syarat_judul: 'Syarat & Ketentuan', syarat_isi: '', syarat_update: '', syarat_aktif: true,
    form_mode: 'auto', form_endpoint: ''
  };

  // Data contoh bila admin SIMRS belum pernah dibuka
  const DEFAULT_POLI = [
    { id: 1, nama: 'Poli Penyakit Dalam' }, { id: 2, nama: 'Poli Anak' }, { id: 3, nama: 'Poli Kandungan' },
    { id: 4, nama: 'Poli Jantung' }, { id: 5, nama: 'Poli Mata' }, { id: 6, nama: 'Poli Bedah' },
    { id: 7, nama: 'Poli THT' }, { id: 8, nama: 'Poli Saraf' }
  ];
  const DEFAULT_DOKTER = [
    { id: 1, nama: 'dr. Budi Santoso, Sp.PD', spesialis: 'Penyakit Dalam', poli: 1, jadwal: 'Sen-Rab 08-12' },
    { id: 2, nama: 'dr. Siti Wijaya, Sp.A', spesialis: 'Anak', poli: 2, jadwal: 'Sel-Kam 13-17' },
    { id: 3, nama: 'dr. Agus Pratama, Sp.OG', spesialis: 'Kandungan', poli: 3, jadwal: 'Jum-Sab 09-13' },
    { id: 4, nama: 'dr. Dewi Lestari, Sp.JP', spesialis: 'Jantung', poli: 4, jadwal: 'Sen-Jum 10-14' },
    { id: 5, nama: 'dr. Rina Hidayat, Sp.M', spesialis: 'Mata', poli: 5, jadwal: 'Sen-Rab 08-12' },
    { id: 6, nama: 'dr. Andi Kusuma, Sp.B', spesialis: 'Bedah', poli: 6, jadwal: 'Sel-Kam 13-17' },
    { id: 7, nama: 'dr. Eko Saputra, Sp.THT', spesialis: 'THT', poli: 7, jadwal: 'Jum-Sab 09-13' },
    { id: 8, nama: 'dr. Sri Nugroho, Sp.S', spesialis: 'Saraf', poli: 8, jadwal: 'Sen-Jum 10-14' }
  ];

  const HERO_TONES = { blue: '#1d4ed8', red: '#b91c1c', emerald: '#047857', indigo: '#4338ca' };
  const HERO_DEFAULT_IMG = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920';
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== HELPER =====
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rup = n => 'Rp ' + Number(n || 0).toLocaleString('id-ID');
  const digits = s => String(s || '').replace(/\D/g, '');

  // Hanya izinkan skema aman pada link / gambar yang berasal dari CMS
  function safeLink(u) {
    u = String(u ?? '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u) || /^[#/.]/.test(u)) return u;
    return /^[a-z][a-z0-9+.-]*:/i.test(u) ? '' : u; // path relatif OK, skema lain (javascript:, dll) ditolak
  }
  function safeImg(u) {
    u = String(u ?? '').trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u) || /^[/.]/.test(u)) return u;
    if (/^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(u)) return u;
    return /^[a-z][a-z0-9+.-]*:/i.test(u) ? '' : u;
  }
  const cssUrl = u => 'url("' + u.replace(/["\\\r\n]/g, c => encodeURIComponent(c)) + '")';
  const iconClass = v => {
    let c = String(v || '').replace(/[^a-z0-9 -]/gi, '').trim();
    if (!c) c = 'fa-stethoscope';
    return /(^|\s)fa-/.test(c) ? c : 'fa-' + c;
  };

  function formatDate(s) {
    if (!s) return '-';
    const d = new Date(s);
    return isNaN(d) ? String(s) : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  const setText = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined && v !== null && v !== '') el.textContent = v; };

  function readJson(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  const readDb = () => { const d = readJson(SIMRS_KEY, null); return d && typeof d === 'object' && !Array.isArray(d) ? d : null; };
  const arr = v => (Array.isArray(v) ? v : null);

  let DB = {};
  let tToast;
  function toast(msg, ms = 6500) {
    const t = $('#toast');
    if (!t) return alert(msg);
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(tToast);
    tToast = setTimeout(() => t.classList.add('hidden'), ms);
  }

  // ===== HERO SLIDER =====
  const Hero = (() => {
    const root = $('#beranda'), box = $('#hero-slider-container'), dotsEl = $('#hero-dots'),
      bar = $('#hero-progress-bar'), counter = $('#hero-counter'), toggleBtn = $('#hero-toggle'),
      controls = $('#hero-controls');
    let slides = [], idx = 0, interval = 5000, autoplay = true;
    let userPaused = reduceMotion, hover = false, focusIn = false, elapsed = 0, last = 0, started = false;

    const multi = () => slides.length > 1;
    const paused = () => !autoplay || userPaused || hover || focusIn || document.hidden || !multi();

    function paint() {
      slides.forEach((s, i) => {
        const on = i === idx;
        s.classList.toggle('active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      $$('.hero-dot', dotsEl).forEach((d, i) => {
        d.classList.toggle('active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        d.setAttribute('aria-current', i === idx ? 'true' : 'false');
      });
      if (counter) counter.innerHTML = multi() ? `${pad(idx + 1)} <small>/ ${pad(slides.length)}</small>` : '';
    }
    function go(n) {
      if (!slides.length) return;
      idx = (n + slides.length) % slides.length;
      elapsed = 0;
      if (bar) bar.style.width = '0';
      paint();
    }
    const next = () => go(idx + 1);
    const prev = () => go(idx - 1);

    function tick(ts) {
      if (!last) last = ts;
      const dt = Math.min(ts - last, 100); // abaikan lonjakan saat tab kembali aktif
      last = ts;
      if (!paused()) {
        elapsed += dt;
        if (bar) bar.style.width = Math.min(100, (elapsed / interval) * 100) + '%';
        if (elapsed >= interval) next();
      }
      requestAnimationFrame(tick);
    }
    function toggleUi() {
      if (!toggleBtn) return;
      toggleBtn.innerHTML = userPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
      toggleBtn.setAttribute('aria-label', userPaused ? 'Putar slideshow' : 'Jeda slideshow');
    }

    // Dipanggil setiap kali isi slide berubah (query ulang DOM -> tidak ada referensi usang)
    function refresh(opts = {}) {
      slides = $$('.hero-slide', box);
      if (opts.interval) interval = opts.interval;
      if ('autoplay' in opts) autoplay = !!opts.autoplay;
      idx = opts.keepIndex ? Math.min(idx, Math.max(0, slides.length - 1)) : 0;
      dotsEl.innerHTML = slides.map((_, i) =>
        `<button type="button" class="hero-dot" role="tab" aria-label="Ke slide ${i + 1}" data-hero-go="${i}"></button>`).join('');
      const m = multi();
      if (controls) controls.classList.toggle('hidden', !m);
      $$('.hero-arrow').forEach(a => { a.style.display = m ? '' : 'none'; });
      const pr = $('.hero-progress'); if (pr) pr.style.display = m ? '' : 'none';
      elapsed = 0;
      if (bar) bar.style.width = '0';
      paint();
      toggleUi();
      if (!started) { started = true; requestAnimationFrame(tick); }
    }

    function bind() {
      root.addEventListener('click', e => {
        const b = e.target.closest('[data-hero]');
        if (b) { b.dataset.hero === 'next' ? next() : prev(); return; }
        const d = e.target.closest('[data-hero-go]');
        if (d) go(+d.dataset.heroGo);
      });
      if (toggleBtn) toggleBtn.addEventListener('click', () => { userPaused = !userPaused; toggleUi(); });

      root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
      root.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });
      root.addEventListener('focusin', e => { if (e.target.matches && e.target.matches(':focus-visible')) focusIn = true; });
      root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) focusIn = false; });

      root.addEventListener('keydown', e => {
        if (e.target.closest('input,textarea,select')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
        else if (e.key === 'Home') { e.preventDefault(); go(0); }
        else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
      });

      // Swipe (layar sentuh)
      let sx = 0, sy = 0, tracking = false;
      root.addEventListener('touchstart', e => {
        const t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true; hover = true;
      }, { passive: true });
      root.addEventListener('touchend', e => {
        hover = false;
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) (dx < 0 ? next : prev)();
      }, { passive: true });
      root.addEventListener('touchcancel', () => { tracking = false; hover = false; }, { passive: true });
    }
    return { refresh, bind, go, next, prev };
  })();

  let heroSig = '';
  function slideHtml(sl, i, total) {
    const tone = HERO_TONES[sl.warna] ? sl.warna : 'blue';
    const img = safeImg(sl.gambar) || HERO_DEFAULT_IMG;
    const l1 = safeLink(sl.cta1_link) || '#', l2 = safeLink(sl.cta2_link) || '#';
    const cta1 = sl.cta1_text ? `<a href="${esc(l1)}" class="hero-cta-primary" style="--tone:${HERO_TONES[tone]}"><i class="fas fa-arrow-right mr-2"></i>${esc(sl.cta1_text)}</a>` : '';
    const cta2 = sl.cta2_text ? `<a href="${esc(l2)}" class="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">${esc(sl.cta2_text)}</a>` : '';
    return `
    <div class="hero-slide${i === 0 ? ' active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} dari ${total}" data-tone="${tone}">
      <div class="hero-bg" style="${esc('background-image:' + cssUrl(img))}"></div>
      <div class="hero-tone hero-tone-${tone}"></div>
      <div class="relative container mx-auto px-4 h-full flex items-center">
        <div class="hero-content max-w-2xl text-white">
          ${sl.badge ? `<span class="inline-block bg-white/20 border border-white/30 px-4 py-1 rounded-full text-sm mb-4 backdrop-blur-sm"><i class="fas fa-star mr-2"></i>${esc(sl.badge)}</span>` : '<span></span>'}
          <h2 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">${esc(sl.judul)}</h2>
          <p class="hero-sub text-lg md:text-xl mb-8">${esc(sl.subtitle)}</p>
          <div class="flex flex-wrap gap-4">${cta1}${cta2}</div>
        </div>
      </div>
    </div>`;
  }
  function renderHero(list, cms) {
    if (!list) return;
    const active = list.filter(s => s && s.aktif);
    if (!active.length) return; // tidak ada slide aktif -> pakai slide bawaan
    const opts = {
      autoplay: !(cms.hero_autoplay === false || cms.hero_autoplay === 'false'),
      interval: clamp(Number(cms.hero_interval) || 5, 2, 20) * 1000
    };
    const sig = JSON.stringify([active, opts]);
    if (sig === heroSig) return; // tidak berubah -> jangan reset posisi slide
    const first = heroSig === '';
    heroSig = sig;
    $('#hero-slider-container').innerHTML = active.map((s, i) => slideHtml(s, i, active.length)).join('');
    Hero.refresh({ ...opts, keepIndex: !first });
  }


  // ===== LOGO, FAVICON, MENU NAVIGASI (dari CMS) =====
  // Ganti isi kotak logo dengan gambar; simpan kondisi awal agar bisa dikembalikan bila logo dihapus.
  function setBrandImg(el, src, alt, imgCls, boxCls) {
    if (!el) return;
    if (!el._orig) el._orig = { cls: el.className, html: el.innerHTML };
    if (src) {
      el.className = boxCls;
      el.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}" class="${imgCls}" onerror="this.remove()">`;
    } else {
      el.className = el._orig.cls;
      el.innerHTML = el._orig.html;
    }
  }
  function setFavicon(src) {
    let l = document.querySelector('link[rel~="icon"]');
    if (!l) { if (!src) return; l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    if (l.dataset.orig === undefined) l.dataset.orig = l.getAttribute('href') || '';
    if (src) { l.href = src; l.removeAttribute('type'); }
    else if (l.dataset.orig) l.href = l.dataset.orig;
    else l.removeAttribute('href');
  }
  function renderBrand(cms) {
    const logo = safeImg(cms.logo);
    setBrandImg($('#nav-logo'), logo, cms.nama, 'w-full h-full object-contain', 'w-12 h-12 flex items-center justify-center');
    setBrandImg($('#footer-logo'), logo, cms.nama, 'w-full h-full object-contain', 'w-10 h-10 flex items-center justify-center');
    setBrandImg($('#tentang-logo'), logo, cms.nama, 'h-24 max-w-[220px] object-contain bg-white rounded-2xl p-3 mb-4 shadow-lg', 'flex justify-center');
    setFavicon(safeImg(cms.favicon));
  }

  const linkAttrs = n => (n.baru ? ' target="_blank" rel="noopener noreferrer"' : '');
  // Tautan "#" berlabel Kebijakan Privasi / Syarat (data lama) dipetakan ke modal; menu legal disembunyikan bila dokumen kosong/nonaktif
  const navUrl = n => {
    let u = safeLink(n.url);
    if (u === '#') { if (/kebijakan\s+privasi/i.test(n.label)) u = '#kebijakan-privasi'; else if (/syarat/i.test(n.label)) u = '#syarat-ketentuan'; }
    return u;
  };
  const navOk = n => {
    if (!n || !n.aktif || !String(n.label || '').trim()) return false;
    const u = navUrl(n);
    if (!u) return false;
    const id = LEGAL_BY_HASH[u.slice(1)];
    return !(id && !legalDoc(id).ok);
  };
  function renderNav(top, bottom, cms) {
    if (top) {
      const act = top.filter(navOk);
      const d = $('#nav-top-desktop'), m = $('#nav-top-mobile');
      if (d) d.innerHTML = act.map(n => `<a href="${esc(navUrl(n))}"${linkAttrs(n)} class="nav-link text-slate-700 hover:text-blue-600 font-medium transition">${esc(n.label)}</a>`).join('');
      if (m) m.innerHTML = act.map(n => `<a href="${esc(navUrl(n))}"${linkAttrs(n)} class="text-slate-700 hover:text-blue-600 font-medium py-2 border-b">${esc(n.label)}</a>`).join('');
      rebuildSpy();
    }
    if (bottom) {
      const act = bottom.filter(navOk);
      const cols = act.filter(n => n.area !== 'baris'), rows = act.filter(n => n.area === 'baris');
      const ul = $('#footer-links'), lg = $('#footer-legal');
      if (ul) ul.innerHTML = cols.map(n => `<li><a href="${esc(navUrl(n))}"${linkAttrs(n)} class="hover:text-blue-400 transition">${esc(n.label)}</a></li>`).join('');
      if (lg) lg.innerHTML = rows.map(n => `<a href="${esc(navUrl(n))}"${linkAttrs(n)} class="hover:text-blue-400 transition">${esc(n.label)}</a>`).join('');
      setText('footer-links-title', cms.nav_bottom_title);
    }
  }

  // ===== IDENTITAS, KONTAK, JAM, TENTANG =====
  function renderIdentity(cms) {
    setText('rs-name', cms.nama);
    setText('rs-tagline', cms.tagline);
    setText('footer-rs-name', cms.nama);
    $$('[data-rs-name]').forEach(el => { el.textContent = cms.nama; });
    const ft = $('#footer-tagline');
    if (ft) ft.textContent = (cms.tagline ? cms.tagline + '. ' : '') + 'Rumah sakit terpercaya dengan layanan 24 jam dan dokter spesialis berpengalaman.';
    document.title = cms.nama + (cms.tagline ? ' - ' + cms.tagline : '');
    const cp = $('#footer-copyright');
    if (cp) cp.textContent = String(cms.copyright || '').replace(/^(&copy;|©)\s*/i, '');

    const addr = cms.alamat || '';
    setText('rs-address', addr); setText('footer-address', addr); setText('map-address', addr);
    const frame = $('#map-frame');
    if (frame && addr && frame.dataset.q !== addr) {
      frame.dataset.q = addr;
      frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent(addr) + '&output=embed';
    }
    const ml = $('#map-link');
    if (ml && addr) ml.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr);
  }

  function renderKontak(cms) {
    setText('topbar-telepon', cms.telepon); setText('topbar-email', cms.email); setText('topbar-igd', cms.jam_igd);
    setText('kontak-telepon', cms.telepon); setText('kontak-telepon-igd', cms.telepon_igd);
    setText('kontak-email', cms.email);
    setText('footer-telepon', cms.telepon); setText('footer-email', cms.email); setText('footer-igd', cms.jam_igd);

    $$('[data-tel]').forEach(a => {
      const v = a.dataset.tel === 'igd' ? cms.telepon_igd : cms.telepon;
      if (digits(v)) a.href = 'tel:' + digits(v);
    });
    const mail = $('#kontak-email');
    if (mail && cms.email) mail.href = 'mailto:' + cms.email;

    const wa = digits(cms.whatsapp);
    if (wa) {
      const text = encodeURIComponent('Halo ' + cms.nama + ', saya ingin bertanya tentang layanan rumah sakit.');
      $$('a[href*="wa.me"]').forEach(a => { a.href = `https://wa.me/${wa}?text=${text}`; });
    }
    $$('[data-sosmed]').forEach(a => {
      const url = safeLink(cms[a.dataset.sosmed]);
      const ok = /^https?:\/\//i.test(url);
      a.classList.toggle('hidden', !ok);
      if (ok) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    });
  }

  function renderJam(cms) {
    setText('jam-senin-jumat', cms.jam_senin_jumat); setText('jam-sabtu', cms.jam_sabtu);
    setText('jam-minggu', cms.jam_minggu); setText('jam-igd', cms.jam_igd);
  }

  function renderTentang(cms) {
    setText('tentang-judul', cms.nama);
    setText('tentang-sejarah', cms.tentang_sejarah);
    setText('tentang-visi', cms.tentang_visi);
    const misi = $('#tentang-misi');
    if (misi && cms.tentang_misi) {
      const items = String(cms.tentang_misi).split('\n').map(x => x.trim().replace(/^(\d+[.)]|[-•*])\s*/, '')).filter(Boolean);
      misi.innerHTML = items.map(x => `<li>${esc(x)}</li>`).join('');
    }
  }


  // ===== MENGAPA MEMILIH KAMI =====
  function renderMengapa(list, cms) {
    const jd = $('#mengapa-judul');
    if (jd) jd.textContent = cms.mengapa_judul || '';
    const box = $('#mengapa-list');
    if (!box || !list) return;
    const act = list.filter(x => x && x.aktif && (x.judul || x.deskripsi));
    const card = $('#mengapa-card');
    if (card && card.parentElement) card.parentElement.classList.toggle('hidden', !act.length);
    box.innerHTML = act.map(x => `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0"><i class="fas ${iconClass(x.icon)} text-white"></i></div>
        <div><h4 class="font-semibold mb-1">${esc(x.judul)}</h4><p class="text-blue-100 text-sm">${esc(x.deskripsi)}</p></div>
      </div>`).join('');
  }

  // ===== KEBIJAKAN PRIVASI & SYARAT KETENTUAN (modal) =====
  const LEGAL = {
    privasi: { key: 'kebijakan', hash: 'kebijakan-privasi', fallback: 'Kebijakan Privasi' },
    syarat: { key: 'syarat', hash: 'syarat-ketentuan', fallback: 'Syarat & Ketentuan' }
  };
  const LEGAL_BY_HASH = { 'kebijakan-privasi': 'privasi', 'syarat-ketentuan': 'syarat' };
  let CMS_NOW = DEFAULT_CMS;
  const isOff = v => v === false || v === 'false';

  function legalDoc(id) {
    const m = LEGAL[id], c = CMS_NOW, isi = String(c[m.key + '_isi'] || '').trim();
    return { id, judul: c[m.key + '_judul'] || m.fallback, isi, update: c[m.key + '_update'] || '', off: isOff(c[m.key + '_aktif']), ok: !isOff(c[m.key + '_aktif']) && !!isi };
  }

  // Format teks sederhana: "# / ## judul", "- poin", "1. poin berurut", **tebal**, baris kosong = paragraf baru.
  // Placeholder {{nama}} {{alamat}} {{telepon}} {{telepon_igd}} {{email}} {{whatsapp}} diisi dari CMS. Semua teks di-escape.
  function legalHtml(text) {
    const c = CMS_NOW, vars = { nama: c.nama, alamat: c.alamat, telepon: c.telepon, telepon_igd: c.telepon_igd, email: c.email, whatsapp: c.whatsapp };
    const src = String(text || '').replace(/\r/g, '').replace(/\{\{(\w+)\}\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const out = []; let list = null, para = [];
    const flushP = () => { if (para.length) { out.push(`<p class="mb-3">${para.map(inline).join('<br>')}</p>`); para = []; } };
    const flushL = () => {
      if (list) { out.push(`<${list.t} class="${list.t === 'ol' ? 'list-decimal' : 'list-disc'} pl-6 space-y-1 mb-3">${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.t}>`); list = null; }
    };
    src.split('\n').forEach(raw => {
      const line = raw.trim(); let m;
      if (!line) { flushP(); flushL(); return; }
      if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
        flushP(); flushL();
        out.push(m[1].length === 1 ? `<h3 class="text-xl font-bold text-slate-800 mt-6 mb-2">${inline(m[2])}</h3>` : `<h4 class="font-semibold text-slate-800 mt-5 mb-2">${inline(m[2])}</h4>`);
        return;
      }
      if ((m = line.match(/^[-*•]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = line.match(/^\d+[.)]\s+(.*)$/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); return; }
      flushL(); para.push(line);
    });
    flushP(); flushL();
    return out.join('');
  }

  let legalLast = null;
  function openLegal(id) {
    const m = $('#legal-modal');
    if (!m || !LEGAL[id]) return;
    const docs = Object.keys(LEGAL).map(legalDoc), d = docs.find(x => x.id === id);
    if (d.off) return;
    if (m.classList.contains('hidden')) legalLast = document.activeElement;
    $('#lg-tabs').innerHTML = docs.filter(x => !x.off).map(x =>
      `<button type="button" role="tab" aria-selected="${x.id === id}" data-legal="${x.id}" class="px-4 py-2 rounded-full text-sm font-semibold transition ${x.id === id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">${esc(x.judul)}</button>`).join('');
    $('#lg-judul').textContent = d.judul;
    $('#lg-update-wrap').classList.toggle('hidden', !d.update);
    $('#lg-update').textContent = formatDate(d.update);
    $('#lg-isi').innerHTML = d.isi ? legalHtml(d.isi) : '<p class="text-slate-500">Dokumen ini belum tersedia. Silakan hubungi kami untuk informasi lebih lanjut.</p>';
    $('#lg-scroll').scrollTop = 0;
    m.classList.remove('hidden'); m.classList.add('flex');
    document.body.classList.add('no-scroll');
    try { history.replaceState(null, '', '#' + LEGAL[id].hash); } catch (e) { /* file:// tertentu */ }
    $('#lg-close').focus();
  }
  function closeLegal() {
    const m = $('#legal-modal');
    if (!m || m.classList.contains('hidden')) return;
    m.classList.add('hidden'); m.classList.remove('flex');
    document.body.classList.remove('no-scroll');
    if (LEGAL_BY_HASH[location.hash.slice(1)]) { try { history.replaceState(null, '', location.href.split('#')[0]); } catch (e) { /* abaikan */ } }
    if (legalLast && legalLast.focus) legalLast.focus();
  }
  // Sembunyikan tautan/catatan legal bila dokumen kosong atau dinonaktifkan (termasuk tautan bawaan HTML)
  function applyLegalVisibility() {
    Object.keys(LEGAL).forEach(id => {
      const ok = legalDoc(id).ok;
      $$(`#footer-legal a[href="#${LEGAL[id].hash}"], #footer-links a[href="#${LEGAL[id].hash}"]`).forEach(a => { (a.closest('li') || a).classList.toggle('hidden', !ok); });
    });
    const any = Object.keys(LEGAL).some(id => legalDoc(id).ok);
    $$('[data-legal-note]').forEach(e => e.classList.toggle('hidden', !any));
  }
  function handleHash() {
    const id = LEGAL_BY_HASH[location.hash.slice(1)];
    if (id) openLegal(id);
  }

  // ===== SECTION DINAMIS =====
  // list === null  -> data CMS belum ada, pertahankan konten bawaan HTML
  // list kosong    -> admin menonaktifkan semuanya: sembunyikan section
  function toggleSection(container, show, anchorId) {
    const sec = container.closest('section');
    if (sec) sec.classList.toggle('hidden', !show);
    if (anchorId) $$(`a[href="#${anchorId}"]`).forEach(a => { (a.closest('li') || a).classList.toggle('hidden', !show); });
  }

  function renderLayanan(list) {
    const box = $('#layanan-container');
    if (!box || !list) return;
    const act = list.filter(l => l && l.aktif);
    toggleSection(box, act.length > 0, 'layanan');
    box.innerHTML = act.map(l => `
      <div class="service-card bg-white rounded-2xl p-6 shadow-lg reveal ${l.darurat ? 'border-t-4 border-red-500' : 'border-t-4 border-blue-600'}">
        <div class="w-14 h-14 ${l.darurat ? 'bg-red-100' : 'bg-blue-100'} rounded-xl flex items-center justify-center mb-4">
          <i class="fas ${iconClass(l.icon)} text-2xl ${l.darurat ? 'text-red-600' : 'text-blue-600'}"></i>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">${esc(l.nama)}</h3>
        <p class="text-slate-600 text-sm mb-4">${esc(l.deskripsi)}</p>
        <a href="${l.darurat ? '#kontak' : '#janji'}" class="text-blue-600 font-semibold text-sm hover:text-blue-700">${l.darurat ? 'Hubungi IGD' : 'Buat Janji'} <i class="fas fa-arrow-right ml-1"></i></a>
      </div>`).join('');

    const fl = $('#footer-layanan');
    if (fl) fl.innerHTML = act.slice(0, 6).map(l => `<li><a href="#layanan" class="hover:text-blue-400 transition">${esc(l.nama)}</a></li>`).join('');
  }

  function renderPromo(list) {
    const box = $('#promo-container');
    if (!box || !list) return;
    const act = list.filter(p => p && p.aktif);
    toggleSection(box, act.length > 0, 'promo');
    const grad = ['from-blue-500 to-blue-700', 'from-blue-700 to-blue-900', 'from-blue-400 to-blue-600'];
    box.innerHTML = act.map((p, i) => {
      const promo = Number(p.harga_promo) || 0, asli = Number(p.harga_asli) || 0;
      return `
      <div class="promo-card bg-white rounded-2xl shadow-lg overflow-hidden reveal">
        <div class="h-48 bg-gradient-to-br ${grad[i % grad.length]} flex items-center justify-center relative overflow-hidden">
          <i class="fas fa-tag text-6xl text-white/80"></i>
          ${safeImg(p.gambar) ? `<img src="${esc(safeImg(p.gambar))}" alt="${esc(p.judul)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()">` : ''}
          ${p.label ? `<span class="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">${esc(p.label)}</span>` : ''}
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-slate-800 mb-2">${esc(p.judul)}</h3>
          <p class="text-slate-600 text-sm mb-4">${esc(p.deskripsi)}</p>
          <div class="flex items-center justify-between gap-3">
            <div>
              ${asli > promo && promo > 0 ? `<span class="text-slate-400 line-through text-sm">${rup(asli)}</span>` : ''}
              <span class="text-blue-600 font-bold ${promo > 0 ? 'text-xl' : 'text-base'} ${asli > promo && promo > 0 ? 'ml-2' : ''}">${promo > 0 ? rup(promo) : 'Hubungi kami'}</span>
            </div>
            <a href="#janji" data-promo="${esc(p.judul)}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition shrink-0">Pesan</a>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderBerita(list) {
    const box = $('#berita-container');
    if (!box || !list) return;
    const act = list.filter(b => b && b.aktif)
      .map((b, i) => ({ b, i }))
      .sort((x, y) => String(y.b.tanggal || '').localeCompare(String(x.b.tanggal || '')) || x.i - y.i)
      .map(x => x.b).slice(0, 9);
    toggleSection(box, act.length > 0, 'berita');
    const grad = ['from-blue-500 to-blue-700', 'from-blue-600 to-blue-800', 'from-blue-700 to-blue-900'];
    box.innerHTML = act.map((b, i) => `
      <div class="news-card bg-white rounded-2xl shadow-lg overflow-hidden reveal">
        <div class="h-48 bg-gradient-to-br ${grad[i % grad.length]} flex items-center justify-center relative overflow-hidden">
          <i class="fas ${iconClass(b.icon)} text-5xl text-white/80"></i>
          ${safeImg(b.gambar) ? `<img src="${esc(safeImg(b.gambar))}" alt="${esc(b.judul)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover" onerror="this.remove()">` : ''}
        </div>
        <div class="p-6">
          <div class="flex items-center gap-3 text-sm text-slate-500 mb-3">
            <span><i class="far fa-calendar mr-1"></i>${esc(formatDate(b.tanggal))}</span>
            <span><i class="far fa-folder mr-1"></i>${esc(b.kategori)}</span>
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2 line-clamp-2">${esc(b.judul)}</h3>
          <p class="text-slate-600 text-sm mb-4 line-clamp-3">${esc(b.ringkasan)}</p>
          <button type="button" data-berita="${esc(b.id)}" class="text-blue-600 font-semibold text-sm hover:text-blue-700">Baca Selengkapnya <i class="fas fa-arrow-right ml-1"></i></button>
        </div>
      </div>`).join('');
  }

  function renderTestimoni(list) {
    const box = $('#testimoni-container');
    if (!box || !list) return;
    const act = list.filter(t => t && t.aktif);
    toggleSection(box, act.length > 0, null);
    box.innerHTML = act.map(t => {
      const r = clamp(Math.round(Number(t.rating) || 0), 0, 5);
      return `
      <div class="testimonial-card bg-white rounded-2xl p-6 shadow-lg reveal">
        <div class="flex items-center gap-1 mb-4" role="img" aria-label="Rating ${r} dari 5">
          ${Array.from({ length: 5 }, (_, i) => `<i class="fas fa-star ${i < r ? 'text-amber-400' : 'text-slate-300'}"></i>`).join('')}
        </div>
        <p class="text-slate-600 mb-6 italic">"${esc(t.ulasan)}"</p>
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><i class="fas fa-user text-blue-600"></i></div>
          <div>
            <h4 class="font-semibold text-slate-800">${esc(t.nama)}</h4>
            <p class="text-sm text-slate-500">${esc(t.profesi)}</p>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  // ===== DOKTER =====
  const docState = { q: '', sp: '', all: false };
  const SPEC_ICON = [[/anak|pediatri/i, 'fa-baby'], [/jantung|kardio/i, 'fa-heartbeat'], [/mata/i, 'fa-eye'],
    [/saraf|neuro/i, 'fa-brain'], [/bedah/i, 'fa-procedures'], [/gigi|mulut/i, 'fa-tooth'], [/paru/i, 'fa-lungs'],
    [/tht/i, 'fa-ear-listen'], [/kandungan|obgyn/i, 'fa-person-pregnant'], [/radiolog/i, 'fa-x-ray'], [/dalam/i, 'fa-stethoscope']];
  const specIcon = sp => { const f = SPEC_ICON.find(([re]) => re.test(sp || '')); return f ? f[1] : 'fa-user-md'; };
  const GRAD = ['from-blue-400 to-blue-600', 'from-blue-500 to-blue-700', 'from-sky-400 to-sky-600', 'from-indigo-400 to-indigo-600'];

  const getPoliList = () => arr(DB.poli) || DEFAULT_POLI;
  const getDokterList = () => (arr(DB.dokter) || DEFAULT_DOKTER).filter(d => d && d.tampil !== false);
  const poliName = id => { const p = getPoliList().find(x => String(x.id) === String(id)); return p ? p.nama : 'Poli Umum'; };

  function renderDokter() {
    const box = $('#dokter-list');
    if (!box) return;
    const all = getDokterList();

    // opsi spesialis (pertahankan pilihan)
    const spSel = $('#dokter-spesialis');
    if (spSel) {
      const sps = [...new Set(all.map(d => d.spesialis).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'id'));
      spSel.innerHTML = '<option value="">Semua Spesialis</option>' + sps.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
      if (sps.includes(docState.sp)) spSel.value = docState.sp; else docState.sp = '';
    }

    const q = docState.q.trim().toLowerCase();
    const filtered = all.filter(d =>
      (!docState.sp || d.spesialis === docState.sp) &&
      (!q || [d.nama, d.spesialis, poliName(d.poli)].join(' ').toLowerCase().includes(q)));
    const filtering = !!(q || docState.sp);
    const LIMIT = 8;
    const shown = filtering || docState.all ? filtered : filtered.slice(0, LIMIT);

    box.innerHTML = shown.map((d, i) => `
      <div class="doctor-card bg-white rounded-2xl shadow-lg overflow-hidden reveal">
        <div class="h-48 bg-gradient-to-br ${GRAD[i % GRAD.length]} flex items-center justify-center relative">
          <i class="fas ${specIcon(d.spesialis)} text-5xl text-white/80"></i>
          ${safeImg(d.foto) ? `<img src="${esc(safeImg(d.foto))}" alt="${esc(d.nama)}" loading="lazy" decoding="async" class="absolute inset-0 w-full h-full object-cover object-top" onerror="this.remove()">` : ''}
          <div class="doctor-overlay absolute inset-0 bg-black/50 flex items-center justify-center">
            <a href="#janji" data-dokter-id="${esc(d.id)}" data-poli-id="${esc(d.poli)}" class="bg-white text-blue-600 px-4 py-2 rounded-full font-semibold text-sm hover:bg-blue-50 transition">
              <i class="fas fa-calendar-check mr-1"></i>Buat Janji
            </a>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-bold text-gray-800 text-sm mb-1">${esc(d.nama)}</h3>
          <p class="text-blue-600 text-xs font-semibold mb-2">${esc(d.spesialis)}</p>
          <p class="text-gray-500 text-xs"><i class="fas fa-hospital mr-1"></i>${esc(poliName(d.poli))}</p>
          <p class="text-gray-500 text-xs mt-1"><i class="fas fa-clock mr-1"></i>${esc(d.jadwal || '-')}</p>
        </div>
      </div>`).join('');

    const empty = $('#dokter-kosong');
    if (empty) empty.classList.toggle('hidden', filtered.length > 0);

    const tg = $('#dokter-toggle');
    if (tg) {
      const needToggle = !filtering && filtered.length > LIMIT;
      tg.parentElement.classList.toggle('hidden', !needToggle);
      tg.innerHTML = docState.all
        ? 'Tampilkan Lebih Sedikit <i class="fas fa-arrow-up ml-2"></i>'
        : `Lihat Semua Dokter (${filtered.length}) <i class="fas fa-arrow-right ml-2"></i>`;
    }
    observeReveals();
  }

  // ===== FORM: opsi poli & dokter =====
  function fillPoli() {
    const sel = $('#ap-poli');
    if (!sel) return;
    const cur = sel.value;
    const list = getPoliList().filter(p => p.status !== 'Nonaktif')
      .slice().sort((a, b) => String(a.nama).localeCompare(String(b.nama), 'id'));
    sel.innerHTML = '<option value="">-- Pilih Poli --</option>' +
      list.map(p => `<option value="${esc(p.id)}">${esc(p.nama)}</option>`).join('');
    if (cur && list.some(p => String(p.id) === cur)) sel.value = cur;
    fillDokterOptions();
  }
  function fillDokterOptions(selected) {
    const sel = $('#ap-dokter'), poli = $('#ap-poli');
    if (!sel || !poli) return;
    const cur = selected !== undefined ? String(selected) : sel.value;
    const list = poli.value ? getDokterList().filter(d => String(d.poli) === poli.value) : [];
    sel.innerHTML = `<option value="">${poli.value ? (list.length ? 'Sesuai jadwal tersedia' : 'Dokter ditentukan petugas') : 'Pilih poli terlebih dulu'}</option>` +
      list.map(d => `<option value="${esc(d.id)}">${esc(d.nama)} (${esc(d.jadwal || '-')})</option>`).join('');
    if (cur && list.some(d => String(d.id) === cur)) sel.value = cur;
  }

  // ===== STATISTIK & ANIMASI =====
  const fmtStat = n => (n > 0 ? n.toLocaleString('id-ID') + '+' : '0');
  const statIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { animateCounter(en.target); statIO.unobserve(en.target); } }), { threshold: 0.4 })
    : null;

  function animateCounter(el) {
    el.dataset.done = '1';
    const target = Number(el.dataset.target) || 0;
    if (reduceMotion || !target) { el.textContent = fmtStat(target); return; }
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmtStat(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmtStat(Number(el.dataset.target) || 0);
    })(t0);
  }
  function renderStats(cms) {
    const val = k => { const n = Number(cms[k]); return Number.isFinite(n) && n >= 0 ? n : 0; };
    [['stat-dokter', 'stat_tenaga_medis'], ['stat-pasien', 'stat_pasien_dilayani'],
      ['stat-mitra', 'stat_mitra'], ['stat-penghargaan', 'stat_penghargaan']].forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = val(key), prev = el.dataset.target;
      el.dataset.target = v;
      if (el.dataset.done === '1') { if (String(prev) !== String(v)) el.textContent = fmtStat(v); return; }
      if (!el.dataset.obs) { el.dataset.obs = '1'; statIO ? statIO.observe(el) : animateCounter(el); }
    });
  }

  const revIO = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('active'); revIO.unobserve(en.target); } }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  function observeReveals() {
    $$('.reveal:not(.active)').forEach(el => {
      if (!revIO) return el.classList.add('active');
      if (!el._rev) { el._rev = true; revIO.observe(el); }
    });
  }

  // ===== RENDER UTAMA =====
  function render() {
    const raw = SOURCE === 'published' ? PUBDB : readDb();
    DB = raw || {};
    const cms = Object.assign({}, DEFAULT_CMS, raw && raw.cms && typeof raw.cms === 'object' ? raw.cms : {});

    CMS_NOW = cms;
    renderIdentity(cms); renderBrand(cms); renderKontak(cms); renderJam(cms); renderTentang(cms);
    renderMengapa(arr(DB.cms_mengapa), cms);
    renderNav(arr(DB.cms_nav_top), arr(DB.cms_nav_bottom), cms);
    applyLegalVisibility();
    renderHero(arr(DB.cms_hero), cms);
    renderLayanan(arr(DB.cms_layanan));
    renderPromo(arr(DB.cms_promo));
    renderBerita(arr(DB.cms_berita));
    renderTestimoni(arr(DB.cms_testimoni));
    renderDokter();
    fillPoli();
    renderStats(cms);
    observeReveals();
  }

  // ===== MODAL BERITA =====
  let lastFocus = null;
  function openBerita(id) {
    const b = (arr(DB.cms_berita) || []).find(x => String(x.id) === String(id));
    const m = $('#berita-modal');
    if (!b || !m) return;
    lastFocus = document.activeElement;
    $('#bm-judul').textContent = b.judul || '';
    $('#bm-tanggal').textContent = formatDate(b.tanggal);
    $('#bm-kategori').textContent = b.kategori || '-';
    $('#bm-icon').className = 'fas ' + iconClass(b.icon) + ' text-5xl text-white/80';
    const bi = $('#bm-img'), bh = $('#bm-header'), src = safeImg(b.gambar);
    if (bi) {
      bi.classList.toggle('hidden', !src);
      if (src) bi.src = src; else bi.removeAttribute('src');
    }
    if (bh) { bh.classList.toggle('h-36', !src); bh.classList.toggle('aspect-video', !!src); }
    const body = String(b.isi || b.ringkasan || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
    $('#bm-isi').innerHTML = body.map(x => `<p>${esc(x)}</p>`).join('');
    m.classList.remove('hidden'); m.classList.add('flex');
    document.body.classList.add('no-scroll');
    $('#bm-close').focus();
  }
  function closeBerita() {
    const m = $('#berita-modal');
    if (!m || m.classList.contains('hidden')) return;
    m.classList.add('hidden'); m.classList.remove('flex');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ===== MENU MOBILE =====
  function setupMenu() {
    const btn = $('#mobileMenuBtn'), menu = $('#mobileMenu'), close = $('#closeMobileMenu');
    if (!btn || !menu) return;
    const set = open => {
      menu.classList.toggle('active', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('no-scroll', open);
    };
    btn.addEventListener('click', () => set(true));
    if (close) close.addEventListener('click', () => set(false));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('active')) set(false); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 1024 && menu.classList.contains('active')) set(false); });
  }

  function setupScroll() {
    const navbar = $('#navbar');
    if (navbar) {
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const s = window.scrollY > 100;
          navbar.classList.toggle('shadow-lg', s); navbar.classList.toggle('shadow-md', !s);
          ticking = false;
        });
      }, { passive: true });
    }
    rebuildSpy();
  }

  // Scrollspy: tandai menu sesuai section yang sedang dibaca (dibangun ulang saat menu berubah)
  let spy = null;
  function rebuildSpy() {
    if (!('IntersectionObserver' in window)) return;
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) $$('.nav-link').forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    const ids = new Set(['beranda', 'tentang', 'layanan', 'dokter', 'promo', 'janji', 'berita', 'kontak']);
    $$('.nav-link').forEach(l => { const h = l.getAttribute('href') || ''; if (/^#[\w-]+$/.test(h)) ids.add(h.slice(1)); });
    ids.forEach(id => { const el = document.getElementById(id); if (el) spy.observe(el); });
  }

  // ===== FORM =====
  function showErr(id, msgs) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = msgs.map(esc).join('<br>');
    el.classList.toggle('hidden', !msgs.length);
  }
  function pushList(key, item) {
    const list = readJson(key, []);
    const a = Array.isArray(list) ? list : [];
    item.id = a.reduce((m, x) => Math.max(m, +x.id || 0), 0) + 1;
    a.push(item);
    localStorage.setItem(key, JSON.stringify(a.slice(-MAX_ITEMS)));
    return item;
  }
  function busy(form, ms = 1500) {
    const b = form.querySelector('[type=submit]');
    if (!b) return;
    b.disabled = true;
    setTimeout(() => { b.disabled = false; }, ms);
  }

  // Cara pengiriman formulir. 'auto': website terbit (GitHub Pages) -> WhatsApp; mode lokal/uji -> inbox lokal.
  function formMode() {
    const m = String(CMS_NOW.form_mode || 'auto');
    if (m !== 'auto') return m;
    return SOURCE === 'published' ? 'whatsapp' : 'lokal';
  }
  function openWhatsApp(text) {
    const wa = digits(CMS_NOW.whatsapp);
    if (!wa) return false;
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
    return true;
  }
  async function postEndpoint(data) {
    const ep = String(CMS_NOW.form_endpoint || '').trim();
    if (!/^https:\/\//i.test(ep)) throw new Error('Alamat endpoint formulir belum diatur dengan benar.');
    const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error('Server formulir menolak permintaan (HTTP ' + r.status + ').');
  }

  function setupForms() {
    const ap = $('#appointmentForm');
    if (ap) {
      const tgl = ap.elements.tgl;
      if (tgl) tgl.min = todayStr();
      $('#ap-poli').addEventListener('change', () => fillDokterOptions(''));

      ap.addEventListener('submit', async e => {
        e.preventDefault();
        if (ap.elements.website && ap.elements.website.value) return; // honeypot
        const f = ap.elements;
        const nama = f.nama.value.trim().replace(/\s+/g, ' '), telp = f.telp.value.trim(), d = digits(telp);
        const errs = [];
        if (nama.length < 3) errs.push('Nama lengkap minimal 3 karakter.');
        if (d.length < 9 || d.length > 15) errs.push('Nomor telepon tidak valid (9-15 digit).');
        if (!f.poli.value) errs.push('Silakan pilih poli.');
        if (!f.tgl.value || f.tgl.value < todayStr()) errs.push('Pilih tanggal kunjungan hari ini atau setelahnya.');
        showErr('ap-error', errs);
        if (errs.length) return;

        const polOpt = f.poli.options[f.poli.selectedIndex], dokOpt = f.dokter.options[f.dokter.selectedIndex];
        const poliTxt = polOpt ? polOpt.textContent : '', dokTxt = f.dokter.value && dokOpt ? dokOpt.textContent.replace(/\s*\(.*\)$/, '') : '';
        const keluhan = f.keluhan.value.trim(), mode = formMode();
        const done = () => { ap.reset(); fillDokterOptions(''); if (tgl) tgl.min = todayStr(); };
        try {
          if (mode === 'whatsapp') {
            const text = [`Halo ${CMS_NOW.nama}, saya ingin mendaftar kunjungan.`, `Nama: ${nama}`, `Telepon: ${telp}`, `Poli: ${poliTxt}`,
              dokTxt ? `Dokter: ${dokTxt}` : '', `Tanggal kunjungan: ${formatDate(f.tgl.value)}`, keluhan ? `Keluhan: ${keluhan}` : ''].filter(Boolean).join('\n');
            if (!openWhatsApp(text)) throw new Error('Nomor WhatsApp rumah sakit belum diatur. Silakan hubungi kami via telepon.');
            busy(ap); done();
            toast('Membuka WhatsApp... Kirim pesan yang sudah terisi untuk menyelesaikan pendaftaran Anda.', 9000);
          } else if (mode === 'endpoint') {
            busy(ap, 4000);
            await postEndpoint({ jenis: 'pendaftaran', rumah_sakit: CMS_NOW.nama, nama, telepon: telp, poli: poliTxt, dokter: dokTxt, tanggal: f.tgl.value, keluhan });
            done();
            toast('Pendaftaran terkirim! Petugas kami akan mengonfirmasi jadwal melalui telepon/WhatsApp.', 9000);
          } else {
            const it = pushList(INBOX_KEY, {
              kode: '', nama, telp, poliId: +f.poli.value || 0, poli: poliTxt,
              dokterId: +f.dokter.value || 0, dokter: dokTxt,
              tgl: f.tgl.value, keluhan, status: 'Baru', dibuat: new Date().toISOString()
            });
            const list = readJson(INBOX_KEY, []);
            const row = list.find(x => x.id === it.id);
            if (row) { row.kode = 'JNJ-' + f.tgl.value.replace(/-/g, '').slice(2) + '-' + String(it.id).padStart(3, '0'); localStorage.setItem(INBOX_KEY, JSON.stringify(list)); it.kode = row.kode; }
            busy(ap); done();
            toast(`Pendaftaran terkirim! Kode booking Anda: ${it.kode}. Petugas kami akan mengonfirmasi jadwal melalui telepon/WhatsApp.`, 9000);
          }
        } catch (err) {
          showErr('ap-error', [err && err.message ? err.message : 'Pendaftaran gagal dikirim. Silakan hubungi kami via telepon atau WhatsApp.']);
        }
      });
    }

    const ct = $('#contactForm');
    if (ct) {
      ct.addEventListener('submit', async e => {
        e.preventDefault();
        const f = ct.elements;
        if (f.website && f.website.value) return;
        const errs = [];
        const nama = f.nama.value.trim(), email = f.email.value.trim(), subjek = f.subjek.value.trim(), pesan = f.pesan.value.trim();
        if (nama.length < 2) errs.push('Nama wajib diisi.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.push('Format email tidak valid.');
        if (subjek.length < 3) errs.push('Subjek minimal 3 karakter.');
        if (pesan.length < 10) errs.push('Pesan minimal 10 karakter.');
        showErr('ct-error', errs);
        if (errs.length) return;
        const mode = formMode();
        try {
          if (mode === 'whatsapp') {
            const text = [`Halo ${CMS_NOW.nama},`, `Subjek: ${subjek}`, '', pesan, '', `Dari: ${nama} (${email})`].join('\n');
            if (!openWhatsApp(text)) throw new Error('Nomor WhatsApp rumah sakit belum diatur. Silakan hubungi kami via telepon atau email.');
            busy(ct); ct.reset();
            toast('Membuka WhatsApp... Kirim pesan yang sudah terisi agar sampai ke kami.');
          } else if (mode === 'endpoint') {
            busy(ct, 4000);
            await postEndpoint({ jenis: 'pesan', rumah_sakit: CMS_NOW.nama, nama, email, subjek, pesan });
            ct.reset();
            toast('Terima kasih! Pesan Anda telah kami terima dan akan segera ditindaklanjuti.');
          } else {
            pushList(MSG_KEY, { nama, email, subjek, pesan, dibuat: new Date().toISOString(), dibaca: false });
            busy(ct); ct.reset();
            toast('Terima kasih! Pesan Anda telah kami terima dan akan segera ditindaklanjuti.');
          }
        } catch (err) {
          showErr('ct-error', [err && err.message ? err.message : 'Pesan gagal dikirim. Silakan hubungi kami via telepon atau WhatsApp.']);
        }
      });
    }
  }

  // ===== EVENT GLOBAL =====
  function setupEvents() {
    document.addEventListener('click', e => {
      const lg = e.target.closest('a[href="#kebijakan-privasi"], a[href="#syarat-ketentuan"], [data-legal]');
      if (lg) {
        e.preventDefault();
        openLegal(lg.dataset.legal || LEGAL_BY_HASH[lg.getAttribute('href').slice(1)]);
        return;
      }
      if (e.target.id === 'legal-modal' || e.target.closest('#lg-close, #lg-ok')) { closeLegal(); return; }
      const a = e.target.closest('a');
      if (a && a.getAttribute('href') === '#') { e.preventDefault(); return; }

      const promo = e.target.closest('[data-promo]');
      if (promo) {
        const k = $('#ap-keluhan');
        if (k && !k.value.trim()) k.value = 'Promo: ' + promo.dataset.promo;
        return;
      }
      const dk = e.target.closest('[data-dokter-id]');
      if (dk) {
        const poli = $('#ap-poli');
        if (poli && Array.from(poli.options).some(o => o.value === String(dk.dataset.poliId))) {
          poli.value = dk.dataset.poliId;
          fillDokterOptions(dk.dataset.dokterId);
        }
        return;
      }
      const nb = e.target.closest('[data-berita]');
      if (nb) { openBerita(nb.dataset.berita); return; }
      if (e.target.id === 'berita-modal' || e.target.closest('#bm-close')) closeBerita();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeBerita(); closeLegal(); } });
    window.addEventListener('hashchange', handleHash);

    const cari = $('#dokter-cari'), sp = $('#dokter-spesialis'), tg = $('#dokter-toggle');
    let tmr;
    if (cari) cari.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(() => { docState.q = cari.value; renderDokter(); }, 150); });
    if (sp) sp.addEventListener('change', () => { docState.sp = sp.value; renderDokter(); });
    if (tg) tg.addEventListener('click', () => { docState.all = !docState.all; renderDokter(); if (!docState.all) $('#dokter').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); });

    // Perubahan dari panel admin (tab lain) langsung tampil
    window.addEventListener('storage', e => { if (SOURCE !== 'published' && (e.key === SIMRS_KEY || e.key === null)) render(); });
  }

  // ===== SUMBER DATA =====
  async function loadSource() {
    if (new URLSearchParams(location.search).has('preview')) {
      SOURCE = 'draft';
      const b = document.createElement('div');
      b.setAttribute('role', 'status');
      b.className = 'fixed bottom-4 left-4 z-[80] max-w-xs rounded-xl bg-amber-500 text-white text-xs px-4 py-3 shadow-2xl';
      b.innerHTML = '<b>Pratinjau draft</b> - menampilkan data CMS di browser ini. Belum tentu sudah diterbitkan. <a class="underline font-semibold" href="' + esc(location.pathname) + '">Lihat versi terbit</a>';
      document.body.appendChild(b);
      return;
    }
    try {
      const r = await fetch(CFG.dataPath + '?v=' + Math.floor(Date.now() / 60000), { cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (j && typeof j === 'object' && j.cms) { PUBDB = j; SOURCE = 'published'; }
      }
    } catch (e) { /* file:// atau belum ada data terbit -> pakai data lokal */ }
  }

  // ===== INISIALISASI =====
  async function init() {
    Hero.bind();
    Hero.refresh({ autoplay: true, interval: 5000 }); // slide bawaan
    setupMenu(); setupScroll(); setupForms(); setupEvents();
    try { await loadSource(); } catch (e) { /* abaikan */ }
    render();
    handleHash();
    document.documentElement.classList.remove('js-loading');
    console.log('Website siap. Sumber data: ' + SOURCE);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
