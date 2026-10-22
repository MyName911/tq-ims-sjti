// Fondasi data dummy: perusahaan studi kasus, kalender, orang, departemen,
// dan generator acak ber-seed. Seed tetap membuat data identik di server dan
// browser, jadi angka di grafik selalu sama dengan isi tabel detailnya.

export const COMPANY = {
  name: 'PT Sinar Busana Nusantara',
  short: 'SBN',
  industry: 'Garment Manufacturing',
  tagline: 'Export Quality Apparel',
  location: 'Majalengka, Jawa Barat',
  products: 'Kemeja, celana, dan outerwear untuk pasar ekspor',
  employees: 1284,
};

export const CONSULTANT = {
  name: 'Total Quality Indonesia',
  short: 'TQ',
};

export const DEMO_USER = { name: 'Rina Kartika', role: 'Management Representative (QMR)' };

// Data berjalan Januari-Oktober 2026; "hari ini" dikunci agar demo selalu konsisten.
export const TODAY = '2026-10-22';
export const YEAR = 2026;
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const MONTH_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const MONTHS = Array.from({ length: 10 }, (_, i) => `${YEAR}-${String(i + 1).padStart(2, '0')}`);
export const LAST6 = MONTHS.slice(-6);

export const monthLabel = (ym) => {
  if (!ym) return '-';
  const [y, m] = ym.split('-');
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`;
};
export const monthShort = (ym) => MONTH_NAMES[Number(ym.split('-')[1]) - 1];

export const DEPARTMENTS = [
  'Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Warehouse', 'PPIC',
  'Maintenance', 'Merchandising', 'Purchasing', 'HR & GA', 'IT', 'Finance', 'QMR',
];
export const PRODUCTION_AREAS = ['Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Warehouse', 'Maintenance', 'PPIC', 'HR & GA'];

export const PEOPLE = [
  'Andi Pratama', 'Budi Santoso', 'Citra Dewi', 'Dedi Kurniawan', 'Eka Sari', 'Fajar Hidayat', 'Gita Lestari',
  'Hendra Wijaya', 'Indah Permata', 'Joko Susilo', 'Kartika Putri', 'Lukman Hakim', 'Maya Sari', 'Nanda Saputra',
  'Oki Firmansyah', 'Putri Ayu', 'Rahmat Hidayat', 'Siti Rahma', 'Teguh Prasetyo', 'Umi Kalsum', 'Vina Oktaviani',
  'Wahyu Nugroho', 'Yusuf Maulana', 'Zahra Amelia', 'Agus Setiawan', 'Bayu Aji', 'Dewi Anggraini', 'Eko Prabowo',
  'Fitri Handayani', 'Gilang Ramadhan', 'Hana Pertiwi', 'Irfan Maulana', 'Jihan Safitri', 'Krisna Adi', 'Lia Amalia',
  'Mira Kusuma', 'Nurul Hidayah', 'Oktavia Ramadani', 'Prasetyo Utomo', 'Qori Aulia', 'Rizki Fauzan', 'Sri Wahyuni',
  'Tono Sugiarto', 'Ujang Supriatna', 'Vera Novita', 'Wulan Sari', 'Yanti Susanti', 'Zainal Arifin', 'Asep Saepudin',
  'Cecep Rohman', 'Dadang Kusnadi', 'Euis Komariah', 'Iis Rosmiati', 'Neneng Hasanah', 'Ratna Juwita', 'Tatang Sutisna',
  'Yayan Suryana', 'Enok Nurhayati', 'Ade Irawan', 'Rina Marlina', 'Dian Purnama', 'Heri Gunawan', 'Lina Marliana',
  'Nining Suryani', 'Robi Hermawan', 'Sinta Maharani', 'Taufik Rahman', 'Uci Sanusi', 'Wawan Setiawan', 'Yogi Pratama',
];

// ─── RNG ber-seed (mulberry32) ─────────────────────────────────────────────
export function rng(seed) {
  let a = typeof seed === 'string' ? [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761) >>> 0, 1779033703) : seed;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min, max) => Math.floor(next() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(next() * arr.length)];
  // Pilihan berbobot: weighted([['A', 3], ['B', 1]]).
  const weighted = (pairs) => {
    const total = pairs.reduce((s, [, w]) => s + w, 0);
    let r = next() * total;
    for (const [v, w] of pairs) { if ((r -= w) < 0) return v; }
    return pairs[pairs.length - 1][0];
  };
  const shuffle = (arr) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const round = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;
  // Tanggal acak di bulan tertentu (dibatasi TODAY).
  const dateIn = (ym, maxDay = 28) => {
    const [y, m] = ym.split('-').map(Number);
    let day = int(1, maxDay);
    const s = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (s > TODAY) day = Math.max(1, Number(TODAY.slice(8)) - int(0, 10));
    return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  return { next, int, pick, weighted, shuffle, round, dateIn };
}

// ─── Utilitas tanggal & angka ──────────────────────────────────────────────
export const addDays = (iso, days) => {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000);
export const monthOf = (iso) => iso.slice(0, 7);

export const fmtDate = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${Number(d)} ${MONTH_NAMES[Number(m) - 1]} ${y}`;
};
export const fmtNum = (n, d = 0) => (n == null || Number.isNaN(n) ? '-' : Number(n).toLocaleString('id-ID', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const fmtPct = (n, d = 1) => (n == null ? '-' : `${fmtNum(n, d)}%`);
export const pct = (part, total, d = 1) => (total ? Math.round((part / total) * 100 * 10 ** d) / 10 ** d : 0);

export const countBy = (rows, key) => rows.reduce((acc, r) => {
  const k = typeof key === 'function' ? key(r) : r[key];
  acc[k] = (acc[k] ?? 0) + 1;
  return acc;
}, {});

export const sumBy = (rows, key) => rows.reduce((s, r) => s + (typeof key === 'function' ? key(r) : r[key] ?? 0), 0);
export const avgBy = (rows, key) => (rows.length ? sumBy(rows, key) / rows.length : 0);
export const pad = (n, w = 3) => String(n).padStart(w, '0');
