'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, FileCheck2, FileClock, FileX2, Workflow, PencilLine, Eye, Stamp, Search, Archive, Upload, FilePlus2, CheckSquare, History, LayoutTemplate,
} from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Kpi, PageHeader, SeeAll } from '@/components/ui';
import { BarList, Donut, StackedBars } from '@/components/charts';
import { documents, DOC_CATEGORIES } from '@/lib/data/documents';
import { DEPARTMENTS, countBy, fmtDate, fmtNum, pct } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('edoc');
const ACCESS_COLORS = { Internal: '#3b5bdb', Terbatas: '#8fa2e6', Rahasia: '#a58a5a' };

export default function EdocDashboard() {
  const router = useRouter();
  const [dept, setDept] = useState('');
  const [kategori, setKategori] = useState('');
  const [sq, setSq] = useState('');
  const [sk, setSk] = useState('');
  const [ss, setSs] = useState('');

  const base = { ...(dept && { departemen: dept }), ...(kategori && { kategori }) };
  const docs = useMemo(() => documents.filter((d) => (!dept || d.departemen === dept) && (!kategori || d.kategori === kategori)), [dept, kategori]);
  const href = (extra = {}, src, open) => drillHref('documents', { ...base, ...extra }, { src, open });
  const st = countBy(docs, 'status');
  const cat = countBy(docs, 'kategori');
  const recent = [...docs].filter((d) => d.status === 'Aktif').sort((a, b) => b.tglTerbit.localeCompare(a.tglTerbit)).slice(0, 6);
  const expired = docs.filter((d) => d.status === 'Kadaluarsa');
  const dueSoon = docs.filter((d) => d.status === 'Aktif' && d.sisaHariReview <= 60).sort((a, b) => a.sisaHariReview - b.sisaHariReview);
  const popular = [...docs].sort((a, b) => b.dilihat - a.dilihat).slice(0, 6);
  const access = countBy(docs, 'akses');
  const deptRows = DEPARTMENTS.map((d) => ({ label: d.replace('Quality Control', 'QC').replace('Merchandising', 'Merch.').replace('Maintenance', 'Maint.'), departemen: d, ...Object.fromEntries(DOC_CATEGORIES.map((c) => [c.key, docs.filter((x) => x.departemen === d && x.kategori === c.key).length])) }))
    .filter((r) => DOC_CATEGORIES.some((c) => r[c.key] > 0));
  const records = docs.filter((d) => d.kategori === 'Rekaman');

  const quick = [
    { label: 'Upload dokumen', icon: Upload, href: href({ status: 'Draft' }, 'Quick access, Draft baru') },
    { label: 'Buat dokumen baru', icon: FilePlus2, href: drillHref('documents', { kategori: 'Formulir' }, { src: 'Quick access, Template formulir' }) },
    { label: 'Approval workflow', icon: CheckSquare, href: href({ status: ['Review', 'Approval'] }, 'Quick access, Approval') },
    { label: 'Riwayat revisi', icon: History, href: `${href({}, 'Quick access, Riwayat revisi')}&sort=tglTerbit&dir=desc` },
    { label: 'Template dokumen', icon: LayoutTemplate, href: drillHref('documents', { kategori: 'Formulir', status: 'Aktif' }, { src: 'Quick access, Template' }) },
  ];

  const doSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (sq) p.set('q', sq);
    if (sk) p.set('kategori', sk);
    if (ss) p.set('status', ss);
    if (dept) p.set('departemen', dept);
    p.set('src', 'Pencarian dokumen');
    router.push(`/data/documents?${p}`);
  };

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Pengendalian Dokumen: Akses, Proteksi, dan Disposisi"
        actions={(
          <DashFilters
            onReset={() => { setDept(''); setKategori(''); }}
            filters={[
              { key: 'dept', label: 'Departemen', value: dept, onChange: setDept, options: DEPARTMENTS },
              { key: 'kat', label: 'Kategori', value: kategori, onChange: setKategori, options: DOC_CATEGORIES.map((c) => c.key) },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total dokumen" value={fmtNum(docs.length)} icon={FileText} tone="blue" href={href({}, 'KPI Total dokumen')} hint="dokumen & rekaman terkendali" />
          <Kpi label="Dokumen aktif" value={fmtNum(st.Aktif ?? 0)} icon={FileCheck2} tone="mint" href={href({ status: 'Aktif' }, 'KPI Dokumen aktif')} hint={`${pct(st.Aktif ?? 0, docs.length)}% dari total`} />
          <Kpi label="Menunggu review" value={(st.Review ?? 0) + (st.Approval ?? 0)} icon={FileClock} tone="sun" href={href({ status: ['Review', 'Approval'] }, 'KPI Menunggu review')} hint={`${pct((st.Review ?? 0) + (st.Approval ?? 0), docs.length)}% dari total`} />
          <Kpi label="Kadaluarsa" value={st.Kadaluarsa ?? 0} icon={FileX2} tone="red" href={href({ status: 'Kadaluarsa' }, 'KPI Kadaluarsa')} hint="melewati jadwal review" />
        </div>

        <div className="grid-3-2">
          <div className="stack">
            <Card title="Status workflow">
              <div className="flow">
                {[
                  { s: 'Draft', icon: PencilLine, tone: 'blue', d: 'Disusun pemilik proses' },
                  { s: 'Review', icon: Eye, tone: 'sun', d: 'Ditinjau atasan / QMR' },
                  { s: 'Approval', icon: Stamp, tone: 'mint', d: 'Menunggu pengesahan' },
                  { s: 'Aktif', icon: FileCheck2, tone: 'lilac', d: 'Terbit & terdistribusi' },
                  { s: 'Obsolete', icon: Archive, tone: 'gray', d: 'Ditarik & diarsipkan' },
                ].map((w) => (
                  <Link key={w.s} href={href({ status: w.s }, `Workflow, ${w.s}`)} className="flow-step">
                    <div className={`flow-num tone-${w.tone}`}><w.icon size={16} /></div>
                    <h4>{w.s}</h4>
                    <p>{w.d}</p>
                    <div className="flow-count" style={{ fontSize: 20 }}>{fmtNum(st[w.s] ?? 0)}</div>
                  </Link>
                ))}
              </div>
            </Card>
            <Card title="Dokumen terbaru" flush actions={<SeeAll href={`${href({ status: 'Aktif' })}&sort=tglTerbit&dir=desc`}>Lihat semua dokumen</SeeAll>}>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>No. dokumen</th><th>Nama dokumen</th><th>Kategori</th><th>Revisi</th><th>Tgl terbit</th><th>Status</th></tr></thead>
                  <tbody>
                    {recent.map((d) => (
                      <tr key={d.id} className="clickable" onClick={() => router.push(drillHref('documents', { id: d.id }, { open: d.id }))}>
                        <td className="cell-code">{d.id}</td>
                        <td><div className="cell-title">{d.nama}</div><div className="cell-sub">{d.departemen}</div></td>
                        <td>{d.kategori}</td>
                        <td>{d.revisi}</td>
                        <td className="nowrap">{fmtDate(d.tglTerbit)}</td>
                        <td><Badge value={d.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          <Card title="Kategori dokumen">
            <Donut height={200} legend="bottom" centerLabel="Dokumen" data={DOC_CATEGORIES.map((c) => ({ name: c.key, value: cat[c.key] ?? 0, color: c.color, href: href({ kategori: c.key }, `Kategori, ${c.key}`) }))} />
          </Card>
        </div>

        <div className="grid-2">
          <Card title="Pencarian & filter dokumen">
            <form onSubmit={doSearch} style={{ display: 'grid', gap: 10 }}>
              <div className="search-field" style={{ maxWidth: 'none' }}>
                <Search aria-hidden />
                <input className="form-input" value={sq} onChange={(e) => setSq(e.target.value)} placeholder="Cari dokumen berdasarkan nomor, judul, atau pemilik" aria-label="Kata kunci dokumen" />
              </div>
              <div className="grid-2" style={{ gap: 10 }}>
                <select className="form-select" value={sk} onChange={(e) => setSk(e.target.value)} aria-label="Kategori"><option value="">Semua kategori</option>{DOC_CATEGORIES.map((c) => <option key={c.key}>{c.key}</option>)}</select>
                <select className="form-select" value={ss} onChange={(e) => setSs(e.target.value)} aria-label="Status"><option value="">Semua status</option>{['Aktif', 'Draft', 'Review', 'Approval', 'Kadaluarsa', 'Obsolete'].map((s) => <option key={s}>{s}</option>)}</select>
              </div>
              <button type="submit" className="btn btn-primary">Cari dokumen</button>
            </form>
            <div className="section-label">Quick access</div>
            <div className="flow" style={{ '--flow-min': '96px' }}>
              {quick.map((x) => (
                <Link key={x.label} href={x.href} className="flow-step" style={{ textAlign: 'center', padding: 10 }}>
                  <div className="flow-num tone-blue" style={{ margin: '0 auto 6px' }}><x.icon size={16} /></div>
                  <h4 style={{ fontSize: 12.5 }}>{x.label}</h4>
                </Link>
              ))}
            </div>
          </Card>
          <Card title="Dokumen kadaluarsa & jatuh tempo review" flush actions={<SeeAll href={href({ status: 'Kadaluarsa' })} />}>
            <div className="table-wrapper fill-scroll">
              <table>
                <thead><tr><th>No. dokumen</th><th>Nama dokumen</th><th>Review</th><th>Status</th></tr></thead>
                <tbody>
                  {[...expired, ...dueSoon].slice(0, 10).map((d) => (
                    <tr key={d.id} className="clickable" onClick={() => router.push(drillHref('documents', { id: d.id }, { open: d.id }))}>
                      <td className="cell-code">{d.id}</td>
                      <td className="cell-title">{d.nama}</td>
                      <td className="nowrap">{fmtDate(d.tglReview)}<div className="cell-sub">{d.sisaHariReview < 0 ? `${-d.sisaHariReview} hari lewat` : `${d.sisaHariReview} hari lagi`}</div></td>
                      <td><Badge value={d.status === 'Aktif' ? 'Akan Kadaluarsa' : d.status} /></td>
                    </tr>
                  ))}
                  {expired.length + dueSoon.length === 0 && <tr><td colSpan={4} className="cell-empty">Tidak ada dokumen yang jatuh tempo.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="grid-3-2">
          <Card title="Dokumen per departemen">
            <StackedBars
              data={deptRows}
              height={280}
              series={DOC_CATEGORIES.map((c) => ({ key: c.key, color: c.color }))}
              hrefFor={(row, k) => href({ departemen: row.departemen, ...(k && { kategori: k }) }, `Dokumen ${row.departemen}${k ? `, ${k}` : ''}`)}
            />
            <div className="legend-inline">{DOC_CATEGORIES.map((c) => <span key={c.key}><i style={{ background: c.color }} />{c.key}</span>)}</div>
          </Card>
          <div className="stack">
            <Card title="Dokumen populer" subtitle="Paling sering dibuka">
              <BarList labelWidth={150} items={popular.map((d) => ({ label: `${d.id}, ${d.nama}`, value: d.dilihat, href: drillHref('documents', { id: d.id }, { open: d.id }) }))} color="#d4a73a" />
            </Card>
            <Card title="Proteksi & hak akses">
              <Donut height={120} centerLabel="Dokumen" data={Object.keys(ACCESS_COLORS).map((a) => ({ name: a, value: access[a] ?? 0, color: ACCESS_COLORS[a], href: href({ akses: a }, `Hak akses, ${a}`) }))} />
            </Card>
          </div>
        </div>

        <Card title="Retensi & disposisi rekaman" subtitle={`${records.length} jenis rekaman mutu dengan masa simpan terdefinisi`}>
          <div className="grid-2">
            <BarList items={Object.entries(countBy(records, 'retensi')).map(([k, n]) => ({ label: `Retensi ${k}`, value: n, href: drillHref('documents', { kategori: 'Rekaman', retensi: k, ...(dept && { departemen: dept }) }, { src: `Retensi ${k}` }) }))} color="#2c4aa8" />
            <BarList items={Object.entries(countBy(records, 'disposisi')).map(([k, n]) => ({ label: k, value: n, href: drillHref('documents', { kategori: 'Rekaman', disposisi: k, ...(dept && { departemen: dept }) }, { src: `Disposisi, ${k}` }) }))} color="#5f6f86" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
