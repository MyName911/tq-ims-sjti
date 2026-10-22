'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target, ShieldAlert, Wrench, ClipboardCheck, MessageSquareHeart, FileText, Activity, TrendingUp, Crosshair, Bell, Zap,
  History, Link2, Smile, Users, Network, Database, Factory, UserSquare, ShoppingBag, BarChart3, Cloud, ArrowRight,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, Gauge, Kpi, Progress, Seg, SeeAll } from '@/components/ui';
import { Columns, Donut, TrendLines } from '@/components/charts';
import { kpis, kpiMonthly } from '@/lib/data/executive';
import { risks, okrs } from '@/lib/data/risk';
import { capas } from '@/lib/data/capa';
import { audits, feedback } from '@/lib/data/audit';
import { documents } from '@/lib/data/documents';
import { employees } from '@/lib/data/skill';
import { LAST6, MONTHS, countBy, fmtDate, fmtNum, monthLabel, monthShort, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { MODULES, moduleById } from '@/lib/modules';
import { NOTIFICATIONS, ACTIVITIES } from '@/lib/activity';

const mod = moduleById('ims');
const PERF = [
  { kode: 'CUS-01', label: 'Kepuasan pelanggan' },
  { kode: 'PRC-03', label: 'Efisiensi proses' },
  { kode: 'PRC-01', label: 'Kualitas produk (RFT)' },
  { kode: 'CUS-02', label: 'Pengiriman tepat waktu' },
  { kode: 'PPL-03', label: 'Kehadiran karyawan' },
];
const TREND = [
  { kode: 'PRC-01', label: 'Kualitas (RFT)', color: '#5f6f86' },
  { kode: 'CUS-02', label: 'OTD', color: '#3b5bdb' },
  { kode: 'CUS-01', label: 'Kepuasan pelanggan', color: '#8fa2e6' },
];
const OKR_COLORS = { Tercapai: '#2f8a5f', 'On Track': '#3b5bdb', 'At Risk': '#d4a73a', 'Belum Tercapai': '#c2453d' };
const PROCESS_COLORS = ['#1d2c6e', '#24398a', '#2c4aa8', '#3b5bdb', '#5a76e0', '#7d93e6', '#9fb0ec'];
const PROCESS = [
  ['Konteks Organisasi', 'PESTEL & Stakeholder', 'pestel'],
  ['Kepemimpinan', 'Policy & Dashboard', 'executive'],
  ['Perencanaan', 'Risiko & OKR', 'risk'],
  ['Dukungan', 'SDM & E-Document', 'skill'],
  ['Operasi', 'Produksi & Layanan', 'edoc'],
  ['Evaluasi', 'Audit & Feedback', 'audit'],
  ['Peningkatan', 'CAPA & Continuous', 'capa'],
];
const SYSTEMS = [
  { label: 'PESTEL & Stakeholder', icon: Network, href: '/pestel' },
  { label: 'Dashboard Eksekutif', icon: BarChart3, href: '/executive' },
  { label: 'Risk Register & OKR', icon: ShieldAlert, href: '/risk' },
  { label: 'Skill Matrix & LMS', icon: Users, href: '/skill' },
  { label: 'Document Management', icon: FileText, href: '/edoc' },
  { label: 'E-Audit & Feedback', icon: ClipboardCheck, href: '/audit' },
  { label: 'CAPA Management', icon: Wrench, href: '/capa' },
  { label: 'ERP / MES (Produksi)', icon: Factory },
  { label: 'HRIS (SDM)', icon: UserSquare },
  { label: 'CRM (Pelanggan)', icon: ShoppingBag },
  { label: 'BI & Analytics', icon: Database },
];
const lastOf = (kode) => kpiMonthly.filter((k) => k.kode === kode).at(-1);

export default function ImsDashboard() {
  const router = useRouter();
  const [riskTab, setRiskTab] = useState('Semua');
  const [capaTab, setCapaTab] = useState('Semua');
  const [audTab, setAudTab] = useState('Terjadwal');
  const [docTab, setDocTab] = useState('Prosedur (SOP)');

  const kst = countBy(kpis, 'status');
  const activeRisk = risks.filter((r) => r.jenis === 'Risiko' && r.status !== 'Closed');
  const rl = countBy(activeRisk, 'level');
  const capaActive = capas.filter((c) => c.status !== 'Closed');
  const cst = countBy(capas, 'status');
  const audActive = audits.filter((a) => a.status !== 'Selesai');
  const pos = feedback.filter((f) => f.sentimen === 'Positif').length;
  const neg = feedback.filter((f) => f.sentimen === 'Negatif').length;
  const okrSt = countBy(okrs, 'status');
  const trend = MONTHS.map((m) => ({ label: monthShort(m), bulan: m, ...Object.fromEntries(TREND.map((t) => [t.label, kpiMonthly.find((k) => k.kode === t.kode && k.bulan === m).realisasi])) }));
  const riskList = risks.filter((r) => r.status !== 'Closed' && (riskTab === 'Semua' || r.jenis === riskTab)).sort((a, b) => b.skor - a.skor).slice(0, 5);
  const capaList = capas.filter((c) => (capaTab === 'Semua' ? c.status !== 'Closed' : c.status === capaTab)).sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5);
  const audList = audits.filter((a) => a.status === audTab).sort((a, b) => (audTab === 'Terjadwal' ? a.tanggal.localeCompare(b.tanggal) : b.tanggal.localeCompare(a.tanggal))).slice(0, 5);
  const docList = documents.filter((d) => d.kategori === docTab && d.status === 'Aktif').sort((a, b) => b.tglTerbit.localeCompare(a.tglTerbit)).slice(0, 5);
  const depts = ['Sewing', 'Quality Control', 'Cutting', 'Finishing', 'Maintenance'].map((d) => {
    const list = employees.filter((e) => e.departemen === d);
    const ok = list.filter((e) => e.status === 'Kompeten').length;
    return { d, total: list.length, ok, gap: list.length - ok };
  });
  const fbTrend = LAST6.map((m) => ({ label: monthShort(m), bulan: m, value: pct(feedback.filter((f) => f.bulan === m && f.sentimen === 'Positif').length, feedback.filter((f) => f.bulan === m).length, 0) }));

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <div className="stack">
        <div className="grid-main-side">
          <div className="stack">
            <div className="kpi-grid">
              <Kpi label="Total KPI" value={kpis.length} icon={Target} tone="mint" href="/executive" hint={`On track ${pct(kst.Tercapai, kpis.length, 0)}%`} />
              <Kpi label="Risiko aktif" value={activeRisk.length} icon={ShieldAlert} tone="blue" href="/risk" hint={`High+ ${(rl.High ?? 0) + (rl.Extreme ?? 0)}, Med ${rl.Medium ?? 0}, Low ${rl.Low ?? 0}`} />
              <Kpi label="CAPA aktif" value={capaActive.length} icon={Wrench} tone="sun" href="/capa" hint={`On progress ${cst['On Progress'] ?? 0}, Overdue ${cst.Overdue ?? 0}`} />
              <Kpi label="Audit aktif" value={audActive.length} icon={ClipboardCheck} tone="lilac" href="/audit" hint={`Terjadwal ${audits.filter((a) => a.status === 'Terjadwal').length}, berjalan ${audits.filter((a) => a.status === 'Dalam Proses').length}`} />
              <Kpi label="Feedback pelanggan" value={feedback.length} icon={MessageSquareHeart} tone="mint" href="/audit" hint={`Positif ${pct(pos, feedback.length, 0)}%, Negatif ${pct(neg, feedback.length, 0)}%`} />
            </div>

            <div className="grid-2">
              <Card title="Kinerja organisasi" icon={Activity}>
                <div className="gauge-grid">
                  {PERF.map((p) => {
                    const k = lastOf(p.kode);
                    return (
                      <Link key={p.kode} href={drillHref('kpi-monthly', { kode: p.kode }, { from: 'ims', src: `Kinerja organisasi, ${p.label}` })} className="gauge">
                        <span className="gauge-name" style={{ fontSize: 12 }}>{p.label}</span>
                        <Gauge value={k.realisasi} size={78} stroke={8} color={k.status === 'Tercapai' ? 'var(--green-500)' : k.status === 'Perlu Perhatian' ? 'var(--sun-500)' : 'var(--red-500)'} />
                        <span className="gauge-sub">Target {k.target}%</span>
                      </Link>
                    );
                  })}
                </div>
              </Card>
              <Card title="Tren KPI utama" icon={TrendingUp}>
                <TrendLines
                  data={trend}
                  height={210}
                  unit="%"
                  yDomain={[80, 100]}
                  yTicks={[80, 85, 90, 95, 100]}
                  series={TREND.map((t) => ({ key: t.label, color: t.color }))}
                  hrefFor={(row) => drillHref('kpi-monthly', { bulan: row.bulan, kode: TREND.map((t) => t.kode) }, { from: 'ims', src: `Tren KPI ${monthLabel(row.bulan)}` })}
                />
                <div className="legend-inline">{TREND.map((t) => <span key={t.kode}><i className="line" style={{ background: t.color }} />{t.label}</span>)}</div>
              </Card>
            </div>

            <div className="grid-3">
              <Card title="Status sasaran (OKR)" icon={Crosshair}>
                <Donut height={130} legend="bottom" centerValue={`${pct((okrSt.Tercapai ?? 0), okrs.length, 0)}%`} centerLabel="Tercapai" data={Object.keys(OKR_COLORS).map((s) => ({ name: s, value: okrSt[s] ?? 0, color: OKR_COLORS[s], href: drillHref('okr', { status: s }, { from: 'ims', src: `OKR, ${s}` }) }))} />
              </Card>
              <Card title="Risiko & peluang" flush actions={<SeeAll href={drillHref('risks', riskTab === 'Semua' ? {} : { jenis: riskTab }, { from: 'ims' })} />} style={{ gridColumn: 'span 2' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}><Seg value={riskTab} onChange={setRiskTab} options={['Semua', 'Risiko', 'Peluang']} /></div>
                <div className="table-wrapper">
                  <table className="table-compact">
                    <thead><tr><th>Risiko / peluang</th><th>Kategori</th><th>Level</th><th>Status</th></tr></thead>
                    <tbody>
                      {riskList.map((r) => (
                        <tr key={r.id} className="clickable" onClick={() => router.push(drillHref('risks', { id: r.id }, { open: r.id, from: 'ims' }))}>
                          <td className="cell-title">{r.deskripsi}</td><td>{r.kategori}</td><td><Badge value={r.level} /></td><td><Badge value={r.status} plain /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="grid-2">
              <Card title="CAPA tracking" flush actions={<SeeAll href={drillHref('capa', capaTab === 'Semua' ? { status: ['Open', 'On Progress', 'Overdue'] } : { status: capaTab }, { from: 'ims' })} />}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}><Seg value={capaTab} onChange={setCapaTab} options={[['Semua', 'Aktif'], 'Open', 'On Progress', 'Overdue']} /></div>
                <div className="table-wrapper">
                  <table className="table-compact">
                    <thead><tr><th>No. CAPA</th><th>Temuan</th><th>Status</th><th>Progres</th></tr></thead>
                    <tbody>
                      {capaList.map((c) => (
                        <tr key={c.id} className="clickable" onClick={() => router.push(drillHref('capa', { id: c.id }, { open: c.id, from: 'ims' }))}>
                          <td className="cell-code">{c.id}</td><td className="cell-title">{c.masalah}</td><td><Badge value={c.status} /></td><td style={{ minWidth: 100 }}><Progress value={c.progress} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              <Card title="Feedback pelanggan" icon={Smile}>
                <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                  <Gauge value={pct(pos, feedback.length, 0)} size={84} color="var(--green-500)" />
                  <div style={{ flex: 1 }}>
                    {['Positif', 'Netral', 'Negatif'].map((s) => (
                      <Link key={s} href={drillHref('feedback', { sentimen: s }, { from: 'ims', src: `Feedback, ${s}` })} className="legend-row">
                        <span className="swatch" style={{ background: s === 'Positif' ? '#2f8a5f' : s === 'Netral' ? '#d4a73a' : '#c2453d' }} /><span className="name">{s}</span><span className="val">{pct(feedback.filter((f) => f.sentimen === s).length, feedback.length, 0)}%</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <Columns data={fbTrend} height={130} unit="%" name="Feedback positif" color="#5f6f86" hrefFor={(d) => drillHref('feedback', { bulan: d.bulan }, { from: 'ims', src: `Feedback ${monthLabel(d.bulan)}` })} />
              </Card>
            </div>

            <div className="grid-3">
              <Card title="E-Audit" flush actions={<SeeAll href={drillHref('audits', { status: audTab }, { from: 'ims' })} />}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}><Seg value={audTab} onChange={setAudTab} options={['Terjadwal', 'Dalam Proses', 'Selesai']} /></div>
                <div className="feed">
                  {audList.map((a) => (
                    <Link key={a.id} href={drillHref('audits', { id: a.id }, { open: a.id, from: 'ims' })} className="feed-item" style={{ padding: '9px 16px' }}>
                      <span className="feed-body"><strong>{a.jenis}</strong><br />{a.area}, {fmtDate(a.tanggal)}</span><Badge value={a.status} />
                    </Link>
                  ))}
                  {audList.length === 0 && <div className="muted" style={{ padding: 16 }}>Tidak ada audit.</div>}
                </div>
              </Card>
              <Card title="E-Document" flush actions={<SeeAll href={drillHref('documents', { kategori: docTab }, { from: 'ims' })} />}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}><Seg value={docTab} onChange={setDocTab} options={[['Prosedur (SOP)', 'SOP'], ['Formulir', 'Form'], ['Manual', 'Manual'], ['Instruksi Kerja', 'IK']]} /></div>
                <div className="feed">
                  {docList.map((d) => (
                    <Link key={d.id} href={drillHref('documents', { id: d.id }, { open: d.id, from: 'ims' })} className="feed-item" style={{ padding: '9px 16px' }}>
                      <span className="feed-body"><strong>{d.nama}</strong><br /><span className="cell-code">{d.id}</span>, {d.revisi}</span><Badge value={d.status} />
                    </Link>
                  ))}
                </div>
              </Card>
              <Card title="Skill matrix & e-learning" flush actions={<SeeAll href={drillHref('employees', {}, { from: 'ims' })} />}>
                <table className="table-compact">
                  <thead><tr><th>Departemen</th><th className="num">Total</th><th className="num">Kompeten</th><th className="num">Gap</th></tr></thead>
                  <tbody>
                    {depts.map((x) => (
                      <tr key={x.d} className="clickable" onClick={() => router.push(drillHref('employees', { departemen: x.d }, { from: 'ims', src: `Skill matrix, ${x.d}` }))}>
                        <td>{x.d}</td><td className="num">{x.total}</td><td className="num">{x.ok}</td><td className="num" style={{ color: x.gap ? 'var(--red-600)' : undefined, fontWeight: 600 }}>{x.gap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: '10px 16px' }}><Progress value={pct(employees.filter((e) => e.status === 'Kompeten').length, employees.length)} /><span className="muted">Kompetensi rata-rata seluruh karyawan</span></div>
              </Card>
            </div>
          </div>

          <div className="stack">
            <Card title="Notifikasi & to-do" icon={Bell} flush>
              <div className="feed">
                {NOTIFICATIONS.map((n) => (
                  <Link key={n.id} href={n.href} className="feed-item">
                    <span className={`feed-icon ${n.tone === 'red' ? 'tone-red' : 'tone-blue'}`}>{(() => { const Icon = moduleById(n.module).icon; return <Icon aria-hidden />; })()}</span>
                    <span className="feed-body"><strong>{n.title}</strong><br />{n.body}</span>
                    <span className="feed-time">{n.time}</span>
                  </Link>
                ))}
              </div>
            </Card>
            <Card title="Quick action" icon={Zap}>
              <div className="grid-2" style={{ gap: 8 }}>
                {[
                  ['Buat CAPA', '/capa'], ['Upload dokumen', '/edoc'], ['Buat audit', '/audit'], ['Input risiko', '/risk'], ['Input feedback', '/audit'], ['Lihat laporan', '/executive'],
                ].map(([l, h]) => <Link key={l} href={h} className="btn btn-outline btn-sm" style={{ justifyContent: 'flex-start' }}>{l}</Link>)}
              </div>
            </Card>
            <Card title="Aktivitas terbaru" icon={History} flush>
              <div className="feed">
                {ACTIVITIES.map((a, i) => (
                  <Link key={i} href={a.href} className="feed-item">
                    <span className="user-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{a.who.split(' ').map((x) => x[0]).slice(0, 2).join('')}</span>
                    <span className="feed-body"><strong>{a.who}</strong> {a.what}<br />{a.detail}</span>
                    <span className="feed-time">{a.when}</span>
                  </Link>
                ))}
              </div>
            </Card>
            <Card title="Tautan cepat" icon={Link2}>
              <div style={{ display: 'grid', gap: 4 }}>
                {MODULES.filter((m) => m.id !== 'ims').map((m) => (
                  <Link key={m.id} href={`/${m.id}`} className="legend-row"><span className="nav-letter"><m.icon aria-hidden /></span><span className="name">{m.name}</span><ArrowRight size={14} /></Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card title="Peta proses bisnis & integrasi sistem" icon={Network}>
          <div className="process-map">
            {PROCESS.map(([t, s, id], i) => (
              <Link key={t} href={`/${id}`} className="process-step" style={{ background: PROCESS_COLORS[i] }}>
                <b>{i + 1}. {t}</b><span>{s}</span>
              </Link>
            ))}
          </div>
          <div className="section-label">Integrasi sistem & data</div>
          <div className="flex items-center gap-3 wrap">
            <div className="flow" style={{ flex: 1, gridAutoColumns: 'minmax(96px, 1fr)' }}>
              {SYSTEMS.map((s) => {
                const inner = (<><div className="flow-num tone-blue" style={{ margin: '0 auto 6px' }}><s.icon size={16} /></div><h4 style={{ fontSize: 11.5, textAlign: 'center' }}>{s.label}</h4></>);
                return s.href ? <Link key={s.label} href={s.href} className="flow-step" style={{ padding: 10 }}>{inner}</Link> : <div key={s.label} className="flow-step" style={{ padding: 10, borderStyle: 'dashed' }}>{inner}</div>;
              })}
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--brand-700)', fontWeight: 700, fontSize: 13 }}>
              <Cloud size={34} color="var(--brand-400)" />
              <span>Satu data<br />Satu sistem<br />Satu tujuan</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
