// Registry seluruh data detail. Setiap grafik dan kartu di dashboard menautkan
// ke /data/<key>?<field>=<nilai>; halaman detail memfilter baris di sini dengan
// aturan yang sama, sehingga angka di grafik selalu cocok dengan isi tabelnya.
import { pestelIssues, stakeholders, stakeholderComms } from './data/pestel';
import { kpis, kpiMonthly, policies, readReceipts } from './data/executive';
import { risks, okrs, PRIORITY_RISK_LEVELS } from './data/risk';
import { employees, skillScores, scoresOf, trainings, certifications, knowledge, SKILLS } from './data/skill';
import { documents } from './data/documents';
import { audits, findings, feedback } from './data/audit';
import { capas } from './data/capa';
import { avgBy, countBy, fmtNum, pct } from './data/core';

const count = (rows, key, value) => rows.filter((r) => r[key] === value).length;

export const DATASETS = {
  // ─── A. Konteks dan pihak berkepentingan ─────────────────────────────────────────────
  pestel: {
    title: 'Konteks Organisasi',
    singular: 'Isu',
    module: 'pestel',
    description: 'Isu internal dan eksternal, pihak terkait, persyaratan, dan bentuk pemenuhan menurut FOM/MR/001.',
    rows: pestelIssues,
    titleKey: 'isu',
    searchKeys: ['id', 'isu', 'risikoPeluang', 'pihak', 'harapan', 'tindakan', 'departemen'],
    facets: ['jenis', 'departemen', 'status'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'isu', label: 'Isu', type: 'title', sub: 'risikoPeluang' },
      { key: 'jenis', label: 'Jenis isu', type: 'badge' },
      { key: 'departemen', label: 'Bagian' },
      { key: 'pihak', label: 'Pihak terkait' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'periode', label: 'Periode' },
      { key: 'risikoPeluang', label: 'Risiko atau peluang' },
      { key: 'harapan', label: 'Persyaratan dan harapan', full: true },
      { key: 'tindakan', label: 'Bentuk pemenuhan', full: true },
      { key: 'pic', label: 'PIC' },
    ],
    summary: (rows) => [
      { label: 'Total isu', value: rows.length },
      { label: 'Internal', value: count(rows, 'jenis', 'Internal'), tone: 'blue' },
      { label: 'Eksternal', value: count(rows, 'jenis', 'Eksternal'), tone: 'lilac' },
      { label: 'Bagian', value: new Set(rows.map((r) => r.departemen).filter(Boolean)).size },
    ],
  },
  stakeholders: {
    title: 'Pihak Berkepentingan',
    singular: 'Pihak berkepentingan',
    module: 'pestel',
    description: 'Pihak berkepentingan beserta kebutuhan, harapan, dan tingkat pengaruhnya (Klausul 4.2).',
    rows: stakeholders,
    titleKey: 'nama',
    searchKeys: ['id', 'nama', 'kategori', 'kebutuhan', 'pic'],
    facets: ['tipe', 'kategori', 'kuadran', 'status', 'prioritas'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'nama', label: 'Stakeholder', type: 'title', sub: 'kategori' },
      { key: 'tipe', label: 'Tipe', type: 'badge' },
      { key: 'pengaruh', secondary: true, label: 'Pengaruh', type: 'num' },
      { key: 'kepentingan', secondary: true, label: 'Kepentingan', type: 'num' },
      { key: 'kuadran', label: 'Strategi', type: 'badge' },
      { key: 'status', label: 'Status komunikasi', type: 'badge' },
      { key: 'kepuasan', secondary: true, label: 'Kepuasan', type: 'num', decimals: 1 },
      { key: 'kontakTerakhir', label: 'Kontak terakhir', type: 'date' },
    ],
    extra: [
      { key: 'kategori', label: 'Kategori' },
      { key: 'prioritas', label: 'Prioritas', type: 'badge' },
      { key: 'frekuensi', label: 'Frekuensi komunikasi' },
      { key: 'pic', label: 'PIC' },
      { key: 'kebutuhan', label: 'Kebutuhan & harapan', full: true },
    ],
    related: (r) => [{ label: 'Riwayat komunikasi', dataset: 'stakeholder-comms', filters: { stakeholder: r.nama } }],
    summary: (rows) => [
      { label: 'Total stakeholder', value: rows.length },
      { label: 'Internal', value: count(rows, 'tipe', 'Internal'), tone: 'blue' },
      { label: 'Eksternal', value: count(rows, 'tipe', 'Eksternal'), tone: 'lilac' },
      { label: 'Rata-rata kepuasan', value: rows.some((r) => Number.isFinite(r.kepuasan)) ? fmtNum(avgBy(rows.filter((r) => Number.isFinite(r.kepuasan)), 'kepuasan'), 1) + ' / 5' : '—', tone: 'sun' },
    ],
  },
  'stakeholder-comms': {
    title: 'Riwayat Komunikasi Pihak Berkepentingan',
    singular: 'Komunikasi',
    module: 'pestel',
    description: 'Log interaksi dengan pihak berkepentingan: meeting, email, kunjungan, dan survey.',
    rows: stakeholderComms,
    titleKey: 'topik',
    searchKeys: ['id', 'stakeholder', 'topik', 'pic'],
    facets: ['media', 'hasil', 'kategori', 'tipe'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'stakeholder', label: 'Stakeholder', type: 'title', sub: 'kategori' },
      { key: 'topik', label: 'Topik' },
      { key: 'media', label: 'Media', type: 'badge' },
      { key: 'pic', label: 'PIC' },
      { key: 'hasil', label: 'Hasil', type: 'badge' },
    ],
    summary: (rows) => [
      { label: 'Total interaksi', value: rows.length },
      { label: 'Perlu tindak lanjut', value: count(rows, 'hasil', 'Perlu Tindak Lanjut'), tone: 'sun' },
      { label: 'Stakeholder terlibat', value: new Set(rows.map((r) => r.stakeholder)).size, tone: 'blue' },
    ],
  },

  // ─── B. Executive & Policy ───────────────────────────────────────────────
  kpi: {
    title: 'Sasaran Mutu STI',
    singular: 'Sasaran mutu',
    module: 'executive',
    description: 'Sasaran per bagian menurut FOM/MR/003. Capaian diisi melalui realisasi bulanan.',
    rows: kpis,
    titleKey: 'kpi',
    searchKeys: ['kode', 'kpi', 'departemen', 'pic'],
    facets: ['perspektif', 'status', 'tren', 'departemen'],
    columns: [
      { key: 'kode', label: 'Kode', type: 'code' },
      { key: 'kpi', label: 'Sasaran mutu', type: 'title', sub: 'satuan' },
      { key: 'perspektif', label: 'Perspektif', type: 'badge' },
      { key: 'target', label: 'Target', type: 'num', decimals: 'auto' },
      { key: 'realisasi', label: 'Realisasi', type: 'num', decimals: 'auto' },
      { key: 'capaian', label: 'Capaian', type: 'pct' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'bulanRealisasi', secondary: true, label: 'Bulan realisasi', type: 'month' },
      { key: 'pic', secondary: true, label: 'PIC' },
    ],
    extra: [
      { key: 'arah', label: 'Polaritas' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'frekuensi', label: 'Frekuensi' },
      { key: 'periode', label: 'Periode' },
      { key: 'bukti', label: 'Sumber bukti pengukuran', full: true },
    ],
    related: (r) => [{ label: 'Realisasi bulanan KPI ini', dataset: 'kpi-monthly', filters: { kode: r.kode } }],
    summary: (rows) => [
      { label: 'Jumlah sasaran', value: rows.length },
      { label: 'Tercapai', value: count(rows, 'status', 'Tercapai'), tone: 'mint' },
      { label: 'Belum ada realisasi', value: count(rows, 'status', 'Belum Ada Realisasi'), tone: 'sun' },
      { label: 'Tidak tercapai', value: count(rows, 'status', 'Tidak Tercapai'), tone: 'red' },
    ],
  },
  'kpi-monthly': {
    title: 'Realisasi KPI Bulanan',
    singular: 'Realisasi KPI',
    module: 'executive',
    description: 'Realisasi sasaran mutu per bulan berdasarkan data yang dicatat.',
    rows: kpiMonthly,
    titleKey: 'kpi',
    searchKeys: ['kode', 'kpi'],
    facets: ['perspektif', 'status', 'kpi'],
    monthKey: 'bulan',
    columns: [
      { key: 'bulan', label: 'Bulan', type: 'month' },
      { key: 'kode', label: 'Kode', type: 'code' },
      { key: 'kpi', label: 'Sasaran mutu', type: 'title', sub: 'satuan' },
      { key: 'perspektif', secondary: true, label: 'Perspektif', type: 'badge' },
      { key: 'target', label: 'Target', type: 'num', decimals: 'auto' },
      { key: 'realisasi', label: 'Realisasi', type: 'num', decimals: 'auto' },
      { key: 'capaian', label: 'Capaian', type: 'pct' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    summary: (rows) => [
      { label: 'Data poin', value: rows.length },
      { label: 'Rata-rata capaian', value: rows.length ? fmtNum(avgBy(rows, (r) => Math.min(r.capaian, 100)), 1) + '%' : '—', tone: 'blue' },
      { label: 'Tercapai', value: count(rows, 'status', 'Tercapai'), tone: 'mint' },
      { label: 'Di bawah target', value: count(rows, 'status', 'Tidak Tercapai') + count(rows, 'status', 'Perlu Perhatian'), tone: 'red' },
    ],
  },
  policies: {
    title: 'Kebijakan Perusahaan',
    singular: 'Kebijakan',
    module: 'executive',
    description: 'Daftar kebijakan terkendali beserta versi, status persetujuan, dan tingkat keterbacaan.',
    rows: policies,
    titleKey: 'nama',
    searchKeys: ['id', 'nama', 'kategori', 'pemilik'],
    facets: ['status', 'kategori', 'pemilik', 'eSign'],
    columns: [
      { key: 'id', label: 'No.', type: 'code' },
      { key: 'nama', label: 'Nama kebijakan', type: 'title', sub: 'kategori' },
      { key: 'versi', label: 'Versi' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'tglBerlaku', label: 'Tgl berlaku', type: 'date' },
      { key: 'persenBaca', label: 'Dibaca', type: 'progress' },
      { key: 'eSign', label: 'E-Signature', type: 'badge' },
    ],
    extra: [
      { key: 'pemilik', label: 'Pemilik proses' },
      { key: 'penyetuju', label: 'Penyetuju' },
      { key: 'tglReview', label: 'Tinjauan berikutnya', type: 'date' },
      { key: 'penerima', label: 'Jumlah penerima', type: 'num' },
      { key: 'dibaca', label: 'Sudah membaca', type: 'num' },
      { key: 'ringkasan', label: 'Ringkasan', full: true },
    ],
    related: (r) => [{ label: 'Read receipt kebijakan ini', dataset: 'read-receipts', filters: { kebijakanId: r.id } }],
    summary: (rows) => [
      { label: 'Kebijakan', value: rows.length },
      { label: 'Aktif', value: count(rows, 'status', 'Aktif'), tone: 'mint' },
      { label: 'Revisi / Draft', value: count(rows, 'status', 'Revisi') + count(rows, 'status', 'Draft'), tone: 'sun' },
      { label: 'Kadaluarsa', value: count(rows, 'status', 'Kadaluarsa'), tone: 'red' },
    ],
  },
  'read-receipts': {
    title: 'Distribusi & Read Receipt Kebijakan',
    singular: 'Read receipt',
    module: 'executive',
    description: 'Status pengiriman dan konfirmasi baca kebijakan per karyawan.',
    rows: readReceipts,
    titleKey: 'penerima',
    searchKeys: ['penerima', 'kebijakan', 'departemen'],
    facets: ['status', 'metode', 'kebijakan', 'departemen'],
    columns: [
      { key: 'penerima', label: 'Penerima', type: 'title', sub: 'jabatan' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'kebijakan', label: 'Kebijakan' },
      { key: 'metode', label: 'Metode', type: 'badge' },
      { key: 'tglKirim', secondary: true, label: 'Dikirim', type: 'date' },
      { key: 'tglBaca', label: 'Dibaca', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    summary: (rows) => [
      { label: 'Total penerima', value: fmtNum(rows.length) },
      { label: 'Tingkat baca', value: rows.length ? pct(count(rows, 'status', 'Sudah Dibaca'), rows.length) + '%' : '—', tone: 'mint' },
      { label: 'Belum dibaca', value: count(rows, 'status', 'Belum Dibaca'), tone: 'sun' },
      { label: 'Gagal terkirim', value: count(rows, 'status', 'Gagal Terkirim'), tone: 'red' },
    ],
  },

  // ─── C. Risiko, peluang, dan program kerja ───────────────────────────────────────────────────────
  risks: {
    title: 'Identifikasi Risiko dan Peluang',
    singular: 'Risiko / peluang',
    module: 'risk',
    description: 'Register FOM/MR/002. Skor awal dan akhir mengikuti A × B × C pada STD/MR/002.',
    rows: risks,
    titleKey: 'deskripsi',
    searchKeys: ['id', 'deskripsi', 'pengendalian', 'pic', 'departemen', 'dampakUraian'],
    facets: ['jenis', 'level', 'residualLevel', 'status', 'kategori', 'departemen', 'sumber'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'deskripsi', label: 'Isu atau aktivitas', type: 'title', sub: 'departemen' },
      { key: 'jenis', label: 'Jenis', type: 'badge' },
      { key: 'frekuensi', secondary: true, label: 'A · Frekuensi', type: 'num' },
      { key: 'kemungkinan', secondary: true, label: 'B · Potensi', type: 'num' },
      { key: 'dampak', secondary: true, label: 'C · Keparahan / keuntungan', type: 'num' },
      { key: 'skor', label: 'Skor awal', type: 'num' },
      { key: 'level', label: 'Tingkat awal', type: 'badge' },
      { key: 'residualLevel', label: 'Tingkat akhir', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'periode', label: 'Periode' },
      { key: 'departemen', label: 'Bagian' },
      { key: 'kategori', label: 'Kategori' },
      { key: 'sumber', label: 'Sumber identifikasi' },
      { key: 'diaturRegulasi', label: 'Diatur regulasi' },
      { key: 'residualFrekuensi', label: 'A · Frekuensi akhir', type: 'num' },
      { key: 'residualKemungkinan', label: 'B · Potensi akhir', type: 'num' },
      { key: 'residualDampak', label: 'C · Keparahan / keuntungan akhir', type: 'num' },
      { key: 'residualSkor', label: 'Skor akhir', type: 'num' },
      { key: 'pic', label: 'PIC' },
      { key: 'target', label: 'Target', type: 'date' },
      { key: 'dampakUraian', label: 'Risiko / peluang', full: true },
      { key: 'pengendalian', label: 'Pengendalian / rencana tindakan', full: true },
    ],
    related: (r) => (r.ref ? [{ label: 'Isu terkait', dataset: 'pestel', filters: { id: r.ref }, open: r.ref }] : []),
    summary: (rows) => [
      { label: 'Risiko tercatat', value: count(rows, 'jenis', 'Risiko') },
      { label: 'Peluang tercatat', value: count(rows, 'jenis', 'Peluang'), tone: 'lilac' },
      { label: 'Risiko berbahaya atau lebih (awal)', value: rows.filter((r) => r.jenis === 'Risiko' && PRIORITY_RISK_LEVELS.includes(r.level)).length, tone: 'red' },
      { label: 'Risiko berbahaya atau lebih (akhir)', value: rows.filter((r) => r.jenis === 'Risiko' && PRIORITY_RISK_LEVELS.includes(r.residualLevel)).length, tone: 'sun' },
    ],
  },
  okr: {
    title: 'Program Kerja',
    singular: 'Program kerja',
    module: 'risk',
    description: 'Rencana kerja per bagian, periode pelaksanaan, dan evaluasi menurut FOM/MR/004.',
    rows: okrs,
    titleKey: 'keyResult',
    searchKeys: ['id', 'objective', 'keyResult', 'pemilik'],
    facets: ['pemilik', 'periode', 'status'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'keyResult', label: 'Rencana kerja', type: 'title', sub: 'objective' },
      { key: 'pemilik', label: 'Bagian / penanggung jawab' },
      { key: 'periode', label: 'Periode' },
      { key: 'targetSumber', label: 'Target' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'objective', label: 'Sasaran mutu', full: true },
      { key: 'evaluasi', label: 'Evaluasi pelaksanaan', full: true },
      { key: 'progress', label: 'Progres', type: 'progress' },
    ],
    summary: (rows) => [
      { label: 'Program kerja', value: rows.length },
      { label: 'Bagian', value: new Set(rows.map((r) => r.pemilik).filter(Boolean)).size },
      { label: 'Sudah dievaluasi', value: rows.filter((r) => r.evaluasi).length },
    ],
  },

  // ─── D. Skill Matrix ─────────────────────────────────────────────────────
  knowledge: {
    title: 'Pengetahuan Organisasi',
    singular: 'Topik pengetahuan',
    module: 'skill',
    description: 'Register pengetahuan kerja tiap bagian menurut FOM/MR/005.',
    rows: knowledge,
    titleKey: 'topik',
    searchKeys: ['id', 'topik', 'departemen', 'penjelasan'],
    facets: ['departemen'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'topik', label: 'Topik', type: 'title' },
      { key: 'departemen', label: 'Bagian' },
      { key: 'penjelasan', label: 'Penjelasan' },
    ],
    summary: (rows) => [
      { label: 'Topik pengetahuan', value: rows.length },
      { label: 'Bagian', value: new Set(rows.map((r) => r.departemen)).size },
    ],
  },
  employees: {
    title: 'Matriks Keahlian Karyawan',
    singular: 'Karyawan',
    module: 'skill',
    description: `Profil kompetensi karyawan kunci terhadap standar jabatan pada ${SKILLS.length} kompetensi inti.`,
    rows: employees,
    titleKey: 'nama',
    searchKeys: ['id', 'nik', 'nama', 'jabatan', 'departemen'],
    facets: ['departemen', 'status', 'levelKeseluruhan', 'golongan'],
    columns: [
      { key: 'nama', label: 'Karyawan', type: 'title', sub: 'jabatan' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'skills', label: 'Teknis, Mutu, K3, Digital, Leader, PS', type: 'skills' },
      { key: 'rataRata', label: 'Rata-rata', type: 'num', decimals: 1, secondary: true },
      { key: 'levelKeseluruhan', label: 'Level', type: 'level' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'nik', label: 'NIK' },
      { key: 'golongan', label: 'Golongan' },
      { key: 'tglMasuk', label: 'Tanggal masuk', type: 'date' },
      { key: 'masaKerja', label: 'Masa kerja (tahun)', type: 'num', decimals: 1 },
      { key: 'skillGap', label: 'Kompetensi yang perlu dikembangkan', full: true },
    ],
    related: (r) => [
      { label: 'Detail nilai per kompetensi', dataset: 'skill-scores', filters: { empId: r.id } },
      { label: 'Riwayat & rencana pelatihan', dataset: 'trainings', filters: { empId: r.id } },
      { label: 'Sertifikasi', dataset: 'certifications', filters: { empId: r.id } },
    ],
    summary: (rows) => [
      { label: 'Karyawan', value: rows.length },
      { label: 'Kompeten', value: count(rows, 'status', 'Kompeten'), tone: 'mint' },
      { label: 'Perlu pengembangan', value: count(rows, 'status', 'Perlu Pengembangan'), tone: 'peach' },
      { label: 'Rata-rata nilai', value: fmtNum(avgBy(rows, 'rataRata'), 2), tone: 'blue' },
    ],
  },
  'skill-scores': {
    title: 'Nilai Kompetensi per Skill',
    singular: 'Nilai kompetensi',
    module: 'skill',
    description: 'Setiap baris adalah satu kompetensi satu karyawan, dibandingkan dengan level target jabatannya.',
    rows: skillScores,
    derive: { from: 'employees', build: scoresOf },
    titleKey: 'karyawan',
    searchKeys: ['karyawan', 'jabatan', 'skill', 'departemen'],
    facets: ['skill', 'status', 'level', 'departemen', 'golongan'],
    columns: [
      { key: 'karyawan', label: 'Karyawan', type: 'title', sub: 'jabatan' },
      { key: 'departemen', label: 'Departemen' },
      { key: 'skill', label: 'Kompetensi' },
      { key: 'level', label: 'Level', type: 'level' },
      { key: 'target', label: 'Target', type: 'level' },
      { key: 'selisih', label: 'Selisih', type: 'num', signed: true },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    related: (r) => [{ label: 'Profil karyawan', dataset: 'employees', filters: { id: r.empId }, open: r.empId }],
    summary: (rows) => [
      { label: 'Penilaian', value: rows.length },
      { label: 'Memenuhi target', value: count(rows, 'status', 'Kompeten'), tone: 'mint' },
      { label: 'Gap', value: count(rows, 'status', 'Gap'), tone: 'red' },
      { label: 'Rata-rata level', value: fmtNum(avgBy(rows, 'level'), 2), tone: 'blue' },
    ],
  },
  trainings: {
    title: 'Pelatihan & E-Learning',
    singular: 'Pelatihan',
    module: 'skill',
    description: 'Riwayat dan rencana pelatihan karyawan, termasuk modul e-learning dan on the job training.',
    rows: trainings,
    titleKey: 'program',
    searchKeys: ['id', 'karyawan', 'program', 'departemen'],
    facets: ['status', 'skill', 'metode', 'program', 'departemen'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', secondary: true, label: 'Kode', type: 'code' },
      { key: 'karyawan', label: 'Peserta', type: 'title', sub: 'departemen' },
      { key: 'program', label: 'Program' },
      { key: 'skill', label: 'Kompetensi', type: 'badge' },
      { key: 'metode', secondary: true, label: 'Metode', type: 'badge' },
      { key: 'jam', secondary: true, label: 'Jam', type: 'num' },
      { key: 'tanggal', label: 'Jadwal', type: 'date' },
      { key: 'progress', label: 'Progres', type: 'progress' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [{ key: 'nilai', label: 'Nilai post-test', type: 'num' }],
    related: (r) => [{ label: 'Profil peserta', dataset: 'employees', filters: { id: r.empId }, open: r.empId }],
    summary: (rows) => [
      { label: 'Pelatihan', value: rows.length },
      { label: 'Total jam', value: fmtNum(rows.reduce((s, r) => s + r.jam, 0)), tone: 'blue' },
      { label: 'Selesai', value: count(rows, 'status', 'Selesai'), tone: 'mint' },
      { label: 'Terjadwal / berjalan', value: count(rows, 'status', 'Terjadwal') + count(rows, 'status', 'Berjalan'), tone: 'sun' },
    ],
  },
  certifications: {
    title: 'Sertifikasi Karyawan',
    singular: 'Sertifikasi',
    module: 'skill',
    description: 'Sertifikat kompetensi beserta masa berlakunya; peringatan otomatis 90 hari sebelum kadaluarsa.',
    rows: certifications,
    titleKey: 'sertifikasi',
    searchKeys: ['id', 'karyawan', 'sertifikasi', 'penerbit'],
    facets: ['status', 'sertifikasi', 'departemen', 'penerbit'],
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'karyawan', label: 'Karyawan', type: 'title', sub: 'jabatan' },
      { key: 'sertifikasi', label: 'Sertifikasi', sub: 'penerbit' },
      { key: 'terbit', secondary: true, label: 'Terbit', type: 'date' },
      { key: 'kadaluarsa', label: 'Berlaku s.d.', type: 'date' },
      { key: 'sisaHari', label: 'Sisa hari', type: 'num' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    related: (r) => [{ label: 'Profil karyawan', dataset: 'employees', filters: { id: r.empId }, open: r.empId }],
    summary: (rows) => [
      { label: 'Sertifikat', value: rows.length },
      { label: 'Aktif', value: count(rows, 'status', 'Aktif'), tone: 'mint' },
      { label: 'Akan kadaluarsa', value: count(rows, 'status', 'Akan Kadaluarsa'), tone: 'sun' },
      { label: 'Kadaluarsa', value: count(rows, 'status', 'Kadaluarsa'), tone: 'red' },
    ],
  },

  // ─── E. E-Document ───────────────────────────────────────────────────────
  documents: {
    title: 'Master Dokumen',
    singular: 'Dokumen',
    module: 'edoc',
    description: 'Katalog dokumen PT Safarijunie Textindo dari folder DOK ISO STI.',
    rows: documents,
    titleKey: 'nama',
    searchKeys: ['id', 'nama', 'departemen', 'pemilik', 'nomorDokumen', 'sumber', 'salinan'],
    facets: ['folderSumber', 'kategori', 'departemen', 'format', 'status', 'akses'],
    monthKey: 'bulanTerbit',
    columns: [
      { key: 'id', label: 'ID katalog', type: 'code' },
      { key: 'nama', label: 'Nama dokumen', type: 'title', sub: 'departemen' },
      { key: 'kategori', label: 'Kategori', type: 'badge' },
      { key: 'format', label: 'Format' },
      { key: 'nomorDokumen', label: 'Nomor dokumen', secondary: true },
      { key: 'revisi', label: 'Revisi' },
      { key: 'tglTerbit', secondary: true, label: 'Tgl terbit', type: 'date' },
      { key: 'tglReview', secondary: true, label: 'Review berikutnya', type: 'date' },
      { key: 'akses', secondary: true, label: 'Akses', type: 'badge' },
      { key: 'dilihat', secondary: true, label: 'Dilihat', type: 'num' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'folderSumber', label: 'Folder sumber' },
      { key: 'sumber', label: 'Lokasi di folder sumber', full: true },
      { key: 'salinan', label: 'Lokasi salinan identik', full: true },
      { key: 'pemilik', label: 'Pemilik dokumen' },
      { key: 'klausul', label: 'Klausul ISO terkait' },
      { key: 'retensi', label: 'Masa retensi' },
      { key: 'sisaHariReview', label: 'Hari menuju review', type: 'num' },
      { key: 'disposisi', label: 'Disposisi', full: true },
    ],
    summary: (rows) => [
      { label: 'Dokumen', value: fmtNum(rows.length) },
      { label: 'Belum diverifikasi', value: count(rows, 'status', 'Belum Diverifikasi'), tone: 'blue' },
      { label: 'Aktif', value: count(rows, 'status', 'Aktif'), tone: 'mint' },
      { label: 'Kadaluarsa', value: count(rows, 'status', 'Kadaluarsa'), tone: 'red' },
    ],
  },

  // ─── F. E-Audit & Feedback ───────────────────────────────────────────────
  audits: {
    title: 'Daftar Audit Mutu Internal',
    singular: 'Audit',
    module: 'audit',
    description: 'Program, jadwal, pelaksanaan, dan laporan Audit Mutu Internal STI.',
    rows: audits,
    titleKey: 'jenis',
    searchKeys: ['id', 'jenis', 'area', 'auditor'],
    facets: ['status', 'jenis', 'area', 'auditor'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', label: 'No. audit', type: 'code' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'jenis', label: 'Jenis audit', type: 'title', sub: 'area' },
      { key: 'auditor', label: 'Auditor' },
      { key: 'checklist', secondary: true, label: 'Checklist', type: 'progress' },
      { key: 'jumlahTemuan', label: 'Temuan', type: 'num' },
      { key: 'skor', label: 'Skor', type: 'pct', decimals: 0 },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [{ key: 'auditee', label: 'Auditee' }, { key: 'metode', label: 'Metode pengisian' }],
    related: (r) => [{ label: 'Temuan dari audit ini', dataset: 'findings', filters: { auditId: r.id } }],
    summary: (rows) => [
      { label: 'Audit', value: rows.length },
      { label: 'Selesai', value: count(rows, 'status', 'Selesai'), tone: 'mint' },
      { label: 'Rata-rata skor', value: fmtNum(avgBy(rows.filter((r) => r.skor), 'skor'), 1) + '%', tone: 'blue' },
      { label: 'Total temuan', value: rows.reduce((s, r) => s + r.jumlahTemuan, 0), tone: 'peach' },
    ],
  },
  findings: {
    title: 'Temuan Audit',
    singular: 'Temuan',
    module: 'audit',
    description: 'Ketidaksesuaian, observasi, dan peluang perbaikan dari seluruh audit.',
    rows: findings,
    titleKey: 'deskripsi',
    searchKeys: ['id', 'deskripsi', 'area', 'pic', 'auditId'],
    facets: ['status', 'kategori', 'prioritas', 'area', 'klausul'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'deskripsi', label: 'Temuan', type: 'title', sub: 'area' },
      { key: 'kategori', label: 'Kategori', type: 'badge' },
      { key: 'klausul', secondary: true, label: 'Klausul' },
      { key: 'prioritas', label: 'Prioritas', type: 'badge' },
      { key: 'pic', secondary: true, label: 'PIC' },
      { key: 'deadline', label: 'Deadline', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [
      { key: 'auditId', label: 'No. audit' },
      { key: 'jenisAudit', label: 'Jenis audit' },
      { key: 'auditor', label: 'Auditor' },
      { key: 'tanggal', label: 'Tanggal audit', type: 'date' },
      { key: 'terlambat', label: 'Melewati deadline', type: 'badge' },
    ],
    related: (r) => [
      { label: 'Audit asal', dataset: 'audits', filters: { id: r.auditId }, open: r.auditId },
      { label: 'FTKAR untuk temuan ini', dataset: 'capa', filters: { ref: r.id } },
    ],
    summary: (rows) => [
      { label: 'Temuan', value: rows.length },
      { label: 'Tertutup', value: count(rows, 'status', 'Tertutup'), tone: 'mint' },
      { label: 'Dalam proses', value: count(rows, 'status', 'Dalam Proses'), tone: 'sun' },
      { label: 'Terbuka', value: count(rows, 'status', 'Terbuka'), tone: 'red' },
    ],
  },
  feedback: {
    title: 'Masukan Pelanggan',
    singular: 'Masukan pelanggan',
    module: 'audit',
    description: 'Survei kepuasan, keluhan, dan retur kain melalui kuesioner atau Surat Penanganan Keluhan dan Return (SPKR).',
    rows: feedback,
    titleKey: 'pelanggan',
    searchKeys: ['id', 'pelanggan', 'komentar', 'style'],
    facets: ['rating', 'tipe', 'sentimen', 'kategori', 'kanal', 'pelanggan', 'status'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', label: 'Kode', type: 'code' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'pelanggan', label: 'Pelanggan', type: 'title', sub: 'komentar' },
      { key: 'rating', label: 'Nilai survei', type: 'rating' },
      { key: 'tipe', label: 'Tipe', type: 'badge' },
      { key: 'kategori', secondary: true, label: 'Kategori' },
      { key: 'kanal', secondary: true, label: 'Kanal', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    extra: [{ key: 'style', label: 'Konstruksi / lot kain' }, { key: 'sentimen', label: 'Sentimen', type: 'badge' }, { key: 'pic', label: 'PIC' }],
    related: (r) => (r.tipe === 'Komplain' ? [{ label: 'FTKAR dari komplain ini', dataset: 'capa', filters: { ref: r.id } }] : []),
    summary: (rows) => [
      { label: 'Masukan pelanggan', value: rows.length },
      { label: 'Rata-rata nilai survei', value: rows.some((r) => Number.isFinite(r.rating)) ? fmtNum(avgBy(rows.filter((r) => Number.isFinite(r.rating)), 'rating'), 2) + ' / 5' : '—', tone: 'sun' },
      { label: 'Retur', value: count(rows, 'tipe', 'Retur'), tone: 'mint' },
      { label: 'Komplain', value: count(rows, 'tipe', 'Komplain'), tone: 'red' },
    ],
  },

  // ─── G. CAPA ─────────────────────────────────────────────────────────────
  capa: {
    title: 'Daftar FTKAR',
    singular: 'FTKAR',
    module: 'capa',
    description: 'Catatan tindakan korektif, analisis risiko, dan verifikasi efektivitas menurut FOM/MR/006.',
    rows: capas,
    titleKey: 'masalah',
    searchKeys: ['id', 'masalah', 'detailAkar', 'tindakan', 'pic', 'ref'],
    facets: ['status', 'kategori', 'akarPenyebab', 'sumber', 'departemen', 'efektivitas'],
    monthKey: 'bulan',
    columns: [
      { key: 'id', label: 'No. FTKAR', type: 'code' },
      { key: 'tanggal', secondary: true, label: 'Tanggal', type: 'date' },
      { key: 'kategori', label: 'Kategori', type: 'badge' },
      { key: 'masalah', label: 'Masalah / temuan', type: 'title', sub: 'detailAkar' },
      { key: 'departemen', secondary: true, label: 'Departemen' },
      { key: 'pic', secondary: true, label: 'PIC' },
      { key: 'target', label: 'Target selesai', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'progress', label: 'Progres', type: 'progress' },
    ],
    extra: [
      { key: 'sumber', label: 'Sumber' },
      { key: 'ref', label: 'Referensi' },
      { key: 'akarPenyebab', label: 'Akar penyebab' },
      { key: 'analisisRisiko', label: 'Analisis risiko', full: true },
      { key: 'buktiEfektivitas', label: 'Bukti verifikasi efektivitas', full: true },
      { key: 'tahap', label: 'Tahap saat ini' },
      { key: 'jenisTindakan', label: 'Jenis tindakan' },
      { key: 'efektivitas', label: 'Verifikasi efektivitas', type: 'badge' },
      { key: 'tglSelesai', label: 'Tanggal selesai', type: 'date' },
      { key: 'tindakan', label: 'Tindakan', full: true },
    ],
    related: (r) => {
      if (!r.ref) return [];
      if (r.ref.startsWith('FND')) return [{ label: `Temuan audit asal (${r.ref})`, dataset: 'findings', filters: { id: r.ref }, open: r.ref }];
      return [{ label: `Masukan pelanggan asal (${r.ref})`, dataset: 'feedback', filters: { id: r.ref }, open: r.ref }];
    },
    summary: (rows) => [
      { label: 'FTKAR', value: rows.length },
      { label: 'Open / On progress', value: count(rows, 'status', 'Open') + count(rows, 'status', 'On Progress'), tone: 'blue' },
      { label: 'Overdue', value: count(rows, 'status', 'Overdue'), tone: 'red' },
      { label: 'Closed', value: count(rows, 'status', 'Closed'), tone: 'mint' },
    ],
  },
};

export const datasetKeys = Object.keys(DATASETS);
// Kata benda untuk kalimat: huruf pertama kecil, singkatan tetap kapital.
export const nounOf = (ds) => (/^[A-Z]{2,}/.test(ds.singular) ? ds.singular : ds.singular.charAt(0).toLowerCase() + ds.singular.slice(1));


// Label manusiawi untuk kunci filter (chip filter aktif & panel facet).
const LABEL_OVERRIDES = {
  kemungkinan: 'Kemungkinan', dampak: 'Dampak', residualKemungkinan: 'Kemungkinan residual', residualDampak: 'Dampak residual',
  residualLevel: 'Level residual', tahap: 'Tahap',
};

export function fieldLabel(ds, key) {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  const def = [...ds.columns, ...(ds.extra ?? [])].find((c) => c.key === key);
  if (def) return def.label;
  return {
    bulan: 'Bulan', bulanTerbit: 'Bulan terbit', empId: 'Karyawan', kebijakanId: 'Kebijakan', id: 'Kode', ref: 'Referensi',
    auditId: 'No. audit', level: 'Level', golongan: 'Golongan', kode: 'Kode KPI', stakeholder: 'Stakeholder',
    levelKeseluruhan: 'Level keseluruhan', sentimen: 'Sentimen', hasil: 'Hasil', area: 'Area', departemen: 'Departemen',
    objective: 'Sasaran mutu', jenisAudit: 'Jenis audit', kategori: 'Kategori', jabatan: 'Jabatan', karyawan: 'Karyawan',
  }[key] ?? key;
}

// Bangun URL halaman detail. Nilai array menjadi daftar dipisah koma (OR).
export function drillHref(dataset, filters = {}, opts = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || v === '') continue;
    p.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  if (opts.from) p.set('from', opts.from);
  if (opts.src) p.set('src', opts.src);
  if (opts.open) p.set('open', opts.open);
  const qs = p.toString();
  return `/${DATASETS[dataset].module}/${dataset}${qs ? '?' + qs : ''}`;
}

export const RESERVED_PARAMS = ['q', 'from', 'src', 'open', 'sort', 'dir', 'page', 'size', 'new'];

export function applyFilters(rows, filters) {
  const entries = Object.entries(filters);
  if (!entries.length) return rows;
  return rows.filter((r) => entries.every(([k, vals]) => vals.includes(String(r[k]))));
}

// Filter dari URL: kategori `field=a,b`, rentang `field.from` / `field.to`.
export function parseFilters(params) {
  const cat = {};
  const range = {};
  for (const [k, v] of params.entries()) {
    if (RESERVED_PARAMS.includes(k) || !v) continue;
    const m = k.match(/^(.+)\.(from|to)$/);
    if (m) range[m[1]] = { ...range[m[1]], [m[2]]: v };
    else cat[k] = v.split(',');
  }
  return { cat, range };
}

export function applyRanges(rows, ranges) {
  const entries = Object.entries(ranges);
  if (!entries.length) return rows;
  return rows.filter((r) => entries.every(([k, { from, to }]) => {
    const v = r[k];
    if (v == null || v === '') return false;
    const numeric = typeof v === 'number';
    const val = numeric ? v : String(v);
    if (from != null && from !== '' && val < (numeric ? Number(from) : from)) return false;
    if (to != null && to !== '' && val > (numeric ? Number(to) : to)) return false;
    return true;
  }));
}

// Kolom yang bisa difilter dengan rentang (tanggal / angka).
export function rangeFields(ds) {
  return [...ds.columns, ...(ds.extra ?? [])].filter((c) => ['date', 'num', 'pct', 'progress'].includes(c.type))
    .filter((c, i, arr) => arr.findIndex((x) => x.key === c.key) === i);
}

export function facetCounts(rows, key) {
  const c = countBy(rows, (r) => String(r[key]));
  return Object.entries(c).filter(([v]) => v !== 'null' && v !== 'undefined').sort((a, b) => b[1] - a[1]);
}
