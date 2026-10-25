/* ==========================================================
   KONFIGURASI HOSTING - SIMRS / Website RS
   Dimuat oleh index.html dan simrs.html.

   Di GitHub Pages (https://<owner>.github.io/<repo>/) nilai owner & repo
   terdeteksi OTOMATIS dari alamat situs, jadi file ini boleh dibiarkan.
   Isi manual HANYA bila memakai domain kustom, atau saat menguji lokal
   dengan repositori sungguhan.
   ========================================================== */
window.SIMRS_CONFIG = {
  owner: '',            // contoh: 'rs-sehat-sentosa'   (kosong = deteksi otomatis dari *.github.io)
  repo: '',             // contoh: 'website-rs'         (kosong = deteksi otomatis)
  branch: '',           // branch yang disajikan Pages; kosong = branch default repositori
  dataPath: 'data/site.json',   // lokasi data konten publik di repositori
  imgDir: 'assets/img',         // folder gambar hasil unggahan CMS (dikelola otomatis, jangan isi manual)
  allowedUsers: []      // opsional: daftar username GitHub yang boleh login, mis. ['dr-andi', 'admin-rs']
                        // kosong = semua akun yang punya akses TULIS ke repositori
};
