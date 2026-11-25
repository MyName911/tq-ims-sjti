export const COMPANY = {
  name: 'PT Safarijunie Textindo Industry',
  short: 'STI',
  products: 'Proses tekstil dan tenun untuk menghasilkan kain greige dan kain finish',
  vision: 'Menjadi perusahaan tekstil terkemuka di pasar nasional',
  mission: 'Menjaga kestabilan mutu produk dan meningkatkan mutu pelayanan demi kepuasan pelanggan',
  qualityPolicy: 'Karyawan Berkualitas dan Kerja Berkualitas, Menghasilkan Produk Berkualitas.',
  standard: 'ISO 9001:2015',
};

export const CONSULTANT = { name: 'Total Quality Indonesia' };
export const WORKSPACE_ROLE = { name: 'Management Representative', role: 'PT Safarijunie Textindo Industry' };

export const TODAY = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Jakarta' }).format(new Date());
export const YEAR = 2026;
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTH_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const MONTHS = Array.from({ length: 12 }, (_, i) => YEAR + '-' + String(i + 1).padStart(2, '0'));
export const LAST6 = MONTHS.slice(-6);

export const DEPARTMENTS = [
  'Direksi', 'MR', 'DCC', 'Audit Mutu Internal', 'Marketing', 'PPC', 'Pembelian', 'FAT',
  'HRD', 'GA', 'HRD P2K3', 'HRD Legal', 'Persiapan', 'Loom', 'Loom Weaving I', 'Loom Weaving II',
  'Finishing', 'QC In Proses', 'QC Weaving', 'PPQC', 'Laborat', 'Gudang',
  'Maintenance', 'Maintenance Finishing', 'Utility', 'MIS', 'ACC FIN TAX',
];

export const PROCESS_GROUPS = [
  ['Manajemen', 'Perencanaan dan evaluasi pengembangan bisnis, kebijakan dan sasaran mutu, serta tinjauan manajemen.'],
  ['Proses utama', 'Marketing menangani order STI dan makloon. PPC merencanakan produksi dan kebutuhan bahan. Pembelian dan Gudang menyediakan material. Persiapan, Loom, dan Finishing menghasilkan kain. QC In Proses dan QC Weaving memeriksa mutu selama proses dan pada hasil akhir.'],
  ['Proses penunjang', 'Maintenance, Utility, MIS, HRD, GA, Legal, P2K3, dan FAT mendukung kelancaran produksi. Laborat menguji bahan dan kain.'],
  ['Pemantauan dan perbaikan', 'Audit Mutu Internal, pengukuran kepuasan pelanggan, tindakan korektif dan analisis risiko, serta tinjauan manajemen.'],
];

export const monthLabel = (ym) => {
  if (!ym) return '-';
  const [y, m] = ym.split('-');
  return MONTH_NAMES[Number(m) - 1] + ' ' + y;
};
export const monthShort = (ym) => MONTH_NAMES[Number(ym.split('-')[1]) - 1];

export const addDays = (iso, days) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
export const monthOf = (iso) => iso?.slice(0, 7);

export const fmtDate = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return Number(d) + ' ' + MONTH_NAMES[Number(m) - 1] + ' ' + y;
};
export const fmtNum = (n, d = 0) => (n == null || Number.isNaN(n) ? '-' : Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const fmtPct = (n, d = 1) => (n == null ? '-' : fmtNum(n, d) + '%');
export const pct = (part, total, d = 1) => (total ? Math.round((part / total) * 100 * 10 ** d) / 10 ** d : 0);

export const countBy = (rows, key) => rows.reduce((acc, r) => {
  const k = typeof key === 'function' ? key(r) : r[key];
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});

export const sumBy = (rows, key) => rows.reduce((s, r) => s + (typeof key === 'function' ? key(r) : r[key] ?? 0), 0);
export const avgBy = (rows, key) => (rows.length ? sumBy(rows, key) / rows.length : null);
export const pad = (n, w = 3) => String(n).padStart(w, '0');
