# ISO 9001:2026 Digital System

Dashboard referensi Total Quality Indonesia untuk pengembangan sistem digital ISO 9001:2026.
Studi kasus fiktif **PT Sinar Busana Nusantara** (pabrik garmen ekspor). Semua data adalah dummy.

## Isi

| Ikon (lucide) | Sistem | Klausul | Rute |
|---|---|---|---|
| Globe | Digital PESTEL & Stakeholder Portal | 4 | `/pestel` |
| Gauge | Executive Quality Dashboard & Digital Policy | 5 · 9.3 | `/executive` |
| ShieldAlert | Risk Register & OKR | 6 | `/risk` |
| GraduationCap | Digital Skill Matrix & E-Learning | 7.2 · 7.3 | `/skill` |
| FolderOpen | E-Document Management System | 7.5 | `/edoc` |
| ClipboardCheck | E-Audit & Real-Time Feedback | 9.1.2 · 9.2 | `/audit` |
| Wrench | CAPA Digital | 10.2 | `/capa` |
| Orbit | IMS 360° (integrasi semua sistem) | 4–10 | `/ims` |

Halaman `/` adalah hub "ISO 9001:2026 Digital System" (wireframe PDF main): satu kotak per sistem.

## Interaksi

- **Drill-down**: setiap kartu KPI, irisan donut, segmen batang, titik tren, sel heatmap, dan baris bar
  membuka `/data/<dataset>?<field>=<nilai>` — tabel detail yang sudah terfilter.
- **Halaman detail**: pencarian, sortir kolom, filter facet (dengan jumlah), grafik sebaran per bulan,
  paginasi, export Excel/CSV, dan drawer detail baris dengan tautan ke data terkait
  (temuan → CAPA, karyawan → pelatihan, isu PESTEL → risiko).
- **Filter dashboard**: tiap modul punya filter (departemen, kategori, periode) yang mengubah semua widget
  sekaligus, dan tautan drill-down ikut membawa filter tersebut.
- **Pencarian global**: `Ctrl+K` mencari kode/judul di seluruh dataset.

## Struktur

```
src/lib/data/*.js     Generator data dummy ber-seed (hasil selalu sama di server & browser)
src/lib/datasets.js   Registry dataset: kolom, facet, ringkasan, relasi — dipakai semua drill-down
src/lib/modules.js    Daftar modul A–H
src/components/       AppShell, kit UI, grafik yang bisa diklik (Recharts), DataExplorer
src/app/<modul>/      Dashboard per modul
src/app/data/[dataset]  Halaman data detail
```

Angka di grafik dihitung dari baris yang sama dengan yang ditampilkan di tabel detail, jadi selalu cocok.
Untuk menyambungkan ke data asli, ganti isi `src/lib/data/*.js` dengan hasil API/database
dengan bentuk baris yang sama.

## Menjalankan

```bash
npm install
npm run dev
```

## Deploy ke Vercel

Proyek ini Next.js murni tanpa database dan tanpa env var; semua halaman dirender statis.
Impor folder/repo di Vercel (framework: Next.js, Node 22) atau jalankan `npx vercel`.
Situs memakai `noindex`, jadi tidak muncul di mesin pencari. File PDF referensi diabaikan lewat `.vercelignore`.
