// Modul F, Kepuasan pelanggan (Klausul 9.1.2) dan audit internal (9.2).
import { rng, PEOPLE, MONTHS, LAST6, TODAY, addDays, pad, monthOf } from './core';

export const AUDIT_TYPES = ['Audit Internal SMM', 'Audit Proses', 'Audit Produk (Final)', 'Audit Pemasok', 'Audit Social Compliance', 'Audit Eksternal'];
export const AUDITORS = ['Budi Santoso', 'Siti Rahma', 'Andi Wijaya', 'Rina Susanti', 'Dedi Kurniawan', 'Maya Sari', 'Teguh Prasetyo'];
const AREAS = ['Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Warehouse', 'Maintenance', 'PPIC', 'HR & GA', 'Purchasing'];

// [area, deskripsi temuan, klausul]
const FINDING_TEXT = {
  Cutting: [['Shade band tidak tersedia untuk 2 roll kain', '8.5.1'], ['Marker tidak mencantumkan nomor revisi pola', '7.5.3'], ['Pisau cutting tanpa guard pada meja 3', '7.1.4'], ['Rekaman relaxing kain tidak lengkap', '7.5.3']],
  Sewing: [['SOP setting line tidak sesuai versi terbaru', '7.5.3'], ['Inline inspection tidak dilakukan tiap 2 jam', '8.5.1'], ['Operator baru belum memiliki bukti training', '7.2'], ['Kartu kontrol jarum tidak diisi', '8.5.1'], ['Sampel standar (golden sample) tidak tersedia di line', '8.5.1']],
  Finishing: [['Metal detector tidak diverifikasi awal shift', '7.1.5'], ['Area packing bercampur barang reject', '8.7'], ['Label karton tidak sesuai packing list', '8.5.2']],
  'Quality Control': [['Alat ukur (meteran) melewati jadwal kalibrasi', '7.1.5'], ['Hasil uji kain masuk tidak lengkap', '8.6'], ['Kriteria AQL tidak sesuai permintaan buyer', '8.2.3'], ['Produk tidak sesuai belum diberi tanda karantina', '8.7']],
  Warehouse: [['Penataan barang tidak rapi & label lokasi hilang', '7.1.4'], ['FIFO bahan baku tidak diterapkan', '8.5.4'], ['Selisih stok kancing 3,2% saat opname', '8.5.4']],
  Maintenance: [['Jadwal kalibrasi alat terlambat', '7.1.5'], ['Rekaman preventive maintenance tidak lengkap', '7.1.3'], ['Spare part kritis tidak memiliki stok minimum', '7.1.3']],
  PPIC: [['Perubahan jadwal produksi tanpa persetujuan', '8.5.6'], ['Kapasitas line tidak diperbarui', '8.1']],
  'HR & GA': [['Absensi karyawan belum lengkap', '7.5.3'], ['Matriks kompetensi tidak diperbarui', '7.2'], ['Evaluasi efektivitas pelatihan belum dilakukan', '7.2']],
  Purchasing: [['Evaluasi pemasok triwulan belum dilakukan', '8.4.1'], ['PO tidak mencantumkan persyaratan mutu', '8.4.3']],
};

function buildAudits() {
  const r = rng('audits');
  const audits = [];
  const findings = [];
  let fn = 0;
  for (let i = 0; i < 48; i++) {
    const bulan = r.weighted(MONTHS.map((m, j) => [m, j < 4 ? 0.8 : 1 + (j - 4) * 0.06]));
    const tanggal = r.dateIn(bulan);
    const jenis = r.weighted([[AUDIT_TYPES[0], 4], [AUDIT_TYPES[1], 3], [AUDIT_TYPES[2], 3], [AUDIT_TYPES[3], 1.5], [AUDIT_TYPES[4], 1], [AUDIT_TYPES[5], 0.5]]);
    const area = jenis === 'Audit Pemasok' ? 'Purchasing' : r.pick(AREAS.slice(0, 8));
    const daysAgo = Math.round((new Date(TODAY) - new Date(tanggal)) / 86400000);
    const status = daysAgo > 12 ? 'Selesai' : r.weighted([['Selesai', 2], ['Dalam Proses', 3]]);
    audits.push({ bulan, tanggal, jenis, area, status, auditor: r.pick(AUDITORS) });
  }
  audits.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  // Audit terjadwal ke depan (belum ada skor).
  for (let i = 0; i < 6; i++) {
    const tanggal = addDays(TODAY, r.int(3, 40));
    audits.push({ bulan: monthOf(tanggal), tanggal, jenis: r.pick(AUDIT_TYPES.slice(0, 3)), area: r.pick(AREAS.slice(0, 8)), status: 'Terjadwal', auditor: r.pick(AUDITORS) });
  }
  const rows = audits.map((a, i) => {
    const id = `AUD-2026-${pad(i + 1)}`;
    let count = 0;
    if (a.status !== 'Terjadwal') {
      count = r.weighted([[0, 2], [1, 4], [2, 3], [3, 1]]);
      const opts = FINDING_TEXT[a.area];
      for (const [deskripsi, klausul] of r.shuffle(opts).slice(0, count)) {
        fn += 1;
        const kategori = r.weighted([['Major', 8], ['Minor', 45], ['Observasi', 30], ['OFI', 17]]);
        const prioritas = kategori === 'Major' ? 'High' : kategori === 'Minor' ? r.weighted([['High', 1], ['Medium', 3]]) : r.weighted([['Medium', 1], ['Low', 3]]);
        const age = Math.round((new Date(TODAY) - new Date(a.tanggal)) / 86400000);
        const status = age > 75 ? 'Tertutup' : age > 25 ? r.weighted([['Tertutup', 7], ['Dalam Proses', 2], ['Terbuka', 0.5]]) : r.weighted([['Terbuka', 2], ['Dalam Proses', 3], ['Tertutup', 1]]);
        const deadline = addDays(a.tanggal, kategori === 'Major' ? 14 : 30);
        findings.push({
          id: `FND-${pad(fn)}`,
          auditId: id,
          area: a.area,
          jenisAudit: a.jenis,
          deskripsi,
          klausul,
          kategori,
          prioritas,
          status,
          pic: r.pick(PEOPLE.slice(0, 30)),
          auditor: a.auditor,
          tanggal: a.tanggal,
          bulan: a.bulan,
          deadline,
          terlambat: status !== 'Tertutup' && deadline < TODAY ? 'Ya' : 'Tidak',
        });
      }
    }
    return {
      id,
      jenis: a.jenis,
      area: a.area,
      auditor: a.auditor,
      auditee: `Supervisor ${a.area}`,
      tanggal: a.tanggal,
      bulan: a.bulan,
      status: a.status,
      skor: a.status === 'Selesai' ? r.int(78, 97) : null,
      jumlahTemuan: count,
      checklist: a.status === 'Terjadwal' ? 0 : a.status === 'Dalam Proses' ? r.int(40, 85) : 100,
      metode: r.weighted([['Tablet (offline)', 3], ['Mobile App', 2], ['Web', 1]]),
    };
  });
  return { audits: rows, findings };
}

const built = buildAudits();
export const audits = built.audits;
export const findings = built.findings;

// ─── Feedback pelanggan real-time ──────────────────────────────────────────
export const CUSTOMERS = [
  'Nordline Apparel (EU)', 'Kazuo Retail Japan', 'Westbay Outfitters (US)', 'Southern Cross Uniform', 'PT Mode Kita Retail',
  'CV Busana Prima', 'Toko Bersama Online', 'PT Cahaya Indah Garment', 'PT Global Tekno Workwear', 'Sinar Abadi Distribusi',
];
const COMMENTS = {
  5: ['Kualitas jahitan sangat rapi, pengiriman tepat waktu.', 'Produk sesuai spesifikasi, packing sangat baik.', 'Respon tim merchandising cepat dan jelas.', 'Warna konsisten antar lot, terima kasih.', 'Sampel disetujui di percobaan pertama.'],
  4: ['Secara umum baik, label perlu dicek ulang.', 'Kualitas bagus, dokumen pengiriman sedikit terlambat.', 'Pengiriman sesuai jadwal, kemasan cukup baik.', 'Produk bagus, mohon update status order lebih sering.'],
  3: ['Ada keterlambatan pengiriman 2 hari.', 'Beberapa ukuran di luar toleransi tipis.', 'Benang sisa masih ditemukan di beberapa pcs.'],
  2: ['Ditemukan noda pada 1 karton, mohon perbaikan.', 'Warna tidak konsisten antar lot.', 'Care label tidak sesuai komposisi.'],
  1: ['Produk ada jahitan lepas, mohon segera diganti.', 'Pengiriman terlambat 1 minggu tanpa pemberitahuan.'],
};
const FB_CATEGORY = {
  5: ['Kualitas Produk', 'Pengiriman', 'Komunikasi'], 4: ['Dokumen & Label', 'Pengiriman', 'Komunikasi'],
  3: ['Pengiriman', 'Kualitas Produk'], 2: ['Kualitas Produk', 'Dokumen & Label'], 1: ['Kualitas Produk', 'Pengiriman'],
};

function buildFeedback() {
  const r = rng('feedback');
  const rows = [];
  for (let i = 0; i < 156; i++) {
    const bulan = r.weighted(LAST6.map((m, j) => [m, 1 + j * 0.15]));
    const rating = r.weighted([[5, 68], [4, 20], [3, 7], [2, 3], [1, 2]]);
    const tanggal = r.dateIn(bulan);
    const age = Math.round((new Date(TODAY) - new Date(tanggal)) / 86400000);
    rows.push({
      tanggal,
      bulan,
      pelanggan: r.weighted(CUSTOMERS.map((c, j) => [c, 10 - j])),
      rating,
      sentimen: rating >= 4 ? 'Positif' : rating === 3 ? 'Netral' : 'Negatif',
      tipe: rating >= 4 ? r.weighted([['Pujian', 3], ['Saran', 1]]) : rating === 3 ? 'Saran' : 'Komplain',
      kategori: r.pick(FB_CATEGORY[rating]),
      kanal: r.weighted([['Mobile App', 4], ['Portal Buyer', 3], ['Email', 2], ['WhatsApp', 2], ['Survey', 1]]),
      komentar: r.pick(COMMENTS[rating]),
      style: `ST-${r.int(2401, 2499)}`,
      status: age <= 3 ? 'Baru' : rating <= 3 && age <= 20 ? 'Ditindaklanjuti' : 'Selesai',
      pic: r.pick(['Fajar Hidayat', 'Gita Lestari', 'Kartika Putri', 'Nanda Saputra']),
    });
  }
  rows.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return rows.map((x, i) => ({ id: `FB-${pad(rows.length - i, 4)}`, ...x }));
}

export const feedback = buildFeedback();
