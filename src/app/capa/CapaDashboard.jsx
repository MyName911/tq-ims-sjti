'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Hourglass, Cog, AlertTriangle, CheckCircle2, ClipboardCheck, MessageSquareWarning, Search as SearchIcon, Truck, ShieldAlert, Activity, ExternalLink,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Kpi, PageHeader, Progress, Seg, SeeAll } from '@/components/ui';
import { BarList, Donut, SERIES, StackedBars } from '@/components/charts';
import { capas, CAPA_STATUSES, CAPA_STATUS_COLORS, CAPA_CATEGORIES, CAPA_STEPS, ROOT_CAUSES } from '@/lib/data/capa';
import { LAST6, MONTHS, countBy, daysBetween, fmtDate, fmtNum, monthLabel, monthShort, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('capa');
const SOURCE_ICONS = { 'Audit Internal': ClipboardCheck, 'Komplain Pelanggan': MessageSquareWarning, 'Inspeksi Produk': SearchIcon, 'Evaluasi Pemasok': Truck, 'Insiden K3': ShieldAlert, Risiko: Activity };
const STEP_COLORS = ['#1d2c6e', '#24398a', '#2c4aa8', '#3b5bdb', '#5a76e0', '#7d93e6', '#9fb0ec'];

export default function CapaDashboard() {
  const [period, setPeriod] = useState('');
  const [kategori, setKategori] = useState('');
  const [dept, setDept] = useState('');
  const [tab, setTab] = useState('Semua');
  const [selectedId, setSelectedId] = useState(null);

  const months = period === '6m' ? LAST6 : period ? [period] : MONTHS;
  const base = { ...(kategori && { kategori }), ...(dept && { departemen: dept }), ...(period && { bulan: months }) };
  const rows = capas.filter((c) => months.includes(c.bulan) && (!kategori || c.kategori === kategori) && (!dept || c.departemen === dept));
  const href = (extra = {}, src) => drillHref('capa', { ...base, ...extra }, { src });
  const by = countBy(rows, 'status');

  const trendMonths = period && period !== '6m' ? [period] : LAST6;
  const trend = trendMonths.map((m) => ({
    label: monthShort(m),
    bulan: m,
    ...Object.fromEntries(CAPA_STATUSES.map((s) => [s, rows.filter((r) => r.bulan === m && r.status === s).length])),
  }));
  const catCount = countBy(rows, 'kategori');
  const rootCount = countBy(rows, 'akarPenyebab');
  const sourceCount = countBy(rows, 'sumber');
  const deptCount = Object.entries(countBy(rows.filter((r) => r.status !== 'Closed'), 'departemen')).sort((a, b) => b[1] - a[1]);
  const closed = rows.filter((r) => r.status === 'Closed');
  const avgDays = closed.length ? Math.round(closed.reduce((s, r) => s + daysBetween(r.tanggal, r.tglSelesai), 0) / closed.length) : 0;
  const effective = closed.filter((r) => r.efektivitas === 'Efektif').length;
  const onTime = closed.filter((r) => r.tglSelesai <= r.target).length;

  const list = (tab === 'Semua' ? rows : rows.filter((r) => r.status === tab)).slice().sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const selected = rows.find((r) => r.id === selectedId) ?? list[0];

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Dashboard CAPA"
        actions={(
          <DashFilters
            onReset={() => { setPeriod(''); setKategori(''); setDept(''); }}
            filters={[
              { key: 'period', label: 'Periode', value: period, onChange: setPeriod, allLabel: 'Jan-Okt 2026', options: [['6m', '6 bulan terakhir'], ...MONTHS.slice().reverse().map((m) => [m, monthLabel(m)])] },
              { key: 'kategori', label: 'Kategori', value: kategori, onChange: setKategori, options: CAPA_CATEGORIES },
              { key: 'dept', label: 'Departemen', value: dept, onChange: setDept, options: [...new Set(capas.map((c) => c.departemen))].sort() },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total CAPA" value={rows.length} icon={FileText} tone="blue" href={href({}, 'KPI Total CAPA')} hint="periode terpilih" />
          <Kpi label="CAPA Open" value={by.Open ?? 0} icon={Hourglass} tone="sky" href={href({ status: 'Open' }, 'KPI CAPA Open')} hint={`${pct(by.Open ?? 0, rows.length)}% dari total`} />
          <Kpi label="On Progress" value={by['On Progress'] ?? 0} icon={Cog} tone="sun" href={href({ status: 'On Progress' }, 'KPI On Progress')} hint={`${pct(by['On Progress'] ?? 0, rows.length)}% dari total`} />
          <Kpi label="Overdue" value={by.Overdue ?? 0} icon={AlertTriangle} tone="red" href={href({ status: 'Overdue' }, 'KPI Overdue')} hint={`${pct(by.Overdue ?? 0, rows.length)}% dari total`} />
          <Kpi label="Closed" value={by.Closed ?? 0} icon={CheckCircle2} tone="mint" href={href({ status: 'Closed' }, 'KPI Closed')} hint={`${pct(by.Closed ?? 0, rows.length)}% dari total`} />
        </div>

        <div className="grid-main-side">
          <div className="stack">
            <div className="grid-3-2">
              <Card title="Tren CAPA per bulan">
                <StackedBars
                  data={trend}
                  series={CAPA_STATUSES.map((s) => ({ key: s, color: CAPA_STATUS_COLORS[s] }))}
                  totalLine
                  height={260}
                  hrefFor={(row, s) => drillHref('capa', { ...base, bulan: row.bulan, ...(s && { status: s }) }, { src: `Tren CAPA ${monthLabel(row.bulan)}${s ? `, ${s}` : ''}` })}
                />
                <div className="legend-inline" style={{ marginTop: 8 }}>
                  {CAPA_STATUSES.map((s) => <span key={s}><i style={{ background: CAPA_STATUS_COLORS[s] }} />{s}</span>)}
                  <span><i className="line" style={{ background: '#1d2c6e' }} />Total</span>
                </div>
              </Card>
              <Card title="Kategori CAPA">
                <Donut
                  height={170}
                  legend="bottom"
                  centerLabel="Total CAPA"
                  data={CAPA_CATEGORIES.map((c, i) => ({ name: c, value: catCount[c] ?? 0, color: SERIES[i], href: href({ kategori: c }, `Kategori CAPA: ${c}`) }))}
                />
              </Card>
            </div>

            <div className="grid-2">
              <Card title="Akar penyebab 6M">
                <BarList items={ROOT_CAUSES.map((rc) => ({ label: rc, value: rootCount[rc] ?? 0, href: href({ akarPenyebab: rc }, `Root cause: ${rc}`) })).sort((a, b) => b.value - a.value)} />
              </Card>
              <Card title="CAPA aktif per departemen">
                <BarList color="#d4a73a" items={deptCount.slice(0, 6).map(([d, n]) => ({ label: d, value: n, href: href({ departemen: d, status: ['Open', 'On Progress', 'Overdue'] }, `CAPA aktif ${d}`) }))} />
                {deptCount.length === 0 && <span className="muted">Tidak ada CAPA aktif.</span>}
              </Card>
            </div>

            <Card
              title="Daftar CAPA"
             
              flush
              actions={<SeeAll href={href({}, 'Daftar CAPA')}>Buka tabel lengkap</SeeAll>}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
                <Seg value={tab} onChange={setTab} options={['Semua', ...CAPA_STATUSES].map((s) => [s, s, s === 'Semua' ? rows.length : by[s] ?? 0])} />
              </div>
              <div className="table-wrapper" style={{ maxHeight: 430, overflowY: 'auto' }}>
                <table>
                  <thead><tr><th>No. CAPA</th><th>Masalah</th><th>Kategori</th><th>Target</th><th>Status</th><th>Progres</th></tr></thead>
                  <tbody>
                    {list.slice(0, 40).map((r) => (
                      <tr key={r.id} className="clickable" onClick={() => setSelectedId(r.id)} style={selected?.id === r.id ? { background: 'var(--brand-50)' } : undefined}>
                        <td><div className="cell-code">{r.id}</div><div className="cell-sub nowrap">{fmtDate(r.tanggal)}</div></td>
                        <td><div className="cell-title">{r.masalah}</div><div className="cell-sub">{r.departemen}, {r.detailAkar}</div></td>
                        <td><Badge value={r.kategori}>{r.kategori}</Badge></td>
                        <td className="nowrap">{fmtDate(r.target)}</td>
                        <td><Badge value={r.status} /></td>
                        <td style={{ minWidth: 104 }}><Progress value={r.progress} /></td>
                      </tr>
                    ))}
                    {list.length === 0 && <tr><td colSpan={6} className="cell-empty">Tidak ada CAPA.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="stack">
            <Card title="Status CAPA">
              <Donut
                height={150}
                centerLabel="Total"
                data={CAPA_STATUSES.map((s) => ({ name: s, value: by[s] ?? 0, color: CAPA_STATUS_COLORS[s], href: href({ status: s }, `Status CAPA: ${s}`) }))}
              />
            </Card>

            {selected && (
              <Card
                title="Detail CAPA"
                actions={<Badge value={selected.status} />}
                footer={<Link className="btn btn-primary btn-sm" href={drillHref('capa', { id: selected.id }, { open: selected.id })}>Buka detail lengkap <ExternalLink /></Link>}
              >
                <dl className="detail-grid" style={{ gridTemplateColumns: '1fr' , gap: 10 }}>
                  <div><dt>No. CAPA</dt><dd className="cell-code">{selected.id}</dd></div>
                  <div><dt>Masalah / temuan</dt><dd>{selected.masalah}</dd></div>
                  <div><dt>Akar penyebab</dt><dd>{selected.akarPenyebab}: {selected.detailAkar}</dd></div>
                  <div><dt>Tindakan</dt><dd>{selected.tindakan}</dd></div>
                  <div className="grid-2" style={{ gap: 10 }}>
                    <div><dt>PIC</dt><dd>{selected.pic}</dd></div>
                    <div><dt>Target</dt><dd>{fmtDate(selected.target)}</dd></div>
                    <div><dt>Sumber</dt><dd>{selected.sumber}</dd></div>
                    <div><dt>Departemen</dt><dd>{selected.departemen}</dd></div>
                  </div>
                  <div><dt>Progres, tahap {selected.tahapKe}/7 ({selected.tahap})</dt><dd><Progress value={selected.progress} /></dd></div>
                </dl>
                <div className="section-label" style={{ marginTop: 14 }}>Tahapan</div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {CAPA_STEPS.map((s, i) => {
                    const done = i + 1 < selected.tahapKe || selected.status === 'Closed';
                    const now = i + 1 === selected.tahapKe && selected.status !== 'Closed';
                    return (
                      <div key={s} className="flex items-center justify-between" style={{ fontSize: 13 }}>
                        <span>{i + 1}. {s}</span>
                        {done ? <span className="badge badge-success">Selesai</span> : now ? <span className="badge badge-warning">Berjalan</span> : <span className="badge badge-gray">Belum</span>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card title="Efektivitas penyelesaian">
              <div style={{ display: 'grid', gap: 14 }}>
                <Link href={href({ status: 'Closed', efektivitas: 'Efektif' }, 'CAPA efektif')} className="flex justify-between items-center" style={{ color: 'inherit' }}>
                  <span className="muted">Terverifikasi efektif</span><b>{pct(effective, closed.length)}%</b>
                </Link>
                <Progress value={pct(effective, closed.length)} showLabel={false} />
                <div className="flex justify-between"><span className="muted">Selesai tepat waktu</span><b>{pct(onTime, closed.length)}%</b></div>
                <Progress value={pct(onTime, closed.length)} showLabel={false} />
                <div className="flex justify-between"><span className="muted">Rata-rata waktu penutupan</span><b>{fmtNum(avgDays)} hari</b></div>
              </div>
            </Card>
          </div>
        </div>

        <Card title="Proses CAPA">
          <div className="flow">
            {CAPA_STEPS.map((s, i) => {
              const n = rows.filter((r) => r.tahapKe === i + 1).length;
              return (
                <Link key={s} href={href({ tahap: s }, `Tahap CAPA: ${s}`)} className="flow-step">
                  <div className="flow-num" style={{ background: STEP_COLORS[i], color: '#fff' }}>{i + 1}</div>
                  <h4>{s}</h4>
                  <div className="flow-count">{n} CAPA</div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card title="Integrasi sumber CAPA">
          <div className="flow">
            {Object.keys(SOURCE_ICONS).map((s) => {
              const Icon = SOURCE_ICONS[s];
              return (
                <Link key={s} href={href({ sumber: s }, `Sumber CAPA: ${s}`)} className="flow-step">
                  <div className="flow-num tone-blue"><Icon size={16} /></div>
                  <h4>{s}</h4>
                  <div className="flow-count">{sourceCount[s] ?? 0} CAPA</div>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
