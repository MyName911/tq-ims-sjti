// Data dummy: Kepemimpinan & kebijakan (Klausul 5), pemantauan kinerja (9.1) dan tinjauan manajemen (9.3).
import { rng, MONTHS, PEOPLE, COMPANY, addDays, pad } from './core';
import { employees } from './skill';

export const PERSPECTIVES = [
  { key: 'Financial', label: 'Financial', sub: 'Keuangan', color: '#3b5bdb' },
  { key: 'Customer', label: 'Customer', sub: 'Pelanggan', color: '#d4a73a' },
  { key: 'Internal Process', label: 'Process', sub: 'Proses Internal', color: '#8fa2e6' },
  { key: 'People', label: 'People', sub: 'SDM & K3', color: '#5f6f86' },
  { key: 'Innovation & Growth', label: 'Innovation & Growth', sub: 'Inovasi', color: '#b9c3d6' },
];

// [kode, nama, perspektif, satuan, target, arah, faktor awal, faktor akhir, PIC dept, desimal]
// arah 'up' = makin tinggi makin baik; 'down' = makin rendah makin baik.
const KPI_DEFS = [
  ['FIN-01', 'Pendapatan penjualan', 'Financial', 'Rp Miliar', 18.5, 'up', 0.9, 1.04, 'Finance', 1],
  ['FIN-02', 'Gross profit margin', 'Financial', '%', 18, 'up', 0.92, 1.02, 'Finance', 1],
  ['FIN-03', 'Cost of poor quality (COPQ)', 'Financial', '% penjualan', 1.5, 'down', 1.35, 1.06, 'Quality Control', 2],
  ['FIN-04', 'Biaya lembur terhadap upah', 'Financial', '%', 6, 'down', 1.25, 1.08, 'HR & GA', 1],
  ['FIN-05', 'Piutang tertagih tepat waktu', 'Financial', '%', 95, 'up', 0.95, 1.01, 'Finance', 1],
  ['CUS-01', 'Customer satisfaction index', 'Customer', '%', 90, 'up', 0.96, 1.02, 'Merchandising', 1],
  ['CUS-02', 'On-time delivery (OTD)', 'Customer', '%', 95, 'up', 0.9, 0.95, 'PPIC', 1],
  ['CUS-03', 'Komplain pelanggan', 'Customer', 'kasus/bulan', 3, 'down', 1.8, 0.9, 'Quality Control', 0],
  ['CUS-04', 'Claim / return rate', 'Customer', '%', 0.5, 'down', 1.4, 0.9, 'Quality Control', 2],
  ['CUS-05', 'Repeat order buyer', 'Customer', '%', 85, 'up', 0.97, 1.04, 'Merchandising', 1],
  ['PRC-01', 'Right first time (RFT) sewing', 'Internal Process', '%', 92, 'up', 0.93, 0.975, 'Sewing', 1],
  ['PRC-02', 'Defect per hundred units (DHU)', 'Internal Process', 'DHU', 3.5, 'down', 1.3, 0.92, 'Quality Control', 2],
  ['PRC-03', 'Efisiensi line sewing', 'Internal Process', '%', 65, 'up', 0.84, 0.91, 'Sewing', 1],
  ['PRC-04', 'Fabric utilization', 'Internal Process', '%', 88, 'up', 0.97, 1.01, 'Cutting', 1],
  ['PRC-05', 'Downtime mesin', 'Internal Process', 'jam/bulan', 40, 'down', 1.4, 0.85, 'Maintenance', 0],
  ['PRC-06', 'Lead time produksi', 'Internal Process', 'hari', 35, 'down', 1.15, 0.97, 'PPIC', 0],
  ['PPL-01', 'Turnover operator', 'People', '%/bulan', 2.5, 'down', 1.6, 1.2, 'HR & GA', 2],
  ['PPL-02', 'Jam pelatihan per karyawan', 'People', 'jam/bulan', 2, 'up', 0.7, 0.92, 'HR & GA', 1],
  ['PPL-03', 'Tingkat kehadiran', 'People', '%', 97, 'up', 0.985, 1.003, 'HR & GA', 1],
  ['PPL-04', 'Lost time injury (LTI)', 'People', 'kasus', 0, 'down', 2, 0, 'HR & GA', 0],
  ['INV-01', 'Ide kaizen diimplementasikan', 'Innovation & Growth', 'ide/bulan', 10, 'up', 0.5, 0.8, 'QMR', 0],
  ['INV-02', 'Proses terdigitalisasi', 'Innovation & Growth', '%', 70, 'up', 0.55, 0.84, 'IT', 0],
  ['INV-03', 'Style baru dikembangkan', 'Innovation & Growth', 'style/bulan', 6, 'up', 0.7, 1.15, 'Merchandising', 0],
  ['INV-04', 'Konsumsi energi per pcs', 'Innovation & Growth', 'kWh/pcs', 0.42, 'down', 1.15, 1.04, 'Maintenance', 2],
];

export const achievementOf = (real, target, dir) => {
  if (dir === 'down') {
    if (target === 0) return real <= 0 ? 100 : Math.max(0, 100 - real * 25);
    return Math.round(Math.min(130, (target / Math.max(real, 0.0001)) * 100) * 10) / 10;
  }
  return Math.round(Math.min(130, (real / target) * 100) * 10) / 10;
};
export const kpiStatus = (cap) => (cap >= 100 ? 'Tercapai' : cap >= 90 ? 'Perlu Perhatian' : 'Tidak Tercapai');

function buildKpis() {
  const r = rng('kpi');
  const monthly = [];
  const kpis = KPI_DEFS.map(([kode, nama, perspektif, satuan, target, arah, f0, f1, dept, dec]) => {
    const values = MONTHS.map((m, i) => {
      const t = i / (MONTHS.length - 1);
      const base = target === 0 ? (1 - t) * f0 : target * (f0 + (f1 - f0) * t);
      const noise = target === 0 ? 0 : target * (r.next() - 0.5) * 0.04;
      let v = base + noise;
      if (target === 0) v = t > 0.55 ? 0 : r.weighted([[0, 3], [1, 2]]);
      return Math.max(0, Math.round(v * 10 ** dec) / 10 ** dec);
    });
    values.forEach((v, i) => {
      const cap = achievementOf(v, target, arah);
      monthly.push({
        id: `${kode}-${MONTHS[i]}`,
        kode,
        kpi: nama,
        perspektif,
        satuan,
        bulan: MONTHS[i],
        target,
        realisasi: v,
        capaian: cap,
        status: kpiStatus(cap),
        departemen: dept,
      });
    });
    const last = values[values.length - 1];
    const prev = values[values.length - 2];
    const capaian = achievementOf(last, target, arah);
    const better = arah === 'up' ? last > prev : last < prev;
    return {
      id: kode,
      kode,
      kpi: nama,
      perspektif,
      satuan,
      arah: arah === 'up' ? 'Lebih tinggi lebih baik' : 'Lebih rendah lebih baik',
      target,
      realisasi: last,
      capaian,
      status: kpiStatus(capaian),
      tren: last === prev ? 'Stabil' : better ? 'Membaik' : 'Menurun',
      departemen: dept,
      pic: r.pick(PEOPLE.slice(0, 20)),
      frekuensi: 'Bulanan',
      values,
      decimals: dec,
    };
  });
  return { kpis, monthly };
}

const built = buildKpis();
export const kpis = built.kpis;
export const kpiMonthly = built.monthly;

export const perspectiveScore = (key) => {
  const list = kpis.filter((k) => k.perspektif === key);
  const avg = list.reduce((s, k) => s + Math.min(100, k.capaian), 0) / list.length;
  return Math.round(avg);
};
export const scoreLabel = (v) => (v >= 96 ? 'Sangat Baik' : v >= 88 ? 'Baik' : v >= 80 ? 'Cukup' : 'Kurang');

// ─── Kebijakan digital ─────────────────────────────────────────────────────
// [nama, kategori, versi, status, berlaku (yyyy-mm-dd), pemilik]
const POLICY_DEFS = [
  ['Kebijakan Mutu & ISO 9001:2026', 'Manajemen Mutu', 'v3.0', 'Aktif', '2026-01-05', 'QMR'],
  ['Kebijakan K3 & Keselamatan Kerja', 'K3', 'v2.1', 'Aktif', '2026-02-15', 'HR & GA'],
  ['Kebijakan Anti Penyuapan', 'Tata Kelola', 'v1.2', 'Aktif', '2026-01-20', 'Finance'],
  ['Kebijakan Privasi & Perlindungan Data', 'IT & Keamanan', 'v1.0', 'Aktif', '2026-03-10', 'IT'],
  ['Kebijakan Lingkungan Hidup', 'Lingkungan', 'v1.3', 'Aktif', '2026-02-05', 'QMR'],
  ['Kebijakan SDM & Remunerasi', 'SDM', 'v2.1', 'Revisi', '2025-04-01', 'HR & GA'],
  ['Kebijakan Pengadaan Barang & Jasa', 'Pengadaan', 'v1.0', 'Aktif', '2026-01-12', 'Purchasing'],
  ['Kebijakan Pengelolaan Risiko', 'Manajemen Risiko', 'v1.2', 'Aktif', '2026-03-18', 'QMR'],
  ['Kode Etik & Social Compliance', 'Tata Kelola', 'v2.0', 'Aktif', '2026-02-01', 'HR & GA'],
  ['Kebijakan Anti Pekerja Anak & Kerja Paksa', 'Social Compliance', 'v1.1', 'Aktif', '2026-02-01', 'HR & GA'],
  ['Kebijakan Bahan Kimia (MRSL)', 'Lingkungan', 'v1.0', 'Aktif', '2026-05-20', 'Finishing'],
  ['Kebijakan Mekanisme Pengaduan (Grievance)', 'Tata Kelola', 'v1.0', 'Aktif', '2026-06-01', 'HR & GA'],
  ['Kebijakan Keberlanjutan & Jejak Karbon', 'Lingkungan', 'v0.9', 'Draft', '2026-11-01', 'QMR'],
  ['Kebijakan Penggunaan Perangkat Pribadi', 'IT & Keamanan', 'v1.0', 'Kadaluarsa', '2023-09-01', 'IT'],
];

function buildPolicies() {
  const r = rng('policies');
  const receipts = [];
  let n = 0;
  const policies = POLICY_DEFS.map(([nama, kategori, versi, status, berlaku, pemilik], i) => {
    const id = `KBJ-${pad(i + 1)}`;
    const distributed = status === 'Aktif' || status === 'Revisi';
    if (distributed) {
      for (const e of employees) {
        const metode = r.weighted([['Email', 65], ['In-App Notification', 20], ['WhatsApp', 10], ['Cetak (Manual)', 5]]);
        const st = r.weighted([['Sudah Dibaca', 955], ['Belum Dibaca', 37], ['Gagal Terkirim', 8]]);
        const kirim = berlaku > '2026-01-01' ? berlaku : '2026-01-05';
        n += 1;
        receipts.push({
          id: `RR-${pad(n, 5)}`,
          kebijakanId: id,
          kebijakan: nama,
          penerima: e.nama,
          departemen: e.departemen,
          jabatan: e.jabatan,
          metode,
          status: st,
          tglKirim: kirim,
          tglBaca: st === 'Sudah Dibaca' ? addDays(kirim, r.weighted([[0, 5], [1, 3], [2, 2], [5, 1]])) : null,
          tandaTangan: st === 'Sudah Dibaca' ? 'Ya' : 'Belum',
        });
      }
    }
    const mine = receipts.filter((x) => x.kebijakanId === id);
    const dibaca = mine.filter((x) => x.status === 'Sudah Dibaca').length;
    return {
      id,
      nama,
      kategori,
      versi,
      status,
      tglBerlaku: berlaku,
      tglReview: addDays(berlaku, 365),
      pemilik,
      penyetuju: 'Direktur Utama',
      penerima: mine.length,
      dibaca,
      persenBaca: mine.length ? Math.round((dibaca / mine.length) * 1000) / 10 : 0,
      eSign: status === 'Aktif' ? 'Ditandatangani' : status === 'Revisi' ? 'Menunggu Persetujuan' : status === 'Draft' ? 'Belum Diajukan' : 'Kadaluarsa',
      ringkasan: `${nama} menetapkan komitmen, ruang lingkup, dan tanggung jawab ${pemilik} terkait ${kategori.toLowerCase()} di ${COMPANY.name}.`,
    };
  });
  return { policies, receipts };
}

const pol = buildPolicies();
export const policies = pol.policies;
export const readReceipts = pol.receipts;

export const SIGN_FLOW = [
  { step: 'Dibuat', who: 'Rina Kartika (QMR)', at: '2026-10-14 10:15' },
  { step: 'Diajukan', who: 'Manager HR & GA', at: '2026-10-14 11:20' },
  { step: 'Disetujui', who: 'Direktur Operasional', at: '2026-10-15 13:45' },
  { step: 'Aktif', who: 'Direktur Utama', at: '2026-10-15 14:10' },
];

export const STRATEGY_MAP = {
  vision: 'Menjadi produsen garmen ekspor pilihan buyer global yang unggul, efisien, dan berkelanjutan',
  rows: [
    { key: 'Financial', items: ['Pertumbuhan pendapatan ekspor', 'Efisiensi biaya produksi', 'Profitabilitas berkelanjutan'] },
    { key: 'Customer', items: ['Kepuasan & loyalitas buyer', 'Pengiriman tepat waktu', 'Kualitas tanpa komplain'] },
    { key: 'Internal Process', items: ['Right first time di setiap line', 'Digitalisasi proses produksi', 'Rantai pasok tangguh'] },
    { key: 'People', items: ['Kompetensi operator multi-skill', 'Budaya K3 & 5S', 'Kepemimpinan lini depan'] },
  ],
};

