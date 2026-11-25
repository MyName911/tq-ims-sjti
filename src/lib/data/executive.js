import { COMPANY } from './core';

export const PERSPECTIVES = [
  { key: 'Pelanggan', label: 'Pelanggan' },
  { key: 'Produksi', label: 'Produksi' },
  { key: 'Mutu', label: 'Mutu' },
  { key: 'Keuangan', label: 'Keuangan' },
  { key: 'Penunjang', label: 'Penunjang' },
];

const targets = [
  ['MKT-01', 1, 'Marketing', 'Keuangan', 'Omset penjualan', 100, '%', false, 'Kontrak penjualan dan laporan produksi folding'],
  ['MKT-02', 1, 'Marketing', 'Pelanggan', 'Kepuasan pelanggan', 90, '%', false, 'FOM/MKT/010 dan STD/MKT/001'],
  ['MKT-03', 1, 'Marketing', 'Pelanggan', 'Pemenuhan order produksi Weaving', 95, '%', false, 'Rencana penjualan'],
  ['MKT-04', 1, 'Marketing', 'Pelanggan', 'Pemenuhan order produksi Finish', 95, '%', false, 'Rencana penjualan'],
  ['PPC-01', 2, 'PPC', 'Produksi', 'Realisasi produksi pick terhadap kapasitas bulanan', 100, '%', false, 'Hasil produksi folding'],
  ['PPC-02', 2, 'PPC', 'Produksi', 'Realisasi produksi meter terhadap kapasitas bulanan', 100, '%', false, 'Hasil produksi folding'],
  ['PPC-03', 2, 'PPC', 'Mutu', 'Ketidaksesuaian kualitas bahan baku benang', 0, 'kasus', true, 'Laporan hasil pengujian benang'],
  ['PPC-04', 2, 'PPC', 'Produksi', 'Ketepatan pemakaian bahan baku benang', 100, '%', false, 'Laporan progres produksi'],
  ['PPC-05', 2, 'PPC', 'Produksi', 'Realisasi mesin jalan terhadap rencana', 98, '%', false, 'Keseimbangan produksi tenun dan persiapan'],
  ['PPC-06', 2, 'PPC', 'Produksi', 'WIP terhadap output produksi', 35, '%', true, 'Hasil produksi folding dan stok opname'],
  ['PPC-07', 2, 'PPC', 'Produksi', 'Aval terhadap pemakaian benang', 1.2, '%', true, 'Rekapitulasi aval'],
  ['PPC-08', 2, 'PPC', 'Produksi', 'Pemenuhan kain grey untuk kapasitas Finishing', 100, '%', false, 'Evaluasi produksi finishing'],
  ['WV1-01', 8, 'Loom Weaving I', 'Produksi', 'Efisiensi produksi Loom Weaving I', 87, '%', false, 'Rekap hasil produksi'],
  ['WV1-02', 8, 'Loom Weaving I', 'Mutu', 'Roll kecil akibat proses produksi', 0.17, '%', true, 'Rekap hasil produksi'],
  ['WV1-03', 8, 'Loom Weaving I', 'Mutu', 'Barang second akibat proses produksi', 0.15, '%', true, 'Rekap hasil produksi'],
  ['FNS-01', 10, 'Finishing', 'Produksi', 'Produksi kain finish sesuai kapasitas mesin', 100, '%', false, 'Laporan hasil produksi folding finishing per grade'],
  ['FNS-05', 10, 'Finishing', 'Mutu', 'Washing shrinkage arah pakan', 4, '%', true, 'Formulir pengujian kain finish'],
  ['FNS-06', 10, 'Finishing', 'Mutu', 'Washing shrinkage arah lusi', 10, '%', true, 'Formulir pengujian kain finish'],
  ['FNS-07', 10, 'Finishing', 'Pelanggan', 'Komplain pelanggan hasil produksi Finishing', 3, 'kasus', true, 'Jumlah komplain per bulan'],
  ['QCW-01', 13, 'QC Weaving', 'Produksi', 'Pemenuhan folding terhadap rencana produksi grey', 100, '%', false, 'Hasil produksi folding'],
  ['QCW-02', 13, 'QC Weaving', 'Produksi', 'Pemenuhan folding terhadap rencana produksi finish', 100, '%', false, 'Hasil produksi Finishing'],
  ['QCW-03', 13, 'QC Weaving', 'Pelanggan', 'Komplain dan retur kain grey', 0, 'kasus', true, 'Surat Penanganan Keluhan dan Return dari Customer'],
  ['QCW-04', 13, 'QC Weaving', 'Pelanggan', 'Komplain dan retur kain finish', 0, 'kasus', true, 'Surat Penanganan Keluhan dan Return dari Customer'],
  ['QCW-05', 13, 'QC Weaving', 'Mutu', 'Variasi hasil produksi folding terhadap counter', 2, '%', true, 'Perbandingan hasil counter dan folding'],
];

export const kpis = targets.map(([kode, halamanSumber, departemen, perspektif, kpi, target, satuan, down, bukti]) => ({
  id: 'STI-SM-' + kode, kode, kpi, departemen, perspektif, target, satuan,
  arah: down ? 'Lebih rendah lebih baik' : 'Lebih tinggi lebih baik',
  frekuensi: kode === 'MKT-02' ? 'Semesteran' : 'Bulanan', periode: 'Januari–Desember 2026',
  status: 'Belum Ada Realisasi', bukti, dokumenId: 'STI-SRC-006', halamanSumber,
}));

export function achievementOf(real, target, dir) {
  if (!Number.isFinite(real) || !Number.isFinite(target)) return null;
  if (target === 0) return dir === 'down' && real > 0 ? 0 : 100;
  if (dir === 'down' && real === 0) return 100;
  return Math.round((dir === 'down' ? target / real : real / target) * 1000) / 10;
}

export const kpiStatus = (cap) => cap == null ? 'Belum Ada Realisasi' : cap >= 100 ? 'Tercapai' : cap >= 90 ? 'Perlu Perhatian' : 'Tidak Tercapai';
export const scoreLabel = (v) => (v >= 96 ? 'Sangat Baik' : v >= 88 ? 'Baik' : v >= 80 ? 'Cukup' : 'Kurang');
export const kpiMonthly = [];
export const policies = [{
  id: 'STI-KM-001', nama: 'Kebijakan Mutu STI', kategori: 'Mutu', versi: 'Rev. 03 Quality Manual',
  status: 'Tercantum di Manual', pemilik: 'Direksi', ringkasan: COMPANY.qualityPolicy,
  dokumenId: 'STI-SRC-001', halamanSumber: 8,
}];
export const readReceipts = [];
