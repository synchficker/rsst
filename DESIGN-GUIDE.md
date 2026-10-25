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
