// Sub-modul = satu dataset dengan halaman sendiri: nama pendek, ikon, dan
// maksimal tiga grafik ringkas. Grafik yang diklik memfilter tabel di bawahnya.
import {
  Radar, Users, MessagesSquare, Target, TrendingUp, ScrollText, MailCheck, ShieldAlert, Crosshair,
  UserRound, Grid3x3, GraduationCap, Award, FileText, ClipboardList, SearchCheck, MessageSquareHeart, Wrench,
} from 'lucide-react';

export const SUBMODULES = {
  pestel: {
    short: 'Isu Organisasi', icon: Radar,
    charts: [
      { id: 'departemen', title: 'Isu per bagian', type: 'bar', field: 'departemen' },
      { id: 'jenis', title: 'Jenis isu yang tercantum', type: 'donut', field: 'jenis' },
    ],
  },
  stakeholders: {
    short: 'Pihak Berkepentingan', icon: Users,
    charts: [
      { id: 'tipe', title: 'Pihak per jenis', type: 'donut', field: 'tipe' },
      { id: 'kategori', title: 'Kategori stakeholder', type: 'donut', field: 'kategori' },
    ],
  },
  'stakeholder-comms': {
    short: 'Komunikasi', icon: MessagesSquare,
    charts: [
      { id: 'bulan', title: 'Interaksi per bulan', type: 'monthly', field: 'bulan', months: 'last6' },
      { id: 'media', title: 'Media komunikasi', type: 'donut', field: 'media' },
    ],
  },
  kpi: {
    short: 'Sasaran Mutu', icon: Target,
    charts: [
      { id: 'departemen', title: 'Sasaran mutu per bagian', type: 'bar', field: 'departemen' },
      { id: 'status', title: 'Status KPI', type: 'donut', field: 'status' },
    ],
  },
  'kpi-monthly': {
    short: 'Realisasi Bulanan', icon: TrendingUp,
    charts: [
      { id: 'tren', title: 'Capaian KPI utama (%)', type: 'kpiTrend' },
      { id: 'status', title: 'Status realisasi', type: 'donut', field: 'status' },
    ],
  },
  policies: {
    short: 'Kebijakan', icon: ScrollText,
    charts: [
      { id: 'status', title: 'Status kebijakan', type: 'donut', field: 'status' },
      { id: 'kategori', title: 'Kebijakan per kategori', type: 'bar', field: 'kategori' },
    ],
  },
  'read-receipts': {
    short: 'Read Receipt', icon: MailCheck,
    charts: [
      { id: 'status', title: 'Status baca', type: 'donut', field: 'status' },
      { id: 'metode', title: 'Metode distribusi', type: 'bar', field: 'metode' },
    ],
  },
  risks: {
    short: 'Risiko dan Peluang', icon: ShieldAlert,
    charts: [
      { id: 'departemen', title: 'Risiko dan peluang per bagian', type: 'bar', field: 'departemen' },
      { id: 'level', title: 'Tingkat risiko awal (A × B × C)', type: 'donut', field: 'level', where: (r) => r.jenis === 'Risiko', whereFilter: { jenis: 'Risiko' } },
    ],
  },
  okr: {
    short: 'Program Kerja', icon: Crosshair,
    charts: [
      { id: 'pemilik', title: 'Program kerja per bagian', type: 'bar', field: 'pemilik' },
      { id: 'status', title: 'Status pelaksanaan', type: 'donut', field: 'status' },
    ],
  },
  knowledge: {
    short: 'Pengetahuan Organisasi', icon: FileText, readOnly: true,
    charts: [{ id: 'departemen', title: 'Topik per bagian', type: 'bar', field: 'departemen' }],
  },
  employees: {
    short: 'Matriks Karyawan', icon: UserRound,
    charts: [
      { id: 'level', title: 'Level kompetensi', type: 'donut', field: 'levelKeseluruhan', order: [5, 4, 3, 2, 1], label: (v) => `Level ${v}` },
      { id: 'departemen', title: 'Karyawan per departemen', type: 'bar', field: 'departemen' },
    ],
  },
  'skill-scores': {
    short: 'Nilai Kompetensi', icon: Grid3x3, readOnly: true,
    charts: [
      { id: 'gap', title: 'Gap per kompetensi', type: 'bar', field: 'skill', where: (r) => r.status === 'Gap', whereFilter: { status: 'Gap' } },
      { id: 'level', title: 'Sebaran level', type: 'donut', field: 'level', order: [5, 4, 3, 2, 1], label: (v) => `Level ${v}` },
    ],
  },
  trainings: {
    short: 'Pelatihan', icon: GraduationCap,
    charts: [
      { id: 'bulan', title: 'Pelatihan per bulan', type: 'monthly', field: 'bulan', stack: 'status' },
      { id: 'skill', title: 'Pelatihan per kompetensi', type: 'bar', field: 'skill' },
    ],
  },
  certifications: {
    short: 'Sertifikasi', icon: Award,
    charts: [
      { id: 'status', title: 'Status sertifikat', type: 'donut', field: 'status' },
      { id: 'jenis', title: 'Sertifikat per jenis', type: 'bar', field: 'sertifikasi' },
    ],
  },
  documents: {
    short: 'Master Dokumen', icon: FileText,
    charts: [
      { id: 'kategori', title: 'Kategori dokumen', type: 'donut', field: 'kategori' },
      { id: 'status', title: 'Status dokumen', type: 'bar', field: 'status' },
      { id: 'departemen', title: 'Dokumen per departemen', type: 'bar', field: 'departemen', top: 8 },
    ],
  },
  audits: {
    short: 'Daftar Audit', icon: ClipboardList,
    charts: [
      { id: 'bulan', title: 'Audit per bulan', type: 'monthly', field: 'bulan', stack: 'status' },
      { id: 'area', title: 'Audit per area', type: 'bar', field: 'area' },
    ],
  },
  findings: {
    short: 'Temuan', icon: SearchCheck,
    charts: [
      { id: 'status', title: 'Status temuan', type: 'donut', field: 'status' },
      { id: 'area', title: 'Temuan per area', type: 'bar', field: 'area' },
    ],
  },
  feedback: {
    short: 'Masukan Pelanggan', icon: MessageSquareHeart,
    charts: [
      { id: 'rating', title: 'Distribusi rating', type: 'bar', field: 'rating', order: [5, 4, 3, 2, 1], label: (v) => `${v} bintang` },
      { id: 'bulan', title: 'Sentimen per bulan', type: 'monthly', field: 'bulan', stack: 'sentimen' },
    ],
  },
  capa: {
    short: 'Daftar FTKAR', icon: Wrench,
    charts: [
      { id: 'bulan', title: 'FTKAR per bulan', type: 'monthly', field: 'bulan', stack: 'status', months: 'last6' },
      { id: 'kategori', title: 'Kategori FTKAR', type: 'donut', field: 'kategori' },
      { id: 'akar', title: 'Akar penyebab', type: 'bar', field: 'akarPenyebab' },
    ],
  },
};

export const chartOf = (dataset, id) => SUBMODULES[dataset].charts.find((c) => c.id === id);
