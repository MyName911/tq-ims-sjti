'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BarChart3, CheckCircle2, Flag, Handshake, ListTodo, Search, Target, TrendingUp, Users, Radar, MessagesSquare, Smile } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Kpi, PageHeader, Seg, SeeAll } from '@/components/ui';
import { BarList, Columns, Donut, PowerInterest, SERIES, StackedBars } from '@/components/charts';
import { PESTEL_FACTORS, pestelIssues, stakeholders, stakeholderComms } from '@/lib/data/pestel';
import { LAST6, countBy, fmtDate, fmtNum, monthLabel, monthShort, avgBy } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('pestel');
const ISSUE_STATUSES = ['Prioritas', 'On Progress', 'Monitoring', 'Closed'];

export default function PestelDashboard() {
  const router = useRouter();
  const [jenis, setJenis] = useState('');
  const [dept, setDept] = useState('');
  const [factorTab, setFactorTab] = useState('Political');
  const [stkTab, setStkTab] = useState('Semua');
  const [stkQ, setStkQ] = useState('');
  const [issueTab, setIssueTab] = useState('Semua');

  const base = { ...(jenis && { jenis }), ...(dept && { departemen: dept }) };
  const issues = useMemo(() => pestelIssues.filter((i) => (!jenis || i.jenis === jenis) && (!dept || i.departemen === dept)), [jenis, dept]);
  const href = (extra = {}, src) => drillHref('pestel', { ...base, ...extra }, { src });
  const byStatus = countBy(issues, 'status');
  const byFactor = countBy(issues, 'faktor');

  const trend = LAST6.map((m) => ({ label: monthShort(m), bulan: m, ...Object.fromEntries(PESTEL_FACTORS.map((f) => [f.key, issues.filter((i) => i.bulan === m && i.faktor === f.key).length])) }));
  const top = [...issues].filter((i) => i.status !== 'Closed').sort((a, b) => b.skor - a.skor).slice(0, 6);
  const factor = PESTEL_FACTORS.find((f) => f.key === factorTab);
  const factorIssues = issues.filter((i) => i.faktor === factorTab).sort((a, b) => b.skor - a.skor);
  const tracking = (issueTab === 'Semua' ? issues : issues.filter((i) => i.status === issueTab)).slice().sort((a, b) => ISSUE_STATUSES.indexOf(a.status) - ISSUE_STATUSES.indexOf(b.status) || b.skor - a.skor);

  const stkList = stakeholders.filter((s) => (stkTab === 'Semua' || s.tipe === stkTab) && (!stkQ || `${s.nama} ${s.kategori}`.toLowerCase().includes(stkQ.toLowerCase())));
  const stkCat = Object.entries(countBy(stakeholders, 'kategori')).sort((a, b) => b[1] - a[1]);
  const comms = LAST6.map((m) => ({ label: monthShort(m), bulan: m, value: stakeholderComms.filter((c) => c.bulan === m).length }));
  const satisfaction = Object.entries(countBy(stakeholders, 'kategori')).map(([k]) => ({ label: k, value: avgBy(stakeholders.filter((s) => s.kategori === k), 'kepuasan'), decimals: 1, href: drillHref('stakeholders', { kategori: k }, { src: `Kepuasan stakeholder ${k}` }) })).sort((a, b) => b.value - a.value);

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Dashboard PESTEL & Stakeholder"
        actions={(
          <DashFilters
            onReset={() => { setJenis(''); setDept(''); }}
            filters={[
              { key: 'jenis', label: 'Jenis isu', value: jenis, onChange: setJenis, options: ['Risiko', 'Peluang'] },
              { key: 'dept', label: 'Departemen PIC', value: dept, onChange: setDept, options: [...new Set(pestelIssues.map((i) => i.departemen))].sort() },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total isu PESTEL" value={issues.length} icon={Radar} tone="blue" href={href({}, 'KPI Total isu')} delta={`+${issues.filter((i) => i.bulan === LAST6[5]).length}`} hint="isu baru bulan ini" />
          <Kpi label="Total stakeholder" value={stakeholders.length} icon={Users} tone="mint" href={drillHref('stakeholders', {}, { src: 'KPI Total stakeholder' })} hint={`${countBy(stakeholders, 'tipe').Internal} internal, ${countBy(stakeholders, 'tipe').Eksternal} eksternal`} />
          <Kpi label="Isu prioritas" value={byStatus.Prioritas ?? 0} icon={Flag} tone="red" href={href({ status: 'Prioritas' }, 'KPI Isu prioritas')} hint="perlu tindak lanjut" />
          <Kpi label="Tindakan berjalan" value={byStatus['On Progress'] ?? 0} icon={ListTodo} tone="lilac" href={href({ status: 'On Progress' }, 'KPI Tindakan berjalan')} />
          <Kpi label="Tindakan selesai" value={byStatus.Closed ?? 0} icon={CheckCircle2} tone="mint" href={href({ status: 'Closed' }, 'KPI Tindakan selesai')} />
        </div>

        <Card title="PESTEL overview" icon={BarChart3}>
          <div className="factor-grid">
            {PESTEL_FACTORS.map((f) => {
              const list = issues.filter((i) => i.faktor === f.key).sort((a, b) => b.skor - a.skor);
              return (
                <Link key={f.key} href={href({ faktor: f.key }, `PESTEL overview, ${f.key}`)} className="factor-card">
                  <div className="factor-head">
                    <span className="factor-letter">{f.letter}</span>
                    <span className="factor-name">{f.label}</span>
                  </div>
                  <span className="factor-count">{byFactor[f.key] ?? 0}</span>
                  <ul>{list.slice(0, 3).map((i) => <li key={i.id}>{i.isu}</li>)}</ul>
                  <span className="factor-more">Lihat detail <ArrowRight size={13} /></span>
                </Link>
              );
            })}
          </div>
        </Card>

        <div className="grid-2">
          <Card title="Tren isu PESTEL" icon={TrendingUp}>
            <StackedBars
              data={trend}
              height={250}
              series={PESTEL_FACTORS.map((f) => ({ key: f.key, color: f.color }))}
              hrefFor={(row, f) => href({ bulan: row.bulan, ...(f && { faktor: f }) }, `Tren isu ${monthLabel(row.bulan)}${f ? `, ${f}` : ''}`)}
            />
            <div className="legend-inline" style={{ marginTop: 8 }}>
              {PESTEL_FACTORS.map((f) => <span key={f.key}><i style={{ background: f.color }} />{f.key}</span>)}
            </div>
          </Card>
          <Card title="Isu PESTEL teratas" icon={Target} actions={<SeeAll href={href({ status: ['Prioritas', 'On Progress', 'Monitoring'] }, 'Isu aktif')} />} flush>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Isu</th><th>Faktor</th><th className="num">Skor</th><th>Status</th></tr></thead>
                <tbody>
                  {top.map((i) => (
                    <tr key={i.id} className="clickable" onClick={() => router.push(drillHref('pestel', { id: i.id }, { open: i.id }))}>
                      <td><div className="cell-title">{i.isu}</div><div className="cell-sub">{i.departemen}, {i.pic}</div></td>
                      <td><Badge value={i.faktor} plain /></td>
                      <td className="num"><b>{i.skor}</b></td>
                      <td><Badge value={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid-3-2">
          <Card
            title="Stakeholder portal"
           
            icon={Handshake}
            flush
            actions={<SeeAll href={drillHref('stakeholders', stkTab === 'Semua' ? {} : { tipe: stkTab })} />}
          >
            <div className="toolbar" style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={stkTab} onChange={setStkTab} options={[['Semua', 'Semua', stakeholders.length], ['Internal', 'Internal', countBy(stakeholders, 'tipe').Internal], ['Eksternal', 'Eksternal', countBy(stakeholders, 'tipe').Eksternal]]} />
              <div className="spacer" />
              <div className="search-field" style={{ maxWidth: 240 }}>
                <Search aria-hidden />
                <input className="form-input" value={stkQ} onChange={(e) => setStkQ(e.target.value)} placeholder="Cari nama / instansi" aria-label="Cari stakeholder" />
              </div>
            </div>
            <div className="table-wrapper" style={{ maxHeight: 360, overflowY: 'auto' }}>
              <table>
                <thead><tr><th>Stakeholder</th><th>Kategori</th><th>Pengaruh</th><th>Kepentingan</th><th>Status komunikasi</th></tr></thead>
                <tbody>
                  {stkList.map((s) => (
                    <tr key={s.id} className="clickable" onClick={() => router.push(drillHref('stakeholders', { id: s.id }, { open: s.id }))}>
                      <td><div className="cell-title">{s.nama}</div><div className="cell-sub">{s.kuadran}</div></td>
                      <td>{s.kategori}</td>
                      <td><Badge value={s.pengaruh >= 7 ? 'Tinggi' : s.pengaruh >= 5 ? 'Sedang' : 'Rendah'} /></td>
                      <td><Badge value={s.kepentingan >= 7 ? 'Tinggi' : s.kepentingan >= 5 ? 'Sedang' : 'Rendah'} /></td>
                      <td><Badge value={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Peta pengaruh & kepentingan">
            <PowerInterest data={stakeholders} height={330} hrefFor={(s) => drillHref('stakeholders', { id: s.id }, { open: s.id })} />
            <div className="legend-inline" style={{ justifyContent: 'center' }}>
              <span><i style={{ background: '#3b5bdb', borderRadius: '50%' }} />Internal</span>
              <span><i style={{ background: '#d4a73a', borderRadius: '50%' }} />Eksternal</span>
              <span><i style={{ background: '#eef1fb' }} />Kelola ketat</span>
              <span><i style={{ background: '#f7f4ea' }} />Jaga kepuasan</span>
              <span><i style={{ background: '#f2f4f8' }} />Jaga informasi</span>
            </div>
          </Card>
        </div>

        <div className="grid-3-2">
          <Card title="Detail analisis PESTEL" subtitle={`${factorIssues.length} isu ${factor.label.toLowerCase()}, urut berdasarkan skor`} flush actions={<SeeAll href={href({ faktor: factorTab })} />}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={factorTab} onChange={setFactorTab} options={PESTEL_FACTORS.map((f) => [f.key, f.key, byFactor[f.key] ?? 0])} />
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Isu</th><th>Dampak</th><th>Jenis</th><th>Status</th><th>Rekomendasi strategi</th></tr></thead>
                <tbody>
                  {factorIssues.map((i) => (
                    <tr key={i.id} className="clickable" onClick={() => router.push(drillHref('pestel', { id: i.id }, { open: i.id }))}>
                      <td className="cell-title">{i.isu}</td>
                      <td><Badge value={i.dampak} /></td>
                      <td><Badge value={i.jenis} plain /></td>
                      <td><Badge value={i.status} /></td>
                      <td className="cell-sub" style={{ maxWidth: 260 }}>{i.tindakan}</td>
                    </tr>
                  ))}
                  {factorIssues.length === 0 && <tr><td colSpan={5} className="cell-empty">Tidak ada isu untuk filter ini.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Issue tracking" flush actions={<SeeAll href={href(issueTab === 'Semua' ? {} : { status: issueTab })} />}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={issueTab} onChange={setIssueTab} options={['Semua', ...ISSUE_STATUSES].map((s) => [s, s, s === 'Semua' ? issues.length : byStatus[s] ?? 0])} />
            </div>
            <div className="feed" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {tracking.slice(0, 12).map((i) => (
                <Link key={i.id} href={drillHref('pestel', { id: i.id }, { open: i.id })} className="feed-item">
                  <span className="feed-icon tone-blue" style={{ fontWeight: 700, fontSize: 13 }}>{i.faktor[0]}</span>
                  <span className="feed-body"><strong>{i.isu}</strong><br />{i.pic}, target {fmtDate(i.target)}</span>
                  <Badge value={i.status} />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid-3">
          <Card title="Komposisi stakeholder" icon={Users}>
            <Donut height={150} centerLabel="Stakeholder" data={stkCat.slice(0, 7).map(([k, n], i) => ({ name: k, value: n, color: SERIES[i], href: drillHref('stakeholders', { kategori: k }, { src: `Komposisi stakeholder, ${k}` }) }))} legend="bottom" />
          </Card>
          <Card title="Komunikasi stakeholder" icon={MessagesSquare}>
            <Columns data={comms} height={210} color="#5f6f86" name="Interaksi" hrefFor={(d) => drillHref('stakeholder-comms', { bulan: d.bulan }, { src: `Komunikasi ${monthLabel(d.bulan)}` })} />
            <div className="muted" style={{ marginTop: 6 }}>{fmtNum(stakeholderComms.filter((c) => c.hasil === 'Perlu Tindak Lanjut').length)} interaksi perlu tindak lanjut, <Link href={drillHref('stakeholder-comms', { hasil: 'Perlu Tindak Lanjut' })}>lihat</Link></div>
          </Card>
          <Card title="Survey kepuasan stakeholder" icon={Smile}>
            <BarList items={satisfaction.slice(0, 8)} max={5} color="#d4a73a" />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
