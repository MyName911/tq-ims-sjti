// Modul G, Ketidaksesuaian dan tindakan korektif (Klausul 10.2).
import { rng, PEOPLE, MONTHS, TODAY, addDays, pad, monthOf } from './core';
import { findings, feedback } from './audit';

export const CAPA_STATUSES = ['Open', 'On Progress', 'Overdue', 'Closed'];
export const CAPA_STATUS_COLORS = { Open: '#3b5bdb', 'On Progress': '#d4a73a', Overdue: '#c2453d', Closed: '#2f8a5f' };
export const CAPA_CATEGORIES = ['Quality', 'Process', 'Equipment', 'Supplier', 'Safety', 'Environment'];
export const ROOT_CAUSES = ['Man (Human Error)', 'Material', 'Machine', 'Method', 'Measurement', 'Environment'];

export const CAPA_STEPS = [
  'Identifikasi Masalah', 'Analisis Akar Masalah', 'Penetapan Tindakan', 'Implementasi', 'Verifikasi Efektivitas', 'Penutupan CAPA', 'Pencegahan Berulang',
];

// [masalah, kategori, departemen, akar penyebab (6M), detail akar penyebab, tindakan]
const PROBLEMS = [
  ['Jahitan lepas pada side seam style ST-2417', 'Quality', 'Sewing', 'Man (Human Error)', 'Operator baru belum menguasai operasi kritis', 'Retraining operasi kritis & sertifikasi operator'],
  ['Setting mesin overlock tidak stabil', 'Process', 'Sewing', 'Method', 'SOP setting mesin belum diperbarui', 'Revisi SOP & visual setting di mesin'],
  ['Mesin cutting sering downtime', 'Equipment', 'Maintenance', 'Machine', 'Preventive maintenance tidak rutin', 'Jadwal PM digital & checklist harian'],
  ['Kain tidak sesuai spesifikasi gramasi', 'Supplier', 'Purchasing', 'Material', 'Pemasok tidak melakukan uji gramasi', 'Wajib COA per lot & incoming test'],
  ['Shading antar panel dalam 1 garmen', 'Quality', 'Cutting', 'Material', 'Roll kain tidak dikelompokkan per shade', 'Shade band wajib sebelum spreading'],
  ['Pekerja terpeleset di area finishing', 'Safety', 'Finishing', 'Environment', 'Lantai basah dari area steam', 'Pasang drainase & rambu lantai licin'],
  ['Ukuran chest di luar toleransi', 'Quality', 'Sewing', 'Measurement', 'Pita ukur tidak terkalibrasi', 'Kalibrasi seluruh pita ukur & verifikasi mingguan'],
  ['Label care tidak sesuai komposisi', 'Process', 'Quality Control', 'Method', 'Tidak ada checklist verifikasi label', 'Checklist label per style & approval QC'],
  ['Limbah cair finishing melebihi baku mutu', 'Environment', 'Finishing', 'Method', 'Dosis bahan kimia tidak terkontrol', 'Dosing pump & logbook pemakaian kimia'],
  ['Keterlambatan kedatangan aksesoris', 'Supplier', 'Purchasing', 'Material', 'Lead time pemasok tidak dipantau', 'Monitoring PO mingguan & penalti keterlambatan'],
  ['Noda minyak pada garmen jadi', 'Quality', 'Sewing', 'Machine', 'Kebocoran oli mesin jahit', 'Penggantian seal & lap mesin tiap awal shift'],
  ['Jarum patah tidak tercatat', 'Safety', 'Sewing', 'Man (Human Error)', 'Operator tidak memahami prosedur kontrol jarum', 'Sosialisasi ulang & audit kartu jarum harian'],
  ['Selisih stok bahan baku saat opname', 'Process', 'Warehouse', 'Method', 'FIFO dan pencatatan tidak konsisten', 'Barcode bin location & cycle count'],
  ['Komplain warna tidak konsisten dari buyer', 'Quality', 'Finishing', 'Material', 'Lot pewarnaan berbeda tercampur', 'Segregasi lot sampai packing'],
  ['Metal detector tidak diverifikasi', 'Safety', 'Finishing', 'Measurement', 'Belum ada test piece di setiap shift', 'Verifikasi test piece awal shift'],
  ['Efisiensi line 4 di bawah target', 'Process', 'Sewing', 'Method', 'Line balancing tidak dihitung ulang saat ganti style', 'Line balancing digital per style'],
  ['Pengiriman terlambat ke Kazuo Retail', 'Process', 'PPIC', 'Method', 'Kapasitas tidak dicek saat menerima order', 'Capacity check otomatis di tahap order review'],
  ['Thread end tersisa pada produk jadi', 'Quality', 'Finishing', 'Man (Human Error)', 'Trimming tidak dicek 100%', 'Pos pengecekan trimming sebelum pressing'],
];

function buildCapa() {
  const r = rng('capa');
  const sources = [];
  // CAPA dari temuan audit kategori Major / Minor.
  for (const f of findings.filter((x) => x.kategori === 'Major' || x.kategori === 'Minor')) {
    if (r.next() < 0.8) sources.push({ sumber: 'Audit Internal', ref: f.id, tanggal: addDays(f.tanggal, r.int(0, 3)) });
  }
  // CAPA dari komplain pelanggan.
  for (const fb of feedback.filter((x) => x.tipe === 'Komplain')) sources.push({ sumber: 'Komplain Pelanggan', ref: fb.id, tanggal: addDays(fb.tanggal, 1) });
  // CAPA dari inspeksi produk, insiden, dan pemasok.
  for (let i = 0; i < 22; i++) {
    const bulan = r.pick(MONTHS.slice(4));
    sources.push({ sumber: r.weighted([['Inspeksi Produk', 4], ['Insiden K3', 1], ['Evaluasi Pemasok', 2], ['Risiko', 1]]), ref: null, tanggal: r.dateIn(bulan) });
  }
  sources.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  return sources.filter((s) => s.tanggal <= TODAY).map((s, i) => {
    const p = r.pick(PROBLEMS);
    const age = Math.round((new Date(TODAY) - new Date(s.tanggal)) / 86400000);
    const target = addDays(s.tanggal, r.weighted([[14, 2], [21, 3], [30, 3], [45, 1]]));
    let status;
    if (age > 70) status = r.weighted([['Closed', 12], ['Overdue', 1]]);
    else if (age > 30) status = r.weighted([['Closed', 5], ['On Progress', 3], ['Overdue', 1.5]]);
    else status = r.weighted([['Open', 3], ['On Progress', 4], ['Closed', 1]]);
    if ((status === 'On Progress' || status === 'Open') && target < TODAY && r.next() < 0.6) status = 'Overdue';
    const progress = status === 'Closed' ? 100 : status === 'Open' ? r.int(5, 25) : status === 'Overdue' ? r.int(30, 80) : r.int(35, 90);
    const tahap = status === 'Closed' ? 7 : status === 'Open' ? r.int(1, 2) : Math.min(5, 2 + Math.floor(progress / 30));
    const sumber = s.sumber === 'Inspeksi Produk' && p[1] === 'Safety' ? 'Insiden K3' : s.sumber;
    return {
      id: `CAPA-2026-${pad(i + 1)}`,
      tanggal: s.tanggal,
      bulan: monthOf(s.tanggal),
      sumber,
      ref: s.ref,
      kategori: p[1],
      masalah: p[0],
      akarPenyebab: p[3],
      detailAkar: p[4],
      tindakan: p[5],
      departemen: p[2],
      pic: r.pick(PEOPLE.slice(0, 32)),
      target,
      tglSelesai: status === 'Closed' ? addDays(s.tanggal, r.int(7, Math.max(8, Math.min(age, 50)))) : null,
      status,
      progress,
      tahap: CAPA_STEPS[tahap - 1],
      tahapKe: tahap,
      efektivitas: status === 'Closed' ? r.weighted([['Efektif', 9], ['Perlu Tindak Lanjut', 1]]) : 'Belum Diverifikasi',
      jenisTindakan: r.weighted([['Korektif', 3], ['Preventif', 1]]),
    };
  });
}

export const capas = buildCapa();
