// Data dummy: Kompetensi (Klausul 7.2), kesadaran (7.3), dan pengetahuan organisasi (7.1.6).
import { rng, PEOPLE, LAST6, MONTHS, TODAY, addDays, pad, daysBetween } from './core';

export const SKILLS = ['Teknis Garmen', 'Mutu & Inspeksi', 'K3 & 5S', 'Digital', 'Leadership', 'Problem Solving'];
export const SKILL_SHORT = { 'Teknis Garmen': 'Teknis', 'Mutu & Inspeksi': 'Mutu', 'K3 & 5S': 'K3/5S', Digital: 'Digital', Leadership: 'Leader', 'Problem Solving': 'Problem Solving' };

export const LEVELS = [
  { level: 5, label: 'Level 5, Sangat Baik', color: '#1f7f4c' },
  { level: 4, label: 'Level 4, Baik', color: '#4fb47b' },
  { level: 3, label: 'Level 3, Cukup', color: '#d4a73a' },
  { level: 2, label: 'Level 2, Kurang', color: '#d08a4a' },
  { level: 1, label: 'Level 1, Sangat Kurang', color: '#c2453d' },
];

// [departemen, jumlah, [jabatan, bobot, golongan]]
const STRUCTURE = [
  ['Sewing', 30, [['Operator Sewing', 6, 'op'], ['Line Leader Sewing', 3, 'lead'], ['Supervisor Sewing', 1, 'spv'], ['Manager Produksi', 0.2, 'mgr']]],
  ['Cutting', 12, [['Operator Cutting', 5, 'op'], ['Spreader & Marker', 2, 'op'], ['Supervisor Cutting', 1, 'spv']]],
  ['Finishing', 12, [['Operator Finishing', 5, 'op'], ['Leader Packing', 2, 'lead'], ['Supervisor Finishing', 1, 'spv']]],
  ['Quality Control', 16, [['QC Inline Inspector', 5, 'op'], ['QC Final Inspector', 4, 'op'], ['QC Supervisor', 1, 'spv'], ['QA Manager', 0.3, 'mgr']]],
  ['Warehouse', 10, [['Staff Gudang', 5, 'op'], ['Admin Gudang', 2, 'staff'], ['Supervisor Gudang', 1, 'spv']]],
  ['PPIC', 6, [['PPIC Planner', 3, 'staff'], ['Supervisor PPIC', 1, 'spv']]],
  ['Maintenance', 10, [['Mekanik Mesin Jahit', 5, 'op'], ['Teknisi Utilitas', 2, 'op'], ['Maintenance Engineer', 1, 'spv']]],
  ['Merchandising', 8, [['Merchandiser', 4, 'staff'], ['Senior Merchandiser', 1, 'spv'], ['Sample Room Staff', 2, 'op']]],
  ['Purchasing', 5, [['Purchasing Staff', 3, 'staff'], ['Purchasing Supervisor', 1, 'spv']]],
  ['HR & GA', 6, [['HR Staff', 3, 'staff'], ['GA Staff', 2, 'staff'], ['HR Manager', 0.4, 'mgr']]],
  ['IT', 3, [['IT Support', 2, 'staff'], ['IT Supervisor', 1, 'spv']]],
  ['Finance', 4, [['Finance Staff', 3, 'staff'], ['Finance Manager', 0.5, 'mgr']]],
  ['QMR', 2, [['Document Controller', 1, 'staff'], ['Management Representative', 1, 'mgr']]],
];

// Level minimum per golongan jabatan, urutan sesuai SKILLS.
export const TARGETS = {
  op: [3, 3, 3, 2, 2, 2],
  lead: [3, 3, 3, 3, 3, 3],
  staff: [3, 3, 3, 3, 2, 3],
  spv: [4, 3, 3, 3, 4, 4],
  mgr: [4, 4, 3, 3, 4, 4],
};
// Peluang di bawah target per skill, Digital & Leadership paling sering kurang.
const GAP_P = [0.03, 0.03, 0.02, 0.15, 0.09, 0.1];

const EXTRA_NAMES = [
  'Ayu Lestari', 'Dimas Saputra', 'Elsa Fitriani', 'Farhan Akbar', 'Galih Permana', 'Hesti Purwanti', 'Ilham Fadillah',
  'Jamal Abdillah', 'Kiki Amalia', 'Lutfi Hakim', 'Mega Puspita', 'Nia Ramadhani', 'Opik Taufik', 'Popon Rosita',
  'Rudi Hartono', 'Sela Agustina', 'Tari Wulandari', 'Usep Hidayat', 'Wina Kurnia', 'Yudi Firmansyah', 'Aldi Nugraha',
  'Bella Safitri', 'Cahya Purnama', 'Desi Ratnasari', 'Erwin Saputra', 'Fina Rahayu', 'Gugun Gunawan', 'Hilda Yuliani',
  'Iwan Setiadi', 'Juju Juariah', 'Kokom Komalasari', 'Lilis Suryani', 'Mamat Rahmat', 'Nandang Sutrisna', 'Odah Saodah',
  'Pepen Supendi', 'Rosi Rosdiana', 'Santi Oktaviani', 'Tini Kartini', 'Ucu Supriatna', 'Wati Susilawati', 'Yoyoh Rokayah',
  'Acep Sopandi', 'Bambang Irawan', 'Cucu Cahyati', 'Dodi Suhendar', 'Entin Kartini', 'Farida Hanum', 'Gani Ramdani',
  'Haris Munandar', 'Imas Masitoh', 'Jajang Nurjaman', 'Komar Sudrajat', 'Leni Marlina', 'Mumuh Muhidin',
];

function buildEmployees() {
  const r = rng('employees');
  const names = r.shuffle([...PEOPLE, ...EXTRA_NAMES]);
  let n = 0;
  const rows = [];
  for (const [dept, count, roles] of STRUCTURE) {
    // Pastikan setiap jabatan pimpinan terisi satu orang terlebih dahulu.
    const fixed = roles.filter(([, w]) => w <= 1).map((x) => x);
    const pool = roles.filter(([, w]) => w > 1);
    for (let i = 0; i < count; i++) {
      const [jabatan, , gol] = i < fixed.length ? fixed[i] : r.weighted(pool.map((x) => [x, x[1]]));
      const target = TARGETS[gol];
      const skills = target.map((t, si) => {
        const roll = r.next();
        if (roll < GAP_P[si] * 0.12) return Math.max(1, t - 2);
        if (roll < GAP_P[si]) return Math.max(1, t - 1);
        return Math.min(5, t + r.weighted([[0, 50], [1, 38], [2, 12]]));
      });
      const avg = skills.reduce((a, b) => a + b, 0) / skills.length;
      const gaps = skills.map((v, si) => v < target[si]);
      // Level keseluruhan dibandingkan dengan standar jabatan, bukan nilai mentah.
      const ratio = skills.reduce((s, v, si) => s + v / target[si], 0) / skills.length;
      const gapCount = gaps.filter(Boolean).length;
      const overall = gapCount === 0 ? (ratio >= 1.3 ? 5 : ratio >= 1.12 ? 4 : 3)
        : gapCount === 1 ? (ratio >= 1.1 ? 3 : 2) : ratio >= 1 ? 2 : 1;
      n += 1;
      const masuk = addDays(TODAY, -r.int(120, 4200));
      rows.push({
        id: `EMP-${pad(n, 4)}`,
        nik: `SBN${String(1000 + n * 7)}`,
        nama: names[(n - 1) % names.length],
        jabatan,
        golongan: { op: 'Operator', lead: 'Leader', staff: 'Staff', spv: 'Supervisor', mgr: 'Manager' }[gol],
        departemen: dept,
        tglMasuk: masuk,
        masaKerja: Math.round(daysBetween(masuk, TODAY) / 365 * 10) / 10,
        skills,
        targets: target,
        rataRata: Math.round(avg * 10) / 10,
        levelKeseluruhan: overall,
        jumlahGap: gapCount,
        skillGap: SKILLS.filter((_, si) => gaps[si]).join(', ') || '-',
        status: gaps.some(Boolean) ? 'Perlu Pengembangan' : 'Kompeten',
      });
    }
  }
  return rows;
}

export const employees = buildEmployees();

// Satu baris per kompetensi per karyawan; dihitung ulang saat data karyawan berubah.
export const scoresOf = (emps) => emps.flatMap((e) => SKILLS.map((skill, si) => ({
  id: `${e.id}-S${si + 1}`,
  karyawan: e.nama,
  empId: e.id,
  departemen: e.departemen,
  jabatan: e.jabatan,
  golongan: e.golongan,
  skill,
  level: e.skills[si],
  target: e.targets[si],
  selisih: e.skills[si] - e.targets[si],
  status: e.skills[si] < e.targets[si] ? 'Gap' : 'Kompeten',
})));

export const skillScores = scoresOf(employees);

// [program, skill, metode, jam]
export const PROGRAMS = [
  ['Digital Transformation (Basic)', 'Digital', 'E-Learning', 8],
  ['Microsoft Excel untuk Produksi', 'Digital', 'E-Learning', 6],
  ['Leadership Development for Line Leader', 'Leadership', 'Classroom', 16],
  ['Problem Solving & Decision Making (8D)', 'Problem Solving', 'Classroom', 12],
  ['Root Cause Analysis & 5 Why', 'Problem Solving', 'E-Learning', 6],
  ['Teknik Jahit Operasi Kritis', 'Teknis Garmen', 'OJT', 24],
  ['Membaca Tech Pack & Spesifikasi Buyer', 'Teknis Garmen', 'E-Learning', 4],
  ['Inspeksi AQL 2.5', 'Mutu & Inspeksi', 'Classroom', 8],
  ['Awareness ISO 9001:2026', 'Mutu & Inspeksi', 'E-Learning', 3],
  ['Internal Auditor ISO 9001:2026', 'Mutu & Inspeksi', 'Classroom', 16],
  ['K3 Dasar & Penggunaan APD', 'K3 & 5S', 'E-Learning', 4],
  ['Implementasi 5S di Lantai Produksi', 'K3 & 5S', 'OJT', 6],
];

function buildTrainings() {
  const r = rng('trainings');
  const rows = [];
  let n = 0;
  const add = (e, program, status, bulan) => {
    const [nama, skill, metode, jam] = program;
    n += 1;
    rows.push({
      id: `TRN-${pad(n, 4)}`,
      karyawan: e.nama,
      empId: e.id,
      departemen: e.departemen,
      program: nama,
      skill,
      metode,
      jam,
      bulan,
      tanggal: r.dateIn(bulan),
      status,
      nilai: status === 'Selesai' ? r.int(72, 98) : null,
      progress: status === 'Selesai' ? 100 : status === 'Berjalan' ? r.int(20, 85) : 0,
    });
  };
  // Pelatihan rutin sepanjang tahun.
  for (let i = 0; i < 170; i++) {
    const e = r.pick(employees);
    const bulan = r.pick(MONTHS);
    add(e, r.pick(PROGRAMS), bulan === MONTHS[9] ? r.weighted([['Berjalan', 2], ['Selesai', 1]]) : 'Selesai', bulan);
  }
  // Rekomendasi untuk karyawan yang masih punya gap: terjadwal / berjalan.
  for (const e of employees.filter((x) => x.status === 'Perlu Pengembangan')) {
    for (const [si, skill] of SKILLS.entries()) {
      if (e.skills[si] >= e.targets[si]) continue;
      const opts = PROGRAMS.filter((p) => p[1] === skill);
      add(e, r.pick(opts), r.weighted([['Terjadwal', 3], ['Berjalan', 2]]), r.weighted([[LAST6[5], 2], ['2026-11', 3], ['2026-12', 2]]));
    }
  }
  return rows;
}

export const trainings = buildTrainings();

// [sertifikasi, penerbit, masa berlaku (tahun), golongan yang relevan]
export const CERTS = [
  ['ISO 9001:2026 Internal Auditor', 'Total Quality Indonesia', 3, ['Supervisor', 'Manager', 'Staff']],
  ['Ahli K3 Umum', 'Kemnaker RI', 3, ['Supervisor', 'Manager']],
  ['Operator Forklift (SIO)', 'Kemnaker RI', 5, ['Operator']],
  ['P3K / First Aid', 'PMI', 3, ['Leader', 'Operator', 'Supervisor']],
  ['Lean Six Sigma Yellow Belt', 'Total Quality Indonesia', 3, ['Supervisor', 'Staff', 'Manager']],
  ['AQL Inspector', 'Lembaga Pelatihan Mutu', 2, ['Operator', 'Supervisor']],
  ['Teknisi Mesin Jahit Industri', 'BLK Bandung', 3, ['Operator']],
  ['Petugas Peran Kebakaran', 'Damkar Kab. Majalengka', 2, ['Leader', 'Operator', 'Staff']],
];

function buildCertifications() {
  const r = rng('certs');
  const rows = [];
  let n = 0;
  for (const e of employees) {
    const options = CERTS.filter((c) => c[3].includes(e.golongan));
    const count = r.weighted([[0, 4], [1, 4], [2, 2]]);
    for (const c of r.shuffle(options).slice(0, count)) {
      n += 1;
      const terbit = addDays(TODAY, -r.int(60, 365 * c[2] + 120));
      const kadaluarsa = addDays(terbit, 365 * c[2]);
      const sisa = daysBetween(TODAY, kadaluarsa);
      rows.push({
        id: `CRT-${pad(n, 4)}`,
        karyawan: e.nama,
        empId: e.id,
        departemen: e.departemen,
        jabatan: e.jabatan,
        sertifikasi: c[0],
        penerbit: c[1],
        terbit,
        kadaluarsa,
        sisaHari: sisa,
        status: sisa < 0 ? 'Kadaluarsa' : sisa <= 90 ? 'Akan Kadaluarsa' : 'Aktif',
      });
    }
  }
  return rows;
}

export const certifications = buildCertifications();
