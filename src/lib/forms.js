// Form input per sub-modul. `fields` menentukan isian; `build` menghitung baris
// lengkap (kode, bulan, skor, status, dsb.) dari isian, sama seperti data awal.
// Opsi bisa berupa array atau fungsi (get) => array, get(key) = baris gabungan.
import {
  DEPARTMENTS, MONTHS, TODAY, daysBetween, monthOf, monthLabel, pad,
} from './data/core';
import { quadrantOf } from './data/pestel';
import { PERSPECTIVES, achievementOf, kpiStatus } from './data/executive';
import { assessRisk } from './data/risk';
import { SKILLS } from './data/skill';
import { DOC_CATEGORIES, DEPT_CODE } from './data/documents';
import { AUDIT_TYPES } from './data/audit';
import { CAPA_CATEGORIES, CAPA_STATUSES, CAPA_STEPS, ROOT_CAUSES } from './data/capa';

const num = (v, d = 0) => (v === '' || v == null || Number.isNaN(Number(v)) ? d : Number(v));
const uniq = (rows, key) => [...new Set(rows.map((r) => r[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'id'));

// Kode berikutnya: PREFIX + nomor terbesar + 1 (mengikuti pola data awal).
export function nextId(rows, prefix, width = 3) {
  const max = rows.reduce((m, r) => {
    if (!String(r.id).startsWith(prefix)) return m;
    const n = Number(String(r.id).slice(prefix.length).replace(/\D.*$/, ''));
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `${prefix}${pad(max + 1, width)}`;
}

const employeeOptions = (get) => get('employees').map((e) => [e.id, `${e.nama} (${e.departemen})`]);
const employeeOf = (get, id) => get('employees').find((e) => e.id === id) ?? {};

export const FORMS = {
  pestel: {
    fields: [
      { key: 'isu', label: 'Isu', required: true, span: 'full' },
      { key: 'jenis', label: 'Jenis isu', type: 'select', options: ['Internal', 'Eksternal'] },
      { key: 'departemen', label: 'Bagian', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'periode', label: 'Periode' },
      { key: 'risikoPeluang', label: 'Risiko atau peluang' },
      { key: 'pihak', label: 'Pihak yang berkepentingan' },
      { key: 'harapan', label: 'Persyaratan dan harapan', type: 'textarea', span: 'full' },
      { key: 'tindakan', label: 'Bentuk pemenuhan', type: 'textarea', span: 'full' },
      { key: 'pic', label: 'PIC' },
      { key: 'status', label: 'Status', type: 'select', options: ['Rencana', 'On Progress', 'Closed'] },
    ],
    build: (v, { get, existing }) => ({ ...existing, ...v, id: existing?.id ?? nextId(get('pestel'), 'KO-') }),
  },
  stakeholders: {
    fields: [
      { key: 'nama', label: 'Nama stakeholder', required: true, span: 'full' },
      { key: 'kategori', label: 'Kategori', type: 'select', options: (get) => uniq(get('stakeholders'), 'kategori'), required: true },
      { key: 'tipe', label: 'Tipe', type: 'select', options: ['Internal', 'Eksternal', 'Eksternal / Internal'] },
      { key: 'pengaruh', label: 'Pengaruh (1–10)', type: 'number', min: 1, max: 10 },
      { key: 'kepentingan', label: 'Kepentingan (1–10)', type: 'number', min: 1, max: 10 },
      { key: 'status', label: 'Status komunikasi', type: 'select', options: ['Aktif', 'Monitoring', 'Perlu Tindak Lanjut'], default: 'Aktif' },
      { key: 'pic', label: 'PIC' },
      { key: 'kepuasan', label: 'Kepuasan (1-5)', type: 'number', min: 1, max: 5, step: 0.1 },
      { key: 'kebutuhan', label: 'Kebutuhan & harapan', type: 'textarea', span: 'full' },
    ],
    build: (v, { get, existing }) => {
      const p = num(v.pengaruh, null);
      const k = num(v.kepentingan, null);
      return {
        ...existing,
        id: existing?.id ?? nextId(get('stakeholders'), 'STK-'),
        nama: v.nama, kategori: v.kategori, tipe: v.tipe, pengaruh: p, kepentingan: k, kuadran: p != null && k != null ? quadrantOf(p, k) : null,
        status: v.status, pic: v.pic, kepuasan: num(v.kepuasan, null), kebutuhan: v.kebutuhan,
      };
    },
  },
  'stakeholder-comms': {
    fields: [
      { key: 'stakeholder', label: 'Stakeholder', type: 'select', options: (get) => uniq(get('stakeholders'), 'nama'), required: true, span: 'full' },
      { key: 'topik', label: 'Topik', required: true, span: 'full' },
      { key: 'tanggal', label: 'Tanggal', type: 'date', default: TODAY },
      { key: 'media', label: 'Media', type: 'select', options: ['Meeting', 'Email', 'Telepon', 'Kunjungan', 'Survey'], default: 'Meeting' },
      { key: 'pic', label: 'PIC' },
      { key: 'hasil', label: 'Hasil', type: 'select', options: ['Selesai', 'Perlu Tindak Lanjut', 'Terjadwal'], default: 'Selesai' },
    ],
    build: (v, { get, existing }) => {
      const s = get('stakeholders').find((x) => x.nama === v.stakeholder) ?? {};
      return {
        ...existing,
        id: existing?.id ?? nextId(get('stakeholder-comms'), 'KOM-'),
        stakeholder: v.stakeholder, kategori: s.kategori ?? '-', tipe: s.tipe ?? '-', topik: v.topik,
        tanggal: v.tanggal, bulan: monthOf(v.tanggal), media: v.media, pic: v.pic, hasil: v.hasil,
      };
    },
  },
  kpi: {
    validate: (v, { get, row }) => get('kpi').some((k) => k.kode === v.kode.trim() && k.id !== row?.id)
      ? { kode: 'Kode sudah digunakan.' } : {},
    fields: [
      { key: 'kpi', label: 'Nama sasaran mutu', required: true, span: 'full' },
      { key: 'kode', label: 'Kode', required: true, lockOnEdit: true },
      { key: 'perspektif', label: 'Perspektif', type: 'select', options: PERSPECTIVES.map((p) => p.key), required: true },
      { key: 'satuan', label: 'Satuan', default: '%' },
      { key: 'arah', label: 'Polaritas', type: 'select', options: ['Lebih tinggi lebih baik', 'Lebih rendah lebih baik'], default: 'Lebih tinggi lebih baik' },
      { key: 'target', label: 'Target', type: 'number', step: 0.01, required: true },
      { key: 'periode', label: 'Periode' },
      { key: 'departemen', label: 'Departemen', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'pic', label: 'PIC' },
    ],
    build: (v, { existing }) => {
      const target = num(v.target);
      return {
        ...existing,
        id: existing?.id ?? v.kode.trim(), kode: v.kode.trim(), kpi: v.kpi, perspektif: v.perspektif, satuan: v.satuan, arah: v.arah, target, departemen: v.departemen, pic: v.pic,
        periode: v.periode, status: 'Belum Ada Realisasi',
      };
    },
  },
  'kpi-monthly': {
    validate: (v, { get, row }) => get('kpi-monthly').some((point) => point.kode === v.kode && point.bulan === v.bulan && point.id !== row?.id)
      ? { bulan: 'Realisasi sasaran untuk bulan ini sudah ada. Ubah catatan yang ada.' } : {},
    fields: [
      { key: 'kode', label: 'Sasaran mutu', type: 'select', options: (get) => get('kpi').map((k) => [k.kode, `${k.kode} ${k.kpi}`]), required: true, span: 'full' },
      { key: 'bulan', label: 'Bulan', type: 'select', required: true, options: MONTHS.map((m) => [m, monthLabel(m)]), default: MONTHS.includes(monthOf(TODAY)) ? monthOf(TODAY) : '' },
      { key: 'realisasi', label: 'Realisasi', type: 'number', step: 0.01, required: true },
    ],
    build: (v, { get, existing }) => {
      const k = get('kpi').find((x) => x.kode === v.kode) ?? {};
      const real = num(v.realisasi);
      const cap = achievementOf(real, k.target, k.arah?.startsWith('Lebih rendah') ? 'down' : 'up');
      return {
        ...existing,
        id: existing?.id ?? `${v.kode}-${v.bulan}-${Date.now().toString(36)}`,
        kode: v.kode, kpi: k.kpi, perspektif: k.perspektif, satuan: k.satuan, bulan: v.bulan,
        target: k.target, realisasi: real, capaian: cap, status: kpiStatus(cap), departemen: k.departemen,
      };
    },
  },
  policies: {
    fields: [
      { key: 'nama', label: 'Nama kebijakan', required: true, span: 'full' },
      { key: 'kategori', label: 'Kategori', type: 'select', options: (get) => uniq(get('policies'), 'kategori'), required: true },
      { key: 'versi', label: 'Versi', default: 'v1.0' },
      { key: 'status', label: 'Status', type: 'select', options: ['Tercantum di Manual', 'Draft', 'Revisi', 'Aktif', 'Kadaluarsa'], default: 'Draft' },
      { key: 'tglBerlaku', label: 'Tanggal berlaku', type: 'date' },
      { key: 'tglReview', label: 'Tanggal tinjauan berikutnya', type: 'date' },
      { key: 'pemilik', label: 'Pemilik proses', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'ringkasan', label: 'Ringkasan', type: 'textarea', span: 'full' },
    ],
    build: (v, { get, existing }) => ({
      ...existing,
      id: existing?.id ?? nextId(get('policies'), 'KBJ-'),
      nama: v.nama, kategori: v.kategori, versi: v.versi, status: v.status, tglBerlaku: v.tglBerlaku,
      tglReview: v.tglReview, pemilik: v.pemilik,
      ringkasan: v.ringkasan,
    }),
  },
  'read-receipts': {
    fields: [
      { key: 'kebijakanId', label: 'Kebijakan', type: 'select', options: (get) => get('policies').map((p) => [p.id, p.nama]), required: true, span: 'full' },
      { key: 'empId', label: 'Penerima', type: 'select', options: employeeOptions, required: true, span: 'full' },
      { key: 'metode', label: 'Metode', type: 'select', options: ['Email', 'In-App Notification', 'WhatsApp', 'Cetak (Manual)'], default: 'Email' },
      { key: 'status', label: 'Status', type: 'select', options: ['Sudah Dibaca', 'Belum Dibaca', 'Gagal Terkirim'], default: 'Belum Dibaca' },
      { key: 'tglKirim', label: 'Tanggal kirim', type: 'date', default: TODAY },
    ],
    build: (v, { get, existing }) => {
      const e = employeeOf(get, v.empId);
      const pol = get('policies').find((p) => p.id === v.kebijakanId) ?? {};
      return {
        ...existing,
        id: existing?.id ?? nextId(get('read-receipts'), 'RR-', 5),
        kebijakanId: v.kebijakanId, kebijakan: pol.nama, empId: v.empId, penerima: e.nama, departemen: e.departemen, jabatan: e.jabatan,
        metode: v.metode, status: v.status, tglKirim: v.tglKirim, tglBaca: v.status === 'Sudah Dibaca' ? TODAY : null,
        tandaTangan: v.status === 'Sudah Dibaca' ? 'Ya' : 'Belum',
      };
    },
  },
  risks: {
    fields: [
      { key: 'deskripsi', label: 'Isu atau aktivitas', required: true, span: 'full' },
      { key: 'dampakUraian', label: 'Risiko / peluang', span: 'full' },
      { key: 'jenis', label: 'Jenis', type: 'select', options: ['Risiko', 'Peluang'], default: 'Risiko', required: true },
      { key: 'kategori', label: 'Kategori', type: 'select', options: ['Mutu', 'Lingkungan', 'K3'] },
      { key: 'departemen', label: 'Bagian', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'sumber', label: 'Sumber identifikasi', default: 'FOM/MR/002' },
      { key: 'periode', label: 'Periode' },
      { key: 'diaturRegulasi', label: 'Diatur regulasi', type: 'select', options: ['Ya', 'Tidak'] },
      { key: 'frekuensi', label: 'A · Frekuensi awal (1–5)', type: 'number', min: 1, max: 5, required: true },
      { key: 'kemungkinan', label: 'B · Potensi awal (1–5)', type: 'number', min: 1, max: 5, required: true },
      { key: 'dampak', label: 'C · Keparahan / keuntungan awal (1–5)', type: 'number', min: 1, max: 5, required: true },
      { key: 'residualFrekuensi', label: 'A · Frekuensi akhir (1–5)', type: 'number', min: 1, max: 5 },
      { key: 'residualKemungkinan', label: 'B · Potensi akhir (1–5)', type: 'number', min: 1, max: 5 },
      { key: 'residualDampak', label: 'C · Keparahan / keuntungan akhir (1–5)', type: 'number', min: 1, max: 5 },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Mitigasi', 'Monitoring', 'Closed', 'Rencana', 'On Progress', 'Terealisasi'] },
      { key: 'pic', label: 'PIC' },
      { key: 'target', label: 'Target tindak lanjut', type: 'date' },
      { key: 'pengendalian', label: 'Pengendalian / rencana tindakan', type: 'textarea', span: 'full' },
    ],
    build: (v, { get, existing }) => {
      const awal = [v.frekuensi, v.kemungkinan, v.dampak].map((value) => num(value, null));
      const akhir = [v.residualFrekuensi, v.residualKemungkinan, v.residualDampak].map((value) => num(value, null));
      const diatur = v.diaturRegulasi === 'Ya';
      const residual = assessRisk(v.jenis, ...akhir, diatur);
      return {
        ...existing, ...v, id: existing?.id ?? nextId(get('risks'), v.jenis === 'Risiko' ? 'RSK-' : 'OPP-'),
        frekuensi: awal[0], kemungkinan: awal[1], dampak: awal[2], ...assessRisk(v.jenis, ...awal, diatur),
        residualFrekuensi: akhir[0], residualKemungkinan: akhir[1], residualDampak: akhir[2],
        residualSkor: residual.skor, residualLevel: residual.level,
      };
    },
  },
  okr: {
    fields: [
      { key: 'keyResult', label: 'Rencana kerja', type: 'textarea', required: true, span: 'full' },
      { key: 'objective', label: 'Sasaran mutu', required: true, span: 'full' },
      { key: 'pemilik', label: 'Bagian / penanggung jawab', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'targetSumber', label: 'Target' },
      { key: 'periode', label: 'Periode pelaksanaan' },
      { key: 'status', label: 'Status', type: 'select', options: ['Rencana', 'On Progress', 'Selesai'] },
      { key: 'progress', label: 'Progres (%)', type: 'number', min: 0, max: 100 },
      { key: 'evaluasi', label: 'Evaluasi pelaksanaan', type: 'textarea', span: 'full' },
    ],
    build: (v, { get, existing }) => ({
      ...existing, ...v, id: existing?.id ?? nextId(get('okr'), 'PKJ-'), progress: num(v.progress, null),
    }),
  },
  employees: {
    fields: [
      { key: 'nama', label: 'Nama karyawan', required: true, span: 'full' },
      { key: 'nik', label: 'NIK' },
      { key: 'jabatan', label: 'Jabatan', required: true },
      { key: 'golongan', label: 'Golongan', type: 'select', options: ['Operator', 'Leader', 'Staff', 'Supervisor', 'Manager'] },
      { key: 'departemen', label: 'Bagian', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'tglMasuk', label: 'Tanggal masuk', type: 'date' },
      ...SKILLS.flatMap((s, i) => [
        { key: 'skill' + i, label: s + ' (1–5)', type: 'number', min: 1, max: 5 },
        { key: 'target' + i, label: 'Target ' + s + ' (1–5)', type: 'number', min: 1, max: 5 },
      ]),
    ],
    initial: (row) => Object.fromEntries(SKILLS.flatMap((_, i) => [['skill' + i, row.skills?.[i]], ['target' + i, row.targets?.[i]]])),
    build: (v, { get, existing }) => {
      const skills = SKILLS.map((_, i) => num(v['skill' + i], null));
      const targets = SKILLS.map((_, i) => num(v['target' + i], null));
      const gaps = SKILLS.filter((_, i) => skills[i] != null && targets[i] != null && skills[i] < targets[i]);
      const measured = skills.filter((score) => score != null);
      const mean = measured.length ? measured.reduce((sum, score) => sum + score, 0) / measured.length : null;
      const complete = measured.length === SKILLS.length && targets.every((target) => target != null);
      return {
        ...existing, id: existing?.id ?? nextId(get('employees'), 'EMP-', 4), nik: v.nik, nama: v.nama, jabatan: v.jabatan,
        golongan: v.golongan, departemen: v.departemen, tglMasuk: v.tglMasuk,
        masaKerja: v.tglMasuk ? Math.round((daysBetween(v.tglMasuk, TODAY) / 365) * 10) / 10 : null,
        skills, targets, rataRata: mean, levelKeseluruhan: complete ? Math.round(mean) : null,
        jumlahGap: gaps.length, skillGap: gaps.join(', '),
        status: gaps.length ? 'Perlu Pengembangan' : complete ? 'Kompeten' : 'Belum Dinilai',
      };
    },
  },
  trainings: {
    fields: [
      { key: 'empId', label: 'Peserta', type: 'select', options: employeeOptions, required: true, span: 'full' },
      { key: 'program', label: 'Program', required: true, span: 'full' },
      { key: 'skill', label: 'Kompetensi', type: 'select', options: SKILLS },
      { key: 'metode', label: 'Metode' },
      { key: 'jam', label: 'Durasi (jam)', type: 'number', min: 0 },
      { key: 'tanggal', label: 'Jadwal', type: 'date', default: TODAY },
      { key: 'status', label: 'Status', type: 'select', options: ['Terjadwal', 'Berjalan', 'Selesai'], default: 'Terjadwal' },
      { key: 'progress', label: 'Progres (%)', type: 'number', min: 0, max: 100, default: 0 },
      { key: 'nilai', label: 'Nilai post-test', type: 'number', min: 0, max: 100 },
    ],
    build: (v, { get, existing }) => {
      const e = employeeOf(get, v.empId);
      return {
        ...existing,
        id: existing?.id ?? nextId(get('trainings'), 'TRN-', 4),
        karyawan: e.nama, empId: v.empId, departemen: e.departemen, program: v.program, skill: v.skill, metode: v.metode, jam: num(v.jam, null),
        tanggal: v.tanggal, bulan: monthOf(v.tanggal), status: v.status,
        progress: v.status === 'Selesai' ? 100 : v.status === 'Terjadwal' ? 0 : num(v.progress),
        nilai: v.status === 'Selesai' && v.nilai !== '' ? num(v.nilai) : null,
      };
    },
  },
  certifications: {
    fields: [
      { key: 'empId', label: 'Karyawan', type: 'select', options: employeeOptions, required: true, span: 'full' },
      { key: 'sertifikasi', label: 'Sertifikasi', required: true, span: 'full' },
      { key: 'penerbit', label: 'Penerbit' },
      { key: 'terbit', label: 'Tanggal terbit', type: 'date' },
      { key: 'kadaluarsa', label: 'Berlaku sampai', type: 'date' },
    ],
    build: (v, { get, existing }) => {
      const e = employeeOf(get, v.empId);
      const sisa = v.kadaluarsa ? daysBetween(TODAY, v.kadaluarsa) : null;
      return {
        ...existing,
        id: existing?.id ?? nextId(get('certifications'), 'CRT-', 4),
        karyawan: e.nama, empId: v.empId, departemen: e.departemen, jabatan: e.jabatan, sertifikasi: v.sertifikasi,
        penerbit: v.penerbit, terbit: v.terbit, kadaluarsa: v.kadaluarsa,
        sisaHari: sisa, status: sisa == null ? null : sisa < 0 ? 'Kadaluarsa' : sisa <= 90 ? 'Akan Kadaluarsa' : 'Aktif',
      };
    },
  },
  documents: {
    fields: [
      { key: 'nama', label: 'Nama dokumen', required: true, span: 'full' },
      { key: 'kategori', label: 'Kategori', type: 'select', options: DOC_CATEGORIES.map((c) => c.key), required: true },
      { key: 'departemen', label: 'Departemen', type: 'select', options: (get) => [...new Set([...Object.keys(DEPT_CODE), ...uniq(get('documents'), 'departemen')])], required: true },
      { key: 'nomorDokumen', label: 'Nomor dokumen' },
      { key: 'revisi', label: 'Revisi' },
      { key: 'status', label: 'Status', type: 'select', options: ['Belum Diverifikasi', 'Draft', 'Review', 'Approval', 'Aktif', 'Kadaluarsa', 'Obsolete'], default: 'Draft' },
      { key: 'tglTerbit', label: 'Tanggal terbit', type: 'date' },
      { key: 'tglReview', label: 'Review berikutnya', type: 'date' },
      { key: 'akses', label: 'Akses', type: 'select', options: ['Internal', 'Terbatas', 'Rahasia'] },
      { key: 'pemilik', label: 'Pemilik dokumen' },
      { key: 'klausul', label: 'Klausul ISO' },
      { key: 'retensi', label: 'Masa retensi' },
      { key: 'format', label: 'Format', type: 'select', options: (get) => [...new Set(['DOC', 'DOCX', 'PDF', 'Form Digital', ...uniq(get('documents'), 'format')])] },
      { key: 'disposisi', label: 'Disposisi', span: 'full' },
    ],
    build: (v, { get, existing }) => {
      const cat = DOC_CATEGORIES.find((c) => c.key === v.kategori);
      return {
        ...existing,
        id: existing?.id ?? nextId(get('documents'), `${cat.code}-${DEPT_CODE[v.departemen] ?? 'DOC'}-`),
        nama: v.nama, kategori: v.kategori, departemen: v.departemen, nomorDokumen: v.nomorDokumen, revisi: v.revisi, tglTerbit: v.tglTerbit,
        bulanTerbit: v.tglTerbit ? monthOf(v.tglTerbit) : '', tglReview: v.tglReview,
        sisaHariReview: v.tglReview ? daysBetween(TODAY, v.tglReview) : null, status: v.status,
        pemilik: v.pemilik, akses: v.akses, klausul: v.klausul, retensi: v.retensi,
        disposisi: v.disposisi, format: v.format,
      };
    },
  },
  audits: {
    fields: [
      { key: 'jenis', label: 'Jenis audit', type: 'select', options: AUDIT_TYPES, required: true },
      { key: 'area', label: 'Area', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'auditor', label: 'Auditor', required: true },
      { key: 'tanggal', label: 'Tanggal', type: 'date', default: TODAY },
      { key: 'status', label: 'Status', type: 'select', options: ['Terjadwal', 'Dalam Proses', 'Selesai'], default: 'Terjadwal' },
      { key: 'auditee', label: 'Auditan / pendamping' },
      { key: 'skor', label: 'Skor (%)', type: 'number', min: 0, max: 100 },
      { key: 'checklist', label: 'Progres checklist (%)', type: 'number', min: 0, max: 100 },
      { key: 'metode', label: 'Metode pengisian' },
    ],
    build: (v, { get, existing }) => ({
      ...existing,
      id: existing?.id ?? nextId(get('audits'), 'AMI-' + (v.tanggal || TODAY).slice(0, 4) + '-'),
      jenis: v.jenis, area: v.area, auditor: v.auditor, auditee: v.auditee, tanggal: v.tanggal, bulan: monthOf(v.tanggal),
      status: v.status, skor: v.status === 'Selesai' && v.skor !== '' ? num(v.skor) : null,
      jumlahTemuan: get('findings').filter((f) => f.auditId === existing?.id).length,
      checklist: num(v.checklist, null), metode: v.metode,
    }),
  },
  findings: {
    fields: [
      { key: 'deskripsi', label: 'Temuan', required: true, span: 'full' },
      { key: 'auditId', label: 'Audit', type: 'select', options: (get) => get('audits').filter((a) => a.status !== 'Terjadwal').map((a) => [a.id, `${a.id} ${a.jenis}, ${a.area}`]), required: true, span: 'full' },
      { key: 'kategori', label: 'Kategori', type: 'select', options: ['Major', 'Minor', 'Observasi', 'OFI'], default: 'Minor' },
      { key: 'prioritas', label: 'Prioritas', type: 'select', options: ['High', 'Medium', 'Low'], default: 'Medium' },
      { key: 'klausul', label: 'Klausul', default: '8.5.1' },
      { key: 'status', label: 'Status', type: 'select', options: ['Terbuka', 'Dalam Proses', 'Tertutup'], default: 'Terbuka' },
      { key: 'pic', label: 'PIC' },
      { key: 'deadline', label: 'Batas tindak lanjut', type: 'date' },
    ],
    build: (v, { get, existing }) => {
      const a = get('audits').find((x) => x.id === v.auditId) ?? {};
      return {
        ...existing,
        id: existing?.id ?? nextId(get('findings'), 'FND-'),
        auditId: v.auditId, area: a.area, jenisAudit: a.jenis, auditor: a.auditor, tanggal: a.tanggal, bulan: a.bulan,
        deskripsi: v.deskripsi, klausul: v.klausul, kategori: v.kategori, prioritas: v.prioritas, status: v.status, pic: v.pic,
        deadline: v.deadline, terlambat: v.status !== 'Tertutup' && v.deadline && v.deadline < TODAY ? 'Ya' : 'Tidak',
      };
    },
  },
  feedback: {
    fields: [
      { key: 'pelanggan', label: 'Pelanggan', required: true, span: 'full' },
      { key: 'rating', label: 'Nilai survei', type: 'select', options: [['5', '5'], ['4', '4'], ['3', '3'], ['2', '2'], ['1', '1']] },
      { key: 'tipe', label: 'Jenis masukan', type: 'select', options: ['Komplain', 'Retur', 'Saran', 'Pujian', 'Survei'], required: true },
      { key: 'kategori', label: 'Kategori', type: 'select', options: ['Kualitas Produk', 'Pengiriman', 'Komunikasi', 'Dokumen & Label'], default: 'Kualitas Produk' },
      { key: 'kanal', label: 'Kanal', type: 'select', options: ['SPKR', 'Kuesioner', 'Email', 'Telepon', 'Kunjungan'] },
      { key: 'tanggal', label: 'Tanggal', type: 'date', default: TODAY },
      { key: 'style', label: 'Konstruksi / lot kain' },
      { key: 'status', label: 'Status', type: 'select', options: ['Baru', 'Ditindaklanjuti', 'Selesai'], default: 'Baru' },
      { key: 'pic', label: 'PIC' },
      { key: 'komentar', label: 'Komentar', type: 'textarea', required: true, span: 'full' },
    ],
    build: (v, { get, existing }) => {
      const rating = num(v.rating, null);
      return {
        ...existing,
        id: existing?.id ?? nextId(get('feedback'), 'FB-', 4),
        tanggal: v.tanggal, bulan: monthOf(v.tanggal), pelanggan: v.pelanggan, rating,
        sentimen: rating == null ? null : rating >= 4 ? 'Positif' : rating === 3 ? 'Netral' : 'Negatif',
        tipe: v.tipe,
        kategori: v.kategori, kanal: v.kanal, komentar: v.komentar, style: v.style, status: v.status, pic: v.pic,
      };
    },
  },
  capa: {
    fields: [
      { key: 'masalah', label: 'Masalah / temuan', required: true, span: 'full' },
      { key: 'kategori', label: 'Kategori', type: 'select', options: CAPA_CATEGORIES, required: true },
      { key: 'sumber', label: 'Sumber', type: 'select', options: ['Audit Internal', 'Komplain Pelanggan', 'Inspeksi Produk', 'Evaluasi Pemasok', 'Insiden K3', 'Risiko'], default: 'Inspeksi Produk' },
      { key: 'departemen', label: 'Departemen', type: 'select', options: DEPARTMENTS, required: true },
      { key: 'ref', label: 'Temuan audit atau masukan pelanggan terkait', type: 'select', options: (get) => [
        ...get('findings').map((r) => [r.id, r.id + ' · ' + r.deskripsi]),
        ...get('feedback').filter((r) => ['Komplain', 'Retur'].includes(r.tipe)).map((r) => [r.id, r.id + ' · ' + r.pelanggan]),
      ], span: 'full' },
      { key: 'akarPenyebab', label: 'Akar penyebab', type: 'select', options: ROOT_CAUSES },
      { key: 'detailAkar', label: 'Detail akar penyebab', span: 'full' },
      { key: 'analisisRisiko', label: 'Analisis risiko', type: 'textarea', span: 'full' },
      { key: 'tindakan', label: 'Tindakan', type: 'textarea', span: 'full' },
      { key: 'pic', label: 'PIC' },
      { key: 'tanggal', label: 'Tanggal', type: 'date', default: TODAY },
      { key: 'target', label: 'Target selesai', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: CAPA_STATUSES, default: 'Open' },
      { key: 'progress', label: 'Progres (%)', type: 'number', min: 0, max: 100, default: 0 },
      { key: 'buktiEfektivitas', label: 'Bukti verifikasi efektivitas', type: 'textarea', span: 'full' },
      { key: 'tahap', label: 'Tahap FTKAR', type: 'select', options: CAPA_STEPS },
      { key: 'jenisTindakan', label: 'Jenis tindakan', type: 'select', options: ['Korektif', 'Preventif'], default: 'Korektif' },
      { key: 'efektivitas', label: 'Verifikasi efektivitas', type: 'select', options: ['Belum Diverifikasi', 'Efektif', 'Perlu Tindak Lanjut'], default: 'Belum Diverifikasi' },
    ],
    build: (v, { get, existing }) => {
      const status = v.status !== 'Closed' && v.target && v.target < TODAY ? 'Overdue' : v.status;
      const closed = status === 'Closed';
      const progress = closed ? 100 : num(v.progress);
      const step = CAPA_STEPS.indexOf(v.tahap) + 1;
      return {
        ...existing,
        id: existing?.id ?? nextId(get('capa'), 'FTKAR-' + (v.tanggal || TODAY).slice(0, 4) + '-'),
        tanggal: v.tanggal, bulan: monthOf(v.tanggal), sumber: v.sumber, ref: v.ref || null, kategori: v.kategori,
        masalah: v.masalah, akarPenyebab: v.akarPenyebab, analisisRisiko: v.analisisRisiko, buktiEfektivitas: v.buktiEfektivitas, detailAkar: v.detailAkar || '-', tindakan: v.tindakan || '-',
        departemen: v.departemen, pic: v.pic, target: v.target, tglSelesai: closed ? existing?.tglSelesai ?? TODAY : null,
        status, progress, tahap: v.tahap, tahapKe: step,
        efektivitas: closed ? v.efektivitas : 'Belum Diverifikasi', jenisTindakan: v.jenisTindakan,
      };
    },
  },
};

// Nilai awal form: dari baris yang diedit atau dari default field.
export function initialValues(key, row) {
  const form = FORMS[key];
  const base = Object.fromEntries(form.fields.map((f) => [f.key, row ? row[f.key] ?? '' : f.default ?? '']));
  return row && form.initial ? { ...base, ...form.initial(row) } : base;
}
