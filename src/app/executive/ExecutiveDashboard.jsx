'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, ShieldAlert, Lightbulb, FileCheck2, ArrowUp, ArrowDown, Minus, CheckCircle2, Search } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, Gauge, Kpi, PageHeader, Seg, SeeAll, Progress } from '@/components/ui';
import { BarList, Donut, Sparkline, TrendLines } from '@/components/charts';
import { kpis, kpiMonthly, policies, readReceipts, PERSPECTIVES, perspectiveScore, scoreLabel, SIGN_FLOW, STRATEGY_MAP } from '@/lib/data/executive';
import { risks } from '@/lib/data/risk';
import { pestelIssues, PESTEL_FACTORS } from '@/lib/data/pestel';
import { MONTHS, countBy, fmtDate, fmtNum, monthLabel, monthShort, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('executive');
const TREND_KPIS = [
  { kode: 'FIN-01', label: 'Pendapatan', color: '#3b5bdb' },
  { kode: 'FIN-02', label: 'Profit margin', color: '#5f6f86' },
  { kode: 'CUS-01', label: 'Customer satisfaction', color: '#d4a73a' },
  { kode: 'CUS-02', label: 'On-time delivery', color: '#8fa2e6' },
];
const POLICY_TABS = ['Semua', 'Aktif', 'Revisi', 'Draft', 'Kadaluarsa'];
const RR_COLORS = { 'Sudah Dibaca': '#2f8a5f', 'Belum Dibaca': '#d4a73a', 'Gagal Terkirim': '#c2453d' };

export default function ExecutiveDashboard() {
  const router = useRouter();
  const [persp, setPersp] = useState('Semua');
  const [polTab, setPolTab] = useState('Semua');
  const [polQ, setPolQ] = useState('');

  const kpiStatus = countBy(kpis, 'status');
  const riskOnly = risks.filter((r) => r.jenis === 'Risiko' && r.status !== 'Closed');
  const riskLv = countBy(riskOnly, 'level');
  const opps = risks.filter((r) => r.jenis === 'Peluang');
  const oppSt = countBy(opps, 'status');
  const polSt = countBy(policies, 'status');

  const trend = MONTHS.map((m) => ({
    label: monthShort(m),
    bulan: m,
    ...Object.fromEntries(TREND_KPIS.map((t) => [t.label, kpiMonthly.find((k) => k.kode === t.kode && k.bulan === m).capaian])),
  }));

  const kpiList = persp === 'Semua' ? kpis : kpis.filter((k) => k.perspektif === persp);
  const topRisks = [...riskOnly].sort((a, b) => b.skor - a.skor).slice(0, 5);
  const polList = policies.filter((p) => (polTab === 'Semua' || p.status === polTab) && (!polQ || p.nama.toLowerCase().includes(polQ.toLowerCase())));
  const rrSt = countBy(readReceipts, 'status');
  const rrMethod = Object.entries(countBy(readReceipts, 'metode')).sort((a, b) => b[1] - a[1]);
  const pestelBy = countBy(pestelIssues.filter((i) => i.status !== 'Closed'), 'faktor');
  const lagging = kpis.filter((k) => k.status !== 'Tercapai').sort((a, b) => a.capaian - b.capaian);

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Executive Quality Dashboard & Digital Policy"
        actions={<span className="chip">Realisasi per Oktober 2026, YTD 2026</span>}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total KPI" value={kpis.length} icon={Target} tone="blue" href={drillHref('kpi', {}, { src: 'KPI Total KPI' })} hint={`${kpiStatus.Tercapai} tercapai (${pct(kpiStatus.Tercapai, kpis.length, 0)}%)`} />
          <Kpi label="Risk register (aktif)" value={riskOnly.length} icon={ShieldAlert} tone="red" href={drillHref('risks', { jenis: 'Risiko', status: ['Open', 'Mitigasi', 'Monitoring'] }, { from: 'executive', src: 'KPI Risk register' })} hint={`Extreme ${riskLv.Extreme ?? 0}, High ${riskLv.High ?? 0}, Med ${riskLv.Medium ?? 0}, Low ${riskLv.Low ?? 0}`} />
          <Kpi label="Opportunity" value={opps.length} icon={Lightbulb} tone="sun" href={drillHref('risks', { jenis: 'Peluang' }, { from: 'executive', src: 'KPI Opportunity' })} hint={`On progress ${oppSt['On Progress'] ?? 0}, Terealisasi ${oppSt.Terealisasi ?? 0}`} />
          <Kpi label="Kebijakan aktif" value={polSt.Aktif ?? 0} icon={FileCheck2} tone="lilac" href={drillHref('policies', { status: 'Aktif' }, { src: 'KPI Kebijakan aktif' })} hint={`${pct(rrSt['Sudah Dibaca'], readReceipts.length)}% tersosialisasi`} />
        </div>

        <div className="grid-2">
          <Card title="Kinerja bisnis">
            <div className="gauge-grid">
              {PERSPECTIVES.map((p) => {
                const v = perspectiveScore(p.key);
                return (
                  <Link key={p.key} href={drillHref('kpi', { perspektif: p.key }, { src: `Business performance, ${p.label}` })} className="gauge">
                    <span className="gauge-name">{p.label}</span>
                    <Gauge value={v} size={86} />
                    <Badge value={scoreLabel(v)} />
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card title="Tren pencapaian KPI utama">
            <TrendLines
              data={trend}
              height={220}
              unit="%"
              target={100}
              yDomain={[80, 110]}
              yTicks={[80, 90, 100, 110]}
              series={TREND_KPIS.map((t) => ({ key: t.label, color: t.color }))}
              hrefFor={(row) => drillHref('kpi-monthly', { bulan: row.bulan, kode: TREND_KPIS.map((t) => t.kode) }, { src: `Tren KPI utama ${monthLabel(row.bulan)}` })}
            />
            <div className="legend-inline" style={{ marginTop: 6 }}>
              {TREND_KPIS.map((t) => <span key={t.kode}><i className="line" style={{ background: t.color }} />{t.label}</span>)}
            </div>
          </Card>
        </div>

        <div className="grid-main-side">
          <Card title="Executive quality scorecard" flush actions={<SeeAll href={drillHref('kpi', persp === 'Semua' ? {} : { perspektif: persp })} />}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={persp} onChange={setPersp} options={[['Semua', 'Semua', kpis.length], ...PERSPECTIVES.map((p) => [p.key, p.label, kpis.filter((k) => k.perspektif === p.key).length])]} />
            </div>
            <div className="table-wrapper fill-scroll">
              <table>
                <thead><tr><th>KPI utama</th><th className="num">Target</th><th className="num">Realisasi</th><th>Capaian</th><th>Tren 10 bulan</th><th className="center">Arah</th></tr></thead>
                <tbody>
                  {kpiList.map((k) => (
                    <tr key={k.kode} className="clickable" onClick={() => router.push(drillHref('kpi-monthly', { kode: k.kode }, { src: `Scorecard, ${k.kpi}` }))}>
                      <td><div className="cell-title">{k.kpi}</div><div className="cell-sub">{k.kode}, {k.satuan}</div></td>
                      <td className="num">{fmtNum(k.target, k.decimals)}</td>
                      <td className="num"><b>{fmtNum(k.realisasi, k.decimals)}</b></td>
                      <td><Badge value={k.status}>{fmtNum(k.capaian, 0)}%</Badge></td>
                      <td><Sparkline values={k.values} width={96} height={26} color={k.status === 'Tercapai' ? '#2f8a5f' : k.status === 'Perlu Perhatian' ? '#d4a73a' : '#c2453d'} /></td>
                      <td className="center">
                        {k.tren === 'Membaik' ? <ArrowUp size={16} color="var(--green-600)" style={{ margin: 'auto' }} /> : k.tren === 'Menurun' ? <ArrowDown size={16} color="var(--red-600)" style={{ margin: 'auto' }} /> : <Minus size={16} color="var(--gray-400)" style={{ margin: 'auto' }} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="stack">
            <Card title="Risiko utama" flush actions={<SeeAll href={drillHref('risks', { jenis: 'Risiko', level: ['Extreme', 'High'] }, { from: 'executive' })} />}>
              <div className="feed">
                {topRisks.map((r) => (
                  <Link key={r.id} href={drillHref('risks', { id: r.id }, { open: r.id, from: 'executive' })} className="feed-item">
                    <span className="feed-body"><strong>{r.deskripsi}</strong><br />{r.departemen}, skor {r.skor}</span>
                    <span style={{ display: 'grid', gap: 4, justifyItems: 'end' }}><Badge value={r.level} /><Badge value={r.status} plain /></span>
                  </Link>
                ))}
              </div>
            </Card>
            <Card title="Ringkasan">
              <p style={{ fontSize: 13.5, color: 'var(--gray-700)' }}>
                {kpiStatus.Tercapai} dari {kpis.length} KPI strategis tercapai bulan ini. Perlu perhatian khusus pada{' '}
                {lagging.slice(0, 2).map((k, i) => (
                  <span key={k.kode}>{i > 0 && ' dan '}<Link href={drillHref('kpi-monthly', { kode: k.kode })}><b>{k.kpi.toLowerCase()}</b></Link> ({fmtNum(k.capaian, 0)}%)</span>
                ))}.
              </p>
            </Card>
          </div>
        </div>

        <div className="grid-2">
          <Card title="Isu strategis PESTEL">
            <div className="factor-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              {PESTEL_FACTORS.map((f) => (
                <Link key={f.key} href={drillHref('pestel', { faktor: f.key, status: ['Prioritas', 'On Progress', 'Monitoring'] }, { from: 'executive', src: `Isu strategis, ${f.key}` })} className="factor-card" style={{ padding: 12 }}>
                  <div className="factor-head"><span className="factor-letter" style={{ width: 26, height: 26, fontSize: 12.5 }}>{f.letter}</span><span className="factor-name">{f.label}</span></div>
                  <span className="factor-count" style={{ fontSize: 20 }}>{pestelBy[f.key] ?? 0}</span>
                </Link>
              ))}
            </div>
          </Card>
          <Card title="Peta strategi & inisiatif">
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--brand-600)', color: '#fff', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 10 }}>
              Visi: {STRATEGY_MAP.vision}
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {STRATEGY_MAP.rows.map((row) => {
                const p = PERSPECTIVES.find((x) => x.key === row.key);
                return (
                  <div key={row.key} style={{ display: 'grid', gridTemplateColumns: '110px repeat(3, minmax(0, 1fr))', gap: 6 }}>
                    <Link href={drillHref('kpi', { perspektif: row.key })} style={{ background: p.color, color: '#fff', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, fontWeight: 600 }}>{p.label}<div style={{ fontWeight: 400, opacity: 0.85, fontSize: 11.5 }}>{p.sub}</div></Link>
                    {row.items.map((it) => <div key={it} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '8px 10px', fontSize: 12.5, display: 'grid', placeItems: 'center', textAlign: 'center', background: 'var(--gray-25)' }}>{it}</div>)}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid-main-side">
          <Card title="Digital policy management" flush actions={<SeeAll href={drillHref('policies', polTab === 'Semua' ? {} : { status: polTab })} />}>
            <div className="toolbar" style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={polTab} onChange={setPolTab} options={POLICY_TABS.map((t) => [t, t, t === 'Semua' ? policies.length : polSt[t] ?? 0])} />
              <div className="spacer" />
              <div className="search-field" style={{ maxWidth: 240 }}>
                <Search aria-hidden />
                <input className="form-input" value={polQ} onChange={(e) => setPolQ(e.target.value)} placeholder="Cari kebijakan" aria-label="Cari kebijakan" />
              </div>
            </div>
            <div className="table-wrapper fill-scroll">
              <table>
                <thead><tr><th>No</th><th>Nama kebijakan</th><th>Versi</th><th>Status</th><th>Tgl berlaku</th><th>Dibaca</th></tr></thead>
                <tbody>
                  {polList.map((p) => (
                    <tr key={p.id} className="clickable" onClick={() => router.push(drillHref('policies', { id: p.id }, { open: p.id }))}>
                      <td className="cell-code">{p.id}</td>
                      <td><div className="cell-title">{p.nama}</div><div className="cell-sub">{p.kategori}, {p.pemilik}</div></td>
                      <td>{p.versi}</td>
                      <td><Badge value={p.status} /></td>
                      <td className="nowrap">{fmtDate(p.tglBerlaku)}</td>
                      <td style={{ minWidth: 120 }}>{p.penerima ? <Progress value={p.persenBaca} /> : <span className="muted">Belum didistribusikan</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="stack">
            <Card title="Distribusi & read receipt">
              <Donut
                height={140}
                centerValue={`${pct(rrSt['Sudah Dibaca'], readReceipts.length, 0)}%`}
                centerLabel="Tingkat baca"
                data={Object.keys(RR_COLORS).map((s) => ({ name: s, value: rrSt[s] ?? 0, color: RR_COLORS[s], href: drillHref('read-receipts', { status: s }, { src: `Read receipt, ${s}` }) }))}
              />
              <div className="section-label" style={{ marginTop: 14 }}>Metode distribusi</div>
              <BarList items={rrMethod.map(([m, n]) => ({ label: m, value: n, href: drillHref('read-receipts', { metode: m }, { src: `Metode distribusi, ${m}` }) }))} color="#8fa2e6" />
            </Card>
            <Card title="E-signature & persetujuan">
              <div style={{ display: 'grid', gap: 10 }}>
                {SIGN_FLOW.map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <CheckCircle2 size={20} color="var(--green-500)" />
                    <div style={{ flex: 1, fontSize: 13 }}><b>{s.step}</b>, {s.who}</div>
                    <span className="muted" style={{ fontSize: 12 }}>{s.at}</span>
                  </div>
                ))}
                <div className="alert-success" style={{ fontSize: 12.5, padding: '8px 10px', borderRadius: 8, background: 'var(--green-50)', color: 'var(--green-700)' }}>
                  Dokumen telah ditandatangani secara elektronik, ID DS-2026-000123
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
