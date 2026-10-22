'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, ClipboardCheck, SearchCheck, Wrench, MessageSquareHeart, Star, Camera, CalendarCheck, PlayCircle, ShieldCheck, Flag,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Gauge, Kpi, PageHeader, SeeAll, Stars, Seg } from '@/components/ui';
import { BarList, Donut, StackedBars } from '@/components/charts';
import { audits, findings, feedback, AUDIT_TYPES } from '@/lib/data/audit';
import { capas } from '@/lib/data/capa';
import { LAST6, avgBy, countBy, fmtDate, fmtNum, monthLabel, monthShort, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('audit');
const FIND_COLORS = { Tertutup: '#2f8a5f', 'Dalam Proses': '#d4a73a', Terbuka: '#c2453d' };
const SENT_COLORS = { Positif: '#2f8a5f', Netral: '#d4a73a', Negatif: '#c2453d' };
const AREAS = ['Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Warehouse', 'Maintenance', 'PPIC', 'HR & GA', 'Purchasing'];
const QUESTIONS = [
  'Apakah area kerja dalam kondisi bersih dan rapi (5S)?',
  'Apakah SOP setting line versi terbaru tersedia di line?',
  'Apakah kartu kontrol jarum diisi setiap pergantian jarum?',
];

export default function AuditDashboard() {
  const router = useRouter();
  const [area, setArea] = useState('');
  const [jenis, setJenis] = useState('');
  const [fbTab, setFbTab] = useState('Semua');
  const [answers, setAnswers] = useState({});
  const [qi, setQi] = useState(0);

  const aBase = { ...(area && { area }), ...(jenis && { jenis }) };
  const fBase = { ...(area && { area }), ...(jenis && { jenisAudit: jenis }) };
  const aud = useMemo(() => audits.filter((a) => (!area || a.area === area) && (!jenis || a.jenis === jenis)), [area, jenis]);
  const fnd = useMemo(() => findings.filter((f) => (!area || f.area === area) && (!jenis || f.jenisAudit === jenis)), [area, jenis]);
  const fndIds = new Set(fnd.map((f) => f.id));
  const capaAudit = capas.filter((c) => c.ref && fndIds.has(c.ref));
  const done = aud.filter((a) => a.status !== 'Terjadwal');
  const selesai = aud.filter((a) => a.status === 'Selesai');
  const fst = countBy(fnd, 'status');
  const fb6 = feedback;
  const rating = avgBy(fb6, 'rating');
  const ratingCount = countBy(fb6, 'rating');
  const hrefA = (x = {}, src) => drillHref('audits', { ...aBase, ...x }, { src });
  const hrefF = (x = {}, src) => drillHref('findings', { ...fBase, ...x }, { src });
  // CAPA dari temuan audit ditautkan lewat daftar ID agar jumlahnya persis sama.
  const capaHref = (list, src) => drillHref('capa', { id: list.length ? list.map((c) => c.id) : '-' }, { from: 'audit', src });

  const trend = LAST6.map((m) => ({
    label: monthShort(m),
    bulan: m,
    Audit: done.filter((a) => a.bulan === m).length,
    Temuan: fnd.filter((f) => f.bulan === m).length,
    'Tindakan korektif': capaAudit.filter((c) => c.bulan === m).length,
  }));
  const topArea = Object.entries(countBy(fnd, 'area')).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recentAudits = [...done].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 12);
  const recentFindings = [...fnd].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 12);
  const sentTrend = LAST6.map((m) => ({ label: monthShort(m), bulan: m, ...Object.fromEntries(Object.keys(SENT_COLORS).map((s) => [s, fb6.filter((f) => f.bulan === m && f.sentimen === s).length])) }));
  const fbList = (fbTab === 'Semua' ? fb6 : fb6.filter((f) => f.tipe === fbTab)).slice(0, 8);
  const scheduled = aud.filter((a) => a.status === 'Terjadwal');
  const growth = topArea[0];

  const steps = [
    { n: 'Perencanaan', d: 'Jadwal audit, area & kriteria', icon: CalendarCheck, tone: 'blue', count: `${scheduled.length} terjadwal`, href: hrefA({ status: 'Terjadwal' }, 'Alur, Perencanaan') },
    { n: 'Pelaksanaan', d: 'Audit via tablet / mobile', icon: PlayCircle, tone: 'sky', count: `${aud.filter((a) => a.status === 'Dalam Proses').length} berjalan`, href: hrefA({ status: 'Dalam Proses' }, 'Alur, Pelaksanaan') },
    { n: 'Temuan', d: 'Foto bukti & prioritas', icon: SearchCheck, tone: 'sun', count: `${fnd.length} temuan`, href: hrefF({}, 'Alur, Temuan') },
    { n: 'Tindakan korektif', d: 'PIC & deadline otomatis', icon: Wrench, tone: 'peach', count: `${capaAudit.length} CAPA`, href: capaHref(capaAudit, 'Alur, Tindakan korektif') },
    { n: 'Verifikasi', d: 'Bukti perbaikan diperiksa', icon: ShieldCheck, tone: 'lilac', count: `${fst['Dalam Proses'] ?? 0} diverifikasi`, href: hrefF({ status: 'Dalam Proses' }, 'Alur, Verifikasi') },
    { n: 'Penutupan', d: 'Evaluasi efektivitas', icon: Flag, tone: 'mint', count: `${fst.Tertutup ?? 0} ditutup`, href: hrefF({ status: 'Tertutup' }, 'Alur, Penutupan') },
  ];

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Dashboard E-Audit & Feedback"
        actions={(
          <DashFilters
            onReset={() => { setArea(''); setJenis(''); }}
            filters={[
              { key: 'area', label: 'Area', value: area, onChange: setArea, options: AREAS },
              { key: 'jenis', label: 'Jenis audit', value: jenis, onChange: setJenis, options: AUDIT_TYPES },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total audit" value={done.length} icon={ClipboardList} tone="blue" href={hrefA({ status: ['Selesai', 'Dalam Proses'] }, 'KPI Total audit')} hint={`+${scheduled.length} terjadwal`} />
          <Kpi label="Audit selesai" value={selesai.length} icon={ClipboardCheck} tone="mint" href={hrefA({ status: 'Selesai' }, 'KPI Audit selesai')} hint={`${pct(selesai.length, done.length)}% (target 90%)`} />
          <Kpi label="Temuan" value={fnd.length} icon={SearchCheck} tone="sun" href={hrefF({}, 'KPI Temuan')} hint={`${(fst.Terbuka ?? 0) + (fst['Dalam Proses'] ?? 0)} belum ditutup`} />
          <Kpi label="Tindakan korektif" value={capaAudit.length} icon={Wrench} tone="red" href={capaHref(capaAudit, 'KPI Tindakan korektif')} hint={`${pct(capaAudit.length, fnd.filter((f) => ['Major', 'Minor'].includes(f.kategori)).length)}% NC ditindaklanjuti`} />
          <Kpi label="Feedback pelanggan" value={fb6.length} icon={MessageSquareHeart} tone="lilac" href={drillHref('feedback', {}, { src: 'KPI Feedback pelanggan' })} hint="6 bulan terakhir" />
          <Kpi label="Rating kepuasan" value={fmtNum(rating, 1)} unit="/ 5" icon={Star} tone="mint" href={drillHref('feedback', { rating: ['4', '5'] }, { src: 'KPI Rating kepuasan' })} hint={`${pct((ratingCount[5] ?? 0) + (ratingCount[4] ?? 0), fb6.length)}% puas`} />
        </div>

        <div className="grid-3">
          <Card title="Tren audit, temuan & tindakan korektif" style={{ gridColumn: 'span 2' }}>
            <StackedBars
              data={trend}
              stacked={false}
              height={250}
              series={[{ key: 'Audit', color: '#3b5bdb' }, { key: 'Temuan', color: '#d4a73a' }, { key: 'Tindakan korektif', color: '#5f6f86' }]}
              hrefFor={(row, k) => (k === 'Temuan' ? hrefF({ bulan: row.bulan }, `Temuan ${monthLabel(row.bulan)}`)
                : k === 'Tindakan korektif' ? capaHref(capaAudit.filter((c) => c.bulan === row.bulan), `Tindakan korektif ${monthLabel(row.bulan)}`)
                  : hrefA({ bulan: row.bulan, status: ['Selesai', 'Dalam Proses'] }, `Audit ${monthLabel(row.bulan)}`))}
            />
            <div className="legend-inline"><span><i style={{ background: '#3b5bdb' }} />Audit</span><span><i style={{ background: '#d4a73a' }} />Temuan</span><span><i style={{ background: '#5f6f86' }} />Tindakan korektif (CAPA)</span></div>
          </Card>
          <Card title="Status temuan audit">
            <Donut height={170} legend="bottom" centerLabel="Temuan" data={Object.keys(FIND_COLORS).map((s) => ({ name: s, value: fst[s] ?? 0, color: FIND_COLORS[s], href: hrefF({ status: s }, `Status temuan, ${s}`) }))} />
          </Card>
        </div>

        <div className="grid-3">
          <Card title="Top 5 area dengan temuan terbanyak">
            <BarList items={topArea.map(([a, n]) => ({ label: a, value: n, href: hrefF({ area: a }, `Top area, ${a}`) }))} />
            <div className="section-label">Kategori temuan</div>
            <BarList color="#8fa2e6" items={['Major', 'Minor', 'Observasi', 'OFI'].map((k) => ({ label: k, value: fnd.filter((f) => f.kategori === k).length, href: hrefF({ kategori: k }, `Kategori temuan, ${k}`) }))} />
          </Card>
          <Card title="Rating kepuasan pelanggan">
            <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
              <Gauge value={(rating / 5) * 100} size={96} color="var(--green-500)" />
              <div><div style={{ fontSize: 26, fontWeight: 700 }}>{fmtNum(rating, 1)} <span className="muted">/ 5</span></div><Stars value={Math.round(rating)} /><div className="muted">{fb6.length} ulasan</div></div>
            </div>
            <BarList items={[5, 4, 3, 2, 1].map((r) => ({ label: `${r} ★`, value: ratingCount[r] ?? 0, href: drillHref('feedback', { rating: r }, { src: `Rating ${r} bintang` }), color: r >= 4 ? '#2f8a5f' : r === 3 ? '#d4a73a' : '#c2453d' }))} labelWidth={40} />
          </Card>
          <Card title="Catatan audit">
            <div className="notes">
              {growth && <p>Area <b>{growth[0]}</b> memiliki temuan terbanyak ({growth[1]} temuan). Disarankan audit proses lanjutan dan penguatan inline inspection. <Link href={hrefF({ area: growth[0] })}>Lihat temuan</Link></p>}
              <p><b>{fst.Terbuka ?? 0}</b> temuan masih terbuka dan <b>{fnd.filter((f) => f.terlambat === 'Ya').length}</b> melewati deadline. <Link href={hrefF({ terlambat: 'Ya' })}>Tinjau sekarang</Link></p>
              <p>{pct(fb6.filter((f) => f.sentimen === 'Positif').length, fb6.length)}% feedback bersentimen positif. Komplain didominasi kategori <b>{Object.entries(countBy(fb6.filter((f) => f.tipe === 'Komplain'), 'kategori')).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'}</b>. <Link href={drillHref('feedback', { tipe: 'Komplain' })}>Lihat komplain</Link></p>
            </div>
          </Card>
        </div>

        <div className="grid-2">
          <Card title="Audit terbaru" flush actions={<SeeAll href={hrefA()} />}>
            <div className="table-wrapper fill-scroll" style={{ minHeight: 380 }}>
              <table>
                <thead><tr><th>Tanggal</th><th>Area</th><th>Auditor</th><th>Status</th><th className="num">Skor</th></tr></thead>
                <tbody>
                  {recentAudits.map((a) => (
                    <tr key={a.id} className="clickable" onClick={() => router.push(drillHref('audits', { id: a.id }, { open: a.id }))}>
                      <td className="nowrap">{fmtDate(a.tanggal)}</td>
                      <td><div className="cell-title">{a.area}</div><div className="cell-sub">{a.jenis}</div></td>
                      <td>{a.auditor}</td>
                      <td><Badge value={a.status} /></td>
                      <td className="num">{a.skor ? <Badge value={a.skor >= 90 ? 'Baik' : 'Cukup'}>{a.skor}%</Badge> : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Temuan terbaru" flush actions={<SeeAll href={hrefF()} />}>
            <div className="table-wrapper fill-scroll" style={{ minHeight: 380 }}>
              <table>
                <thead><tr><th>Area</th><th>Deskripsi temuan</th><th>Prioritas</th><th>Status</th></tr></thead>
                <tbody>
                  {recentFindings.map((f) => (
                    <tr key={f.id} className="clickable" onClick={() => router.push(drillHref('findings', { id: f.id }, { open: f.id }))}>
                      <td>{f.area}</td>
                      <td><div className="cell-title">{f.deskripsi}</div><div className="cell-sub">{f.kategori}, Klausul {f.klausul}</div></td>
                      <td><Badge value={f.prioritas} /></td>
                      <td><Badge value={f.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <Card title="Alur E-Audit">
          <div className="flow">
            {steps.map((s, i) => (
              <Link key={s.n} href={s.href} className="flow-step">
                <div className={`flow-num tone-${s.tone}`}><s.icon size={16} /></div>
                <h4>{i + 1}. {s.n}</h4>
                <p>{s.d}</p>
                <div className="flow-count">{s.count}</div>
              </Link>
            ))}
          </div>
        </Card>

        <div className="grid-3">
          <Card title="Feedback pelanggan" flush actions={<SeeAll href={drillHref('feedback', fbTab === 'Semua' ? {} : { tipe: fbTab })} />}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <Seg value={fbTab} onChange={setFbTab} options={['Semua', 'Pujian', 'Saran', 'Komplain'].map((t) => [t, t])} />
            </div>
            <div className="feed fill-scroll">
              {fbList.map((f) => {
                return (
                  <Link key={f.id} href={drillHref('feedback', { id: f.id }, { open: f.id })} className="feed-item">
                    <span className="feed-body"><strong>{f.pelanggan}</strong><br />{f.komentar}<br /><Stars value={f.rating} /></span>
                    <span className="feed-time">{fmtDate(f.tanggal)}</span>
                  </Link>
                );
              })}
            </div>
          </Card>
          <Card title="Sentimen feedback per bulan">
            <StackedBars
              data={sentTrend}
              height={250}
              series={Object.keys(SENT_COLORS).map((s) => ({ key: s, color: SENT_COLORS[s] }))}
              hrefFor={(row, s) => drillHref('feedback', { bulan: row.bulan, ...(s && { sentimen: s }) }, { src: `Sentimen ${monthLabel(row.bulan)}${s ? `, ${s}` : ''}` })}
            />
            <div className="legend-inline">{Object.keys(SENT_COLORS).map((s) => <span key={s}><i style={{ background: SENT_COLORS[s] }} />{s}</span>)}</div>
            <div className="section-label">Kanal feedback</div>
            <BarList color="#2c4aa8" items={Object.entries(countBy(fb6, 'kanal')).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ label: k, value: n, href: drillHref('feedback', { kanal: k }, { src: `Kanal, ${k}` }) }))} />
          </Card>
          <Card title="Form audit digital">
            <div className="device-frame">
              <div className="flex justify-between items-center" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--brand-700)' }}>
                <span>Audit Produksi, Sewing</span><span className="muted">Pertanyaan {qi + 1} dari {QUESTIONS.length}</span>
              </div>
              <div style={{ margin: '10px 0', fontWeight: 600, fontSize: 13.5 }}>{QUESTIONS[qi]}</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {['Sesuai', 'Tidak Sesuai', 'N/A'].map((o) => (
                  <label key={o} className="flex items-center gap-2" style={{ fontSize: 13, padding: '6px 8px', borderRadius: 8, background: answers[qi] === o ? 'var(--brand-50)' : 'var(--white)', border: '1px solid var(--gray-200)', cursor: 'pointer' }}>
                    <input type="radio" name={`q${qi}`} checked={answers[qi] === o} onChange={() => setAnswers((a) => ({ ...a, [qi]: o }))} /> {o}
                  </label>
                ))}
              </div>
              <div className="flex gap-2" style={{ marginTop: 'auto', paddingTop: 12 }}>
                <button type="button" className="btn btn-outline btn-sm"><Camera />Foto</button>
                <div className="spacer" style={{ flex: 1 }} />
                <button type="button" className="btn btn-soft btn-sm" disabled={qi === 0} onClick={() => setQi((i) => i - 1)}>Kembali</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setQi((i) => (i + 1) % QUESTIONS.length)}>{qi === QUESTIONS.length - 1 ? 'Selesai' : 'Lanjut'}</button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
