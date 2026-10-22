'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Flame, Lightbulb, Target, AlertTriangle, Grid3x3, Layers, Building2, ListChecks, Crosshair, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Kpi, PageHeader, Progress, Seg, SeeAll } from '@/components/ui';
import { BarList, Donut, StackedBars } from '@/components/charts';
import { risks, okrs, OBJECTIVES, LEVEL_COLORS, RISK_LEVELS, levelOf } from '@/lib/data/risk';
import { countBy, avgBy, fmtNum, fmtDate, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('risk');
const OKR_COLORS = { Tercapai: '#2f8a5f', 'On Track': '#3b5bdb', 'At Risk': '#d4a73a', 'Belum Tercapai': '#c2453d' };
const heatClass = (s) => (s >= 20 ? 'heat-ext' : s >= 10 ? 'heat-high' : s >= 5 ? 'heat-med' : 'heat-low');

export default function RiskDashboard() {
  const router = useRouter();
  const [dept, setDept] = useState('');
  const [kategori, setKategori] = useState('');
  const [mode, setMode] = useState('inherent');
  const [obj, setObj] = useState(OBJECTIVES[0]);

  const base = { ...(dept && { departemen: dept }), ...(kategori && { kategori }) };
  const all = useMemo(() => risks.filter((r) => (!dept || r.departemen === dept) && (!kategori || r.kategori === kategori)), [dept, kategori]);
  const riskRows = all.filter((r) => r.jenis === 'Risiko');
  const active = riskRows.filter((r) => r.status !== 'Closed');
  const opps = all.filter((r) => r.jenis === 'Peluang');
  const lv = countBy(active, 'level');
  const href = (extra = {}, src) => drillHref('risks', { ...base, ...extra }, { src });

  const lKey = mode === 'inherent' ? 'kemungkinan' : 'residualKemungkinan';
  const iKey = mode === 'inherent' ? 'dampak' : 'residualDampak';
  const cell = (l, i) => active.filter((r) => r[lKey] === l && r[iKey] === i).length;

  const cats = [...new Set(active.map((r) => r.kategori))];
  const byCat = cats.map((c) => ({ label: c, kategori: c, ...Object.fromEntries(RISK_LEVELS.map((l) => [l, active.filter((r) => r.kategori === c && r.level === l).length])) }))
    .sort((a, b) => RISK_LEVELS.reduce((s, l) => s + b[l], 0) - RISK_LEVELS.reduce((s, l) => s + a[l], 0));
  const byDept = Object.entries(countBy(active, 'departemen')).sort((a, b) => b[1] - a[1]);
  const byStatus = countBy(active, 'status');
  const residualLv = countBy(active, 'residualLevel');
  const reduced = active.filter((r) => r.residualSkor < r.skor).length;

  const okrSt = countBy(okrs, 'status');
  const objectives = OBJECTIVES.map((o) => {
    const krs = okrs.filter((k) => k.objective === o);
    return { o, krs, progress: Math.round(avgBy(krs, (k) => Math.min(100, k.progress))) };
  });
  const sel = objectives.find((x) => x.o === obj);

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Risk Register & OKR"
        actions={(
          <DashFilters
            onReset={() => { setDept(''); setKategori(''); }}
            filters={[
              { key: 'dept', label: 'Departemen', value: dept, onChange: setDept, options: [...new Set(risks.map((r) => r.departemen))].sort() },
              { key: 'kat', label: 'Kategori', value: kategori, onChange: setKategori, options: [...new Set(risks.map((r) => r.kategori))].sort() },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Risiko aktif" value={active.length} icon={ShieldAlert} tone="blue" href={href({ jenis: 'Risiko', status: ['Open', 'Mitigasi', 'Monitoring'] }, 'KPI Risiko aktif')} hint={`${riskRows.length - active.length} sudah closed`} />
          <Kpi label="Extreme & High" value={(lv.Extreme ?? 0) + (lv.High ?? 0)} icon={Flame} tone="red" href={href({ jenis: 'Risiko', level: ['Extreme', 'High'], status: ['Open', 'Mitigasi', 'Monitoring'] }, 'KPI Extreme & High')} hint={`Extreme ${lv.Extreme ?? 0}, High ${lv.High ?? 0}`} />
          <Kpi label="Peluang" value={opps.length} icon={Lightbulb} tone="sun" href={href({ jenis: 'Peluang' }, 'KPI Peluang')} hint={`${opps.filter((o) => o.status === 'Terealisasi').length} terealisasi`} />
          <Kpi label="Risiko turun setelah kontrol" value={`${pct(reduced, active.length, 0)}%`} icon={Crosshair} tone="mint" href={href({ jenis: 'Risiko' }, 'Risiko residual')} hint="setelah pengendalian" />
          <Kpi label="Progres OKR" value={`${Math.round(avgBy(okrs, (k) => Math.min(100, k.progress)))}%`} icon={Target} tone="lilac" href={drillHref('okr', {}, { src: 'KPI Progres OKR' })} hint={`${okrSt.Tercapai ?? 0} dari ${okrs.length} key result tercapai`} />
        </div>

        <div className="grid-2">
          <Card
            title="Heatmap risiko"
           
            icon={Grid3x3}
            actions={<Seg value={mode} onChange={setMode} options={[['inherent', 'Inherent'], ['residual', 'Residual']]} />}
          >
            <div className="heatmap">
              {[5, 4, 3, 2, 1].map((l) => (
                <div key={l} style={{ display: 'contents' }}>
                  <span className="axis">{l}</span>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const n = cell(l, i);
                    const label = `Kemungkinan ${l}, dampak ${i} (${levelOf(l * i)})`;
                    return n ? (
                      <button
                        key={i}
                        type="button"
                        className={`heat-cell ${heatClass(l * i)}`}
                        title={`${label}: ${n} risiko`}
                        onClick={() => router.push(href({ jenis: 'Risiko', [lKey]: l, [iKey]: i, status: ['Open', 'Mitigasi', 'Monitoring'] }, `Heatmap ${mode}, ${label}`))}
                      >{n}</button>
                    ) : <span key={i} className={`heat-cell empty ${heatClass(l * i)}`} title={label} />;
                  })}
                </div>
              ))}
              <span />
              {[1, 2, 3, 4, 5].map((i) => <span key={i} className="axis" style={{ paddingTop: 4 }}>{i}</span>)}
            </div>
            <div className="flex justify-between muted" style={{ marginTop: 8, fontSize: 12 }}>
              <span>Kemungkinan</span><span>Dampak</span>
            </div>
            <div className="legend-inline" style={{ marginTop: 10 }}>
              {RISK_LEVELS.map((l) => <span key={l}><i style={{ background: LEVEL_COLORS[l] }} />{l}</span>)}
            </div>
          </Card>
          <div className="stack">
            <Card title="Level risiko residual" icon={Layers}>
              <Donut height={150} centerLabel="Risiko aktif" data={RISK_LEVELS.map((l) => ({ name: l, value: residualLv[l] ?? 0, color: LEVEL_COLORS[l], href: href({ jenis: 'Risiko', residualLevel: l, status: ['Open', 'Mitigasi', 'Monitoring'] }, `Residual ${l}`) }))} />
            </Card>
            <Card title="Status penanganan" icon={ListChecks}>
              <BarList items={['Open', 'Mitigasi', 'Monitoring'].map((s) => ({ label: s, value: byStatus[s] ?? 0, href: href({ jenis: 'Risiko', status: s }, `Status risiko ${s}`), color: s === 'Open' ? '#c2453d' : s === 'Mitigasi' ? '#d4a73a' : '#2c4aa8' }))} />
            </Card>
          </div>
        </div>

        <div className="grid-3-2">
          <Card title="Risiko per kategori & level" subtitle="Klik segmen untuk detail" icon={Layers}>
            <StackedBars
              data={byCat}
              height={260}
              series={RISK_LEVELS.slice().reverse().map((l) => ({ key: l, color: LEVEL_COLORS[l] }))}
              hrefFor={(row, l) => href({ jenis: 'Risiko', kategori: row.kategori, ...(l && { level: l }), status: ['Open', 'Mitigasi', 'Monitoring'] }, `Kategori ${row.kategori}${l ? `, ${l}` : ''}`)}
            />
          </Card>
          <Card title="Risiko aktif per departemen" icon={Building2}>
            <BarList items={byDept.map(([d, n]) => ({ label: d, value: n, href: href({ jenis: 'Risiko', departemen: d, status: ['Open', 'Mitigasi', 'Monitoring'] }, `Risiko ${d}`) }))} color="#b9c3d6" />
          </Card>
        </div>

        <div className="grid-main-side">
          <Card title="Register risiko teratas" icon={AlertTriangle} flush actions={<SeeAll href={href({ jenis: 'Risiko' })} />}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Kode</th><th>Risiko</th><th className="num">Skor</th><th>Level</th><th>Residual</th><th>Status</th><th>Target</th></tr></thead>
                <tbody>
                  {[...active].sort((a, b) => b.skor - a.skor).slice(0, 10).map((r) => (
                    <tr key={r.id} className="clickable" onClick={() => router.push(drillHref('risks', { id: r.id }, { open: r.id }))}>
                      <td className="cell-code">{r.id}</td>
                      <td><div className="cell-title">{r.deskripsi}</div><div className="cell-sub">{r.pengendalian}</div></td>
                      <td className="num"><b>{r.skor}</b></td>
                      <td><Badge value={r.level} /></td>
                      <td><Badge value={r.residualLevel} plain /></td>
                      <td><Badge value={r.status} /></td>
                      <td className="nowrap">{fmtDate(r.target)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Register peluang" icon={Sparkles} flush actions={<SeeAll href={href({ jenis: 'Peluang' })} />}>
            <div className="feed">
              {opps.sort((a, b) => b.skor - a.skor).map((o) => (
                <Link key={o.id} href={drillHref('risks', { id: o.id }, { open: o.id })} className="feed-item">
                  <span className="feed-icon tone-sun"><Lightbulb /></span>
                  <span className="feed-body"><strong>{o.deskripsi}</strong><br />{o.pengendalian}</span>
                  <Badge value={o.status} />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid-1-2">
          <Card title="Status sasaran (OKR)" subtitle="Seluruh key result FY 2026" icon={Target}>
            <Donut
              height={160}
              centerValue={`${pct((okrSt.Tercapai ?? 0) + (okrSt['On Track'] ?? 0), okrs.length, 0)}%`}
              centerLabel="On track"
              data={Object.keys(OKR_COLORS).map((s) => ({ name: s, value: okrSt[s] ?? 0, color: OKR_COLORS[s], href: drillHref('okr', { status: s }, { src: `Status OKR, ${s}` }) }))}
            />
          </Card>
          <Card title="Objective & key result" flush actions={<SeeAll href={drillHref('okr', { objective: obj })} />}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)', minHeight: 300 }}>
              <div style={{ borderRight: '1px solid var(--gray-100)', padding: 8, display: 'grid', gap: 4, alignContent: 'start' }}>
                {objectives.map((x) => (
                  <button key={x.o} type="button" onClick={() => setObj(x.o)} className="legend-row" style={{ display: 'grid', gap: 6, background: x.o === obj ? 'var(--brand-50)' : undefined }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-900)' }}>{x.o}</span>
                    <Progress value={x.progress} />
                  </button>
                ))}
              </div>
              <div style={{ padding: 12, display: 'grid', gap: 10, alignContent: 'start' }}>
                {sel.krs.map((k) => (
                  <Link key={k.id} href={drillHref('okr', { id: k.id }, { open: k.id })} className="legend-row" style={{ display: 'grid', gap: 6, border: '1px solid var(--gray-100)' }}>
                    <span className="flex justify-between gap-2"><span style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{k.keyResult}</span><Badge value={k.status} /></span>
                    <span className="muted" style={{ fontSize: 12 }}>Realisasi {fmtNum(k.realisasi, Number.isInteger(k.realisasi) ? 0 : 1)} {k.satuan}, {k.pemilik}</span>
                    <Progress value={k.progress} />
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
