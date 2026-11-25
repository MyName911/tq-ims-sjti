// Ringkasan tiap sistem: 4 KPI + 2 grafik pilihan dari sub-modulnya.
// get(key) mengembalikan baris gabungan (data awal + perubahan lokal).
import {
  Radar, Users, MessagesSquare, Target, Percent, ScrollText, MailCheck, ShieldAlert, Flame, Lightbulb, Crosshair,
  UserCheck, GraduationCap, BadgeAlert, FileText, FileCheck2, FileClock, FileX2, ClipboardCheck, SearchCheck, Star,
  MessageSquareWarning, Hourglass, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { drillHref } from './datasets';
import { TODAY, monthOf, avgBy, fmtNum, pct } from './data/core';

import { PRIORITY_RISK_LEVELS } from './data/risk';

const count = (rows, f) => rows.filter(f).length;

export const OVERVIEWS = {
  pestel: {
    kpis: (get) => {
      const isu = get('pestel');
      const stk = get('stakeholders');
      return [
        { label: 'Isu organisasi', value: isu.length, icon: Radar, href: drillHref('pestel') },
        { label: 'Bagian dalam konteks', value: new Set(isu.map((r) => r.departemen).filter(Boolean)).size, icon: Radar, href: drillHref('pestel') },
        { label: 'Pihak berkepentingan', value: stk.length, icon: Users, href: drillHref('stakeholders') },
        { label: 'Interaksi bulan ini', value: count(get('stakeholder-comms'), (r) => r.bulan === monthOf(TODAY)), icon: MessagesSquare, href: drillHref('stakeholder-comms', { bulan: monthOf(TODAY) }) },
      ];
    },
    charts: [['pestel', 'departemen'], ['stakeholders', 'tipe']],
  },
  executive: {
    kpis: (get) => {
      const kpi = get('kpi');
      const measured = kpi.filter((r) => Number.isFinite(r.capaian));
      const pol = get('policies');
      const rr = get('read-receipts');
      return [
        { label: 'Sasaran mutu', value: kpi.length, icon: Target, href: drillHref('kpi') },
        { label: 'Rata-rata capaian terukur', value: measured.length ? fmtNum(avgBy(measured, (r) => Math.min(100, r.capaian)), 1) + '%' : '—', icon: Percent, href: drillHref('kpi-monthly') },
        { label: 'Kebijakan tercatat', value: pol.length, icon: ScrollText, href: drillHref('policies') },
        { label: 'Tingkat baca kebijakan', value: rr.length ? pct(count(rr, (r) => r.status === 'Sudah Dibaca'), rr.length) + '%' : '—', icon: MailCheck, href: drillHref('read-receipts') },
      ];
    },
    charts: [['kpi', 'departemen'], ['kpi-monthly', 'tren']],
  },
  risk: {
    kpis: (get) => {
      const r = get('risks');
      const assessed = r.filter((x) => x.jenis === 'Risiko');
      const okr = get('okr');
      return [
        { label: 'Risiko tercatat', value: assessed.length, icon: ShieldAlert, href: drillHref('risks', { jenis: 'Risiko' }) },
        { label: 'Berbahaya atau lebih (akhir)', value: count(assessed, (x) => PRIORITY_RISK_LEVELS.includes(x.residualLevel)), icon: Flame, tone: 'red', href: drillHref('risks', { jenis: 'Risiko', residualLevel: PRIORITY_RISK_LEVELS }) },
        { label: 'Peluang', value: count(r, (x) => x.jenis === 'Peluang'), icon: Lightbulb, href: drillHref('risks', { jenis: 'Peluang' }) },
        { label: 'Program kerja', value: okr.length, icon: Crosshair, href: drillHref('okr') },
      ];
    },
    charts: [['risks', 'level'], ['okr', 'pemilik']],
  },
  skill: {
    kpis: (get) => {
      const emp = get('employees');
      const evaluated = emp.filter((e) => ['Kompeten', 'Perlu Pengembangan'].includes(e.status));
      const tr = get('trainings');
      const cert = get('certifications');
      return [
        { label: 'Topik pengetahuan', value: get('knowledge').length, icon: Users, href: drillHref('knowledge') },
        { label: 'Kompeten', value: evaluated.length ? pct(count(evaluated, (e) => e.status === 'Kompeten'), evaluated.length, 0) + '%' : '—', icon: UserCheck, href: drillHref('employees', { status: 'Kompeten' }) },
        { label: 'Pelatihan selesai', value: count(tr, (t) => t.status === 'Selesai'), icon: GraduationCap, href: drillHref('trainings', { status: 'Selesai' }) },
        { label: 'Sertifikat akan kadaluarsa', value: count(cert, (c) => c.status === 'Akan Kadaluarsa'), icon: BadgeAlert, tone: 'red', href: drillHref('certifications', { status: 'Akan Kadaluarsa' }) },
      ];
    },
    charts: [['knowledge', 'departemen'], ['skill-scores', 'gap']],
  },
  edoc: {
    kpis: (get) => {
      const d = get('documents');
      return [
        { label: 'Total dokumen', value: fmtNum(d.length), icon: FileText, href: drillHref('documents') },
        { label: 'Aktif', value: fmtNum(count(d, (x) => x.status === 'Aktif')), icon: FileCheck2, href: drillHref('documents', { status: 'Aktif' }) },
        { label: 'Belum diverifikasi', value: count(d, (x) => x.status === 'Belum Diverifikasi'), icon: FileClock, href: drillHref('documents', { status: 'Belum Diverifikasi' }) },
        { label: 'Kadaluarsa', value: count(d, (x) => x.status === 'Kadaluarsa'), icon: FileX2, tone: 'red', href: drillHref('documents', { status: 'Kadaluarsa' }) },
      ];
    },
    charts: [['documents', 'kategori'], ['documents', 'departemen']],
  },
  audit: {
    kpis: (get) => {
      const a = get('audits');
      const f = get('findings');
      const fb = get('feedback');
      const rated = fb.filter((r) => Number.isFinite(r.rating));
      return [
        { label: 'Audit selesai', value: count(a, (x) => x.status === 'Selesai'), icon: ClipboardCheck, href: drillHref('audits', { status: 'Selesai' }) },
        { label: 'Temuan belum ditutup', value: count(f, (x) => x.status !== 'Tertutup'), icon: SearchCheck, tone: 'red', href: drillHref('findings', { status: ['Terbuka', 'Dalam Proses'] }) },
        { label: 'Nilai survei pelanggan', value: rated.length ? fmtNum(avgBy(rated, 'rating'), 1) + '/5' : '—', icon: Star, href: drillHref('feedback') },
        { label: 'Komplain', value: count(fb, (x) => x.tipe === 'Komplain'), icon: MessageSquareWarning, href: drillHref('feedback', { tipe: 'Komplain' }) },
      ];
    },
    charts: [['audits', 'bulan'], ['feedback', 'rating']],
  },
  capa: {
    kpis: (get) => {
      const c = get('capa');
      return [
        { label: 'Total FTKAR', value: c.length, icon: FileText, href: drillHref('capa') },
        { label: 'Open & on progress', value: count(c, (x) => ['Open', 'On Progress'].includes(x.status)), icon: Hourglass, href: drillHref('capa', { status: ['Open', 'On Progress'] }) },
        { label: 'Overdue', value: count(c, (x) => x.status === 'Overdue'), icon: AlertTriangle, tone: 'red', href: drillHref('capa', { status: 'Overdue' }) },
        { label: 'Closed', value: count(c, (x) => x.status === 'Closed'), icon: CheckCircle2, href: drillHref('capa', { status: 'Closed' }) },
      ];
    },
    charts: [['capa', 'bulan'], ['capa', 'akar']],
  },
};
