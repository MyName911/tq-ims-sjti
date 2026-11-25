'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Plus } from 'lucide-react';
import AppShell from './AppShell';
import { ChartCard } from './ChartPanel';
import { Badge, Breadcrumb, Card, Seg } from './ui';
import { MODULES, moduleById } from '@/lib/modules';
import { chartOf } from '@/lib/submodules';
import { drillHref } from '@/lib/datasets';
import { activitiesOf } from '@/lib/activity';
import { PRIORITY_RISK_LEVELS } from '@/lib/data/risk';
import { combine, useStore } from '@/lib/store';
import { COMPANY, PROCESS_GROUPS, TODAY, daysBetween, fmtDate } from '@/lib/data/core';

function health(get) {
  const kpi = get('kpi');
  const measurements = kpi.filter((r) => Number.isFinite(r.capaian));
  const achieved = measurements.filter((r) => r.status === 'Tercapai').length;
  const residual = get('risks').filter((r) => r.jenis === 'Risiko' && r.status !== 'Closed' && PRIORITY_RISK_LEVELS.includes(r.residualLevel)).length;
  const docs = get('documents');
  const unverified = docs.filter((r) => r.status === 'Belum Diverifikasi').length;
  const audit = get('audits');
  const capa = get('capa');
  const overdue = capa.filter((r) => r.status !== 'Closed' && r.target && r.target < TODAY).length;
  return {
    pestel: { metric: get('pestel').length + ' isu tercatat' },
    executive: { metric: measurements.length ? achieved + ' dari ' + measurements.length + ' sasaran terukur tercapai' : 'Belum ada realisasi' },
    risk: { metric: residual + ' risiko akhir berbahaya atau lebih', badge: residual ? 'Perlu Perhatian' : null },
    skill: { metric: get('knowledge').length + ' topik pengetahuan kerja' },
    edoc: { metric: docs.length + ' dokumen dalam katalog', badge: unverified ? 'Belum Diverifikasi' : null },
    audit: { metric: audit.length ? audit.length + ' audit tercatat' : 'Belum ada catatan audit' },
    capa: { metric: capa.length ? capa.length + ' FTKAR tercatat' : 'Belum ada catatan FTKAR', badge: overdue ? 'Perlu Perhatian' : null },
  };
}

// Daftar pekerjaan yang perlu ditindaklanjuti, diurutkan dari yang paling mendesak.
function tasks(get) {
  const list = [];
  const due = (d) => (d ? daysBetween(TODAY, d) : 999);
  for (const c of get('capa').filter((x) => x.status !== 'Closed' && x.target && x.target < TODAY)) {
    list.push({ group: 'FTKAR', module: 'capa', title: `${c.id} melewati target`, detail: c.masalah, when: c.target, score: due(c.target), href: drillHref('capa', { id: c.id }, { open: c.id }) });
  }
  for (const f of get('findings').filter((x) => x.status !== 'Tertutup' && x.terlambat === 'Ya')) {
    list.push({ group: 'Audit', module: 'audit', title: `Temuan ${f.kategori.toLowerCase()} belum ditutup`, detail: `${f.deskripsi}, ${f.area}`, when: f.deadline, score: due(f.deadline), href: drillHref('findings', { id: f.id }, { open: f.id }) });
  }
  for (const fb of get('feedback').filter((x) => x.tipe === 'Komplain' && x.status !== 'Selesai')) {
    list.push({ group: 'Audit', module: 'audit', title: `Komplain dari ${fb.pelanggan}`, detail: fb.komentar, when: fb.tanggal, score: 5, href: drillHref('feedback', { id: fb.id }, { open: fb.id }) });
  }
  for (const d of get('documents').filter((x) => x.status === 'Kadaluarsa')) {
    list.push({ group: 'Dokumen', module: 'edoc', title: `${d.id} lewat jadwal review`, detail: d.nama, when: d.tglReview, score: due(d.tglReview), href: drillHref('documents', { id: d.id }, { open: d.id }) });
  }
  for (const c of get('certifications').filter((x) => x.status === 'Akan Kadaluarsa')) {
    list.push({ group: 'SDM', module: 'skill', title: `Sertifikat ${c.karyawan} akan kadaluarsa`, detail: c.sertifikasi, when: c.kadaluarsa, score: c.sisaHari, href: drillHref('certifications', { id: c.id }, { open: c.id }) });
  }
  for (const r of get('risks').filter((x) => PRIORITY_RISK_LEVELS.includes(x.residualLevel) && x.jenis === 'Risiko' && x.status !== 'Closed')) {
    list.push({ group: 'Risiko', module: 'risk', title: 'Risiko akhir ' + r.residualLevel.toLowerCase(), detail: r.deskripsi, when: r.target, score: due(r.target), href: drillHref('risks', { id: r.id }, { open: r.id }) });
  }
  return list.sort((a, b) => a.score - b.score);
}

const QUICK = [
  ['capa', 'FTKAR baru'],
  ['findings', 'Catat temuan'],
  ['feedback', 'Input feedback'],
  ['risks', 'Tambah risiko'],
  ['documents', 'Tambah dokumen'],
  ['kpi-monthly', 'Input realisasi sasaran'],
];

export default function ImsOverview() {
  const router = useRouter();
  const st = useStore();
  const get = (k) => combine(k, st);
  const h = health(get);
  const all = tasks(get);
  const activities = activitiesOf(get);
  const [group, setGroup] = useState('Semua');
  const [expanded, setExpanded] = useState(false);
  const groups = ['Semua', ...new Set(all.map((t) => t.group))];
  const shown = (group === 'Semua' ? all : all.filter((t) => t.group === group));

  return (
    <AppShell moduleId="ims" title="IMS 360°">
      <Breadcrumb items={[{ label: 'Semua Sistem', href: '/' }, { label: 'IMS 360°' }]} />
      <div className="page-title-row">
        <div>
          <div className="page-eyebrow">Klausul 4-10</div>
          <h1>Sistem Manajemen Mutu STI</h1>
          <p className="muted">{COMPANY.standard} · {COMPANY.products}</p>
        </div>
      </div>

      <div className="stack">
        <div className="health-grid">
          {MODULES.filter((m) => m.id !== 'ims').map((m) => (
            <Link key={m.id} href={`/${m.id}`} className="health-card">
              <span className="health-top">
                <span className="health-icon"><m.icon aria-hidden /></span>
                {h[m.id].badge && <Badge value={h[m.id].badge} />}
              </span>
              <strong>{m.short}</strong>
              <span className="health-metric">{h[m.id].metric}</span>
            </Link>
          ))}
        </div>

        <Card title="Model proses bisnis STI" actions={<Link className="btn-ghost" href={drillHref('documents', { id: 'STI-SRC-001' }, { open: 'STI-SRC-001' })}>Quality Manual</Link>}>
          <div className="notes">
            {PROCESS_GROUPS.map(([name, description]) => <p key={name}><strong>{name}</strong><br />{description}</p>)}
            <p><strong>Kebijakan mutu</strong><br />{COMPANY.qualityPolicy}</p>
            <p><strong>Klausul 8.3 perlu klarifikasi MR</strong><br />Riwayat revisi pada halaman PDF 1 mencatat penambahan kembali aktivitas desain dan pengembangan. Bagian 4.3 pada halaman PDF 7 masih mencatat pengecualian.</p>
          </div>
        </Card>

        <div className="grid-main-side">
          <Card title={`Perlu tindakan (${all.length})`} flush actions={<Seg value={group} onChange={(g) => { setGroup(g); setExpanded(false); }} options={groups.map((g) => [g, g, g === 'Semua' ? all.length : all.filter((t) => t.group === g).length])} />}>
            <div className="task-list">
              {(expanded ? shown : shown.slice(0, 8)).map((t, i) => {
                const Icon = moduleById(t.module).icon;
                return (
                  <Link key={`${t.href}-${i}`} href={t.href} className="task-item">
                    <span className="feed-icon tone-blue"><Icon aria-hidden /></span>
                    <span className="feed-body"><strong>{t.title}</strong><br />{t.detail}</span>
                    <span className="task-when">{t.when ? fmtDate(t.when) : ''}</span>
                    <ChevronRight className="sub-go" aria-hidden />
                  </Link>
                );
              })}
              {shown.length === 0 && <div className="cell-empty">Tidak ada yang perlu ditindaklanjuti.</div>}
            </div>
            {shown.length > 8 && (
              <div className="card-footer">
                <button type="button" className="btn-ghost" onClick={() => setExpanded((v) => !v)}>{expanded ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${shown.length})`}</button>
              </div>
            )}
          </Card>
          <div className="stack">
            <Card title="Input cepat">
              <div className="quick-grid">
                {QUICK.map(([k, label]) => (
                  <Link key={k} href={`${drillHref(k)}?new=1`} className="btn btn-outline btn-sm"><Plus />{label}</Link>
                ))}
              </div>
            </Card>
            <Card title="Aktivitas terbaru" flush className="grow">
              <div className="feed fill-scroll" style={{ minHeight: 200 }}>
                {activities.length === 0 && <div className="cell-empty">Belum ada aktivitas tercatat.</div>}
                {activities.slice(0, 12).map((a, i) => (
                  <Link key={i} href={a.href} className="feed-item">
                    <span className="feed-body"><strong>{a.who}</strong> {a.what}<br />{a.detail}</span>
                    <span className="feed-time">{a.when}</span>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <div className="grid-2">
          <ChartCard cfg={chartOf('kpi-monthly', 'tren')} rows={get('kpi-monthly')} href={drillHref('kpi-monthly')} onPick={(p) => router.push(drillHref('kpi-monthly', p))} />
          <ChartCard cfg={chartOf('okr', 'pemilik')} rows={get('okr')} href={drillHref('okr')} onPick={(p) => router.push(drillHref('okr', p))} />
        </div>
      </div>
    </AppShell>
  );
}
