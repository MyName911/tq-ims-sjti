# Sistem Manajemen Mutu STI

IMS PT Safarijunie Textindo Industry untuk proses tekstil dan tenun kain greige dan kain finish. Quality Manual STI merujuk ISO 9001:2015. Dashboard menampilkan model proses, kebijakan mutu, dan catatan klarifikasi ruang lingkup klausul 8.3.

| Modul | Sumber / isi | Rute |
|---|---|---|
| Konteks Organisasi | FOM/MR/001, isu dan kebutuhan pihak berkepentingan | `/pestel` |
| Sasaran Mutu | Quality Manual, FOM/MR/003, dan pedoman tinjauan manajemen STD/MR/001 | `/executive` |
| Risiko & Program Kerja | FOM/MR/002 dan FOM/MR/004, dengan penilaian menurut STD/MR/002 | `/risk` |
| Pengetahuan & Kompetensi | FOM/MR/005 serta pencatatan kompetensi dan pelatihan | `/skill` |
| Pengendalian Dokumen | Katalog MR, SOP, STANDARD, dan INSTRUKSI KERJA | `/edoc` |
| Audit & Pelanggan | SOP/AMI/001, audit, temuan, survei, dan SPKR | `/audit` |
| Tindakan Korektif | SOP/MR/003 dan pencatatan FTKAR FOM/MR/006 | `/capa` |
| IMS 360° | Model proses bisnis dan ringkasan lintas modul | `/ims` |

Data awal ditranskripsi dari bagian PDF yang dapat dibaca. Setiap entri impor terhubung ke dokumen sumber dan halaman PDF. Katalog berisi 184 dokumen unik dari 212 file sumber, termasuk lokasi salinan identik. Detail dokumen menunjukkan jalur relatif ke folder sumber. Status pengendalian dokumen tersedia untuk diverifikasi oleh pengelola.

Realisasi sasaran, catatan audit, FTKAR, dan penilaian individu dimulai kosong jika sumber hanya memuat target, prosedur, atau daftar pengetahuan. Data yang diinput tersimpan di localStorage browser (`tq-ims:data:v1`). Alamat lama `/data/<dataset>` dan rute modul tetap dapat digunakan, termasuk `/risk/okr` untuk Program Kerja.

## Menjalankan

```bash
npm ci
npm run dev
```

`npm run lint` memeriksa kode. `npm run build` membangun halaman statis Next.js. Untuk penyimpanan bersama, ganti penyimpanan browser dengan API yang memakai bentuk data yang sama.
