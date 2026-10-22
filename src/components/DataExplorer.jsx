'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Download, FileSpreadsheet, MousePointerClick, Search, X, ExternalLink, FilterX,
} from 'lucide-react';
import AppShell from './AppShell';
import { Card, CellValue, PageHeader, isNumericCol } from './ui';
import { Columns } from './charts';
import { DATASETS, RESERVED_PARAMS, applyFilters, drillHref, facetCounts, fieldLabel } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';
import { MONTHS, fmtDate, fmtNum, monthLabel, monthShort } from '@/lib/data/core';

const PAGE_SIZE = 25;

const displayValue = (ds, key, value) => {
  const col = [...ds.columns, ...(ds.extra ?? [])].find((c) => c.key === key);
  if (key === 'bulan' || key === 'bulanTerbit' || col?.type === 'month') return monthLabel(value);
  if (key === 'empId') return ds.rows.find((r) => r.empId === value)?.karyawan ?? DATASETS.employees.rows.find((e) => e.id === value)?.nama ?? value;
  if (key === 'kebijakanId') return DATASETS.policies.rows.find((p) => p.id === value)?.nama ?? value;
  if (col?.type === 'date') return fmtDate(value);
  return value;
};

export default function DataExplorer({ datasetKey }) {
  const ds = DATASETS[datasetKey];
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const from = params.get('from');
  const src = params.get('src');
  const mod = moduleById(from ?? ds.module) ?? moduleById(ds.module);

  // Semua query selain parameter khusus dianggap filter "field=nilai1,nilai2".
  const filters = useMemo(() => {
    const f = {};
    for (const [k, v] of params.entries()) if (!RESERVED_PARAMS.includes(k) && v) f[k] = v.split(',');
    return f;
  }, [params]);

  const [q, setQ] = useState(params.get('q') ?? '');
  const sortKey = params.get('sort');
  const sortDir = params.get('dir') === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const openId = params.get('open');

  const setParams = (mut, { keepPage = false } = {}) => {
    const next = new URLSearchParams(params.toString());
    mut(next);
    if (!keepPage) next.delete('page');
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Pencarian teks dikirim ke URL setelah jeda singkat.
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') === q) return;
      setParams((n) => (q ? n.set('q', q) : n.delete('q')));
    }, 250);
    return () => clearTimeout(t);
  });

  const term = (params.get('q') ?? '').toLowerCase().trim();
  const searched = useMemo(() => {
    if (!term) return ds.rows;
    return ds.rows.filter((r) => ds.searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(term)));
  }, [ds, term]);
  const filtered = useMemo(() => applyFilters(searched, filters), [searched, filters]);
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sortKey]; const y = b[sortKey];
      if (x == null) return 1;
      if (y == null) return -1;
      if (Array.isArray(x)) return 0;
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'id')) * dir;
    });
  }, [filtered, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const visible = sorted.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const openRow = openId ? ds.rows.find((r) => r.id === openId) : null;

  const toggleFilter = (key, value) => setParams((n) => {
    const cur = (n.get(key) ?? '').split(',').filter(Boolean);
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    if (next.length) n.set(key, next.join(',')); else n.delete(key);
  });
  const removeFilter = (key) => setParams((n) => n.delete(key));
  const clearAll = () => { setQ(''); router.replace(`${pathname}${from ? `?from=${from}` : ''}`, { scroll: false }); };
  const setSort = (key) => setParams((n) => {
    if (sortKey === key) n.set('dir', sortDir === 'asc' ? 'desc' : 'asc');
    else { n.set('sort', key); n.set('dir', 'desc'); }
  });
  const openRecord = (id) => setParams((n) => n.set('open', id), { keepPage: true });
  const closeRecord = () => setParams((n) => n.delete('open'), { keepPage: true });

  const exportRows = async (kind) => {
    const cols = [...ds.columns, ...(ds.extra ?? [])].filter((c) => c.type !== 'skills');
    const data = sorted.map((r) => Object.fromEntries(cols.map((c) => [c.label, Array.isArray(r[c.key]) ? r[c.key].join(' ') : r[c.key] ?? ''])));
    const name = `${datasetKey}-${new Date().toISOString().slice(0, 10)}`;
    if (kind === 'csv') {
      const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
      const csv = [cols.map((c) => esc(c.label)).join(','), ...data.map((d) => cols.map((c) => esc(d[c.label])).join(','))].join('\n');
      const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: `${name}.csv` });
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), ds.title.slice(0, 31));
      XLSX.writeFile(wb, `${name}.xlsx`);
    }
  };

  // Facet dihitung dari baris yang lolos filter lain, agar angka di panel jujur.
  const facetData = ds.facets.map((key) => {
    const others = Object.fromEntries(Object.entries(filters).filter(([k]) => k !== key));
    const base = applyFilters(searched, others);
    return { key, counts: facetCounts(base, key) };
  });

  const monthBase = ds.monthKey ? applyFilters(searched, Object.fromEntries(Object.entries(filters).filter(([k]) => k !== ds.monthKey))) : [];
  const monthData = ds.monthKey ? MONTHS.map((m) => ({
    label: monthShort(m),
    bulan: m,
    value: monthBase.filter((r) => r[ds.monthKey] === m).length,
    color: filters[ds.monthKey]?.includes(m) ? '#3b5bdb' : '#b4c0ef',
  })) : null;

  const activeFilters = Object.entries(filters);
  const summary = ds.summary?.(filtered) ?? [];
  const backHref = from && from !== ds.module ? `/${from}` : `/${ds.module}`;

  return (
    <AppShell moduleId={mod.id} datasetKey={datasetKey} title={ds.title}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short, href: `/${mod.id}` }, { label: ds.title }]}
        eyebrow={moduleById(ds.module).clause}
        title={ds.title}
        actions={(
          <>
            <Link href={backHref} className="btn btn-outline btn-sm"><ArrowLeft />Kembali ke dashboard</Link>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => exportRows('csv')}><Download />CSV</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => exportRows('xlsx')}><FileSpreadsheet />Export Excel</button>
          </>
        )}
      />

      <div className="stack">
        {(src || activeFilters.length > 0) && (
          <div className="source-note">
            <MousePointerClick aria-hidden />
            <span>
              {src ? <>Sumber: <b>{src}</b>. </> : null}
              Menampilkan <b>{fmtNum(filtered.length)}</b> dari {fmtNum(ds.rows.length)} data.
            </span>
          </div>
        )}

        <div className="kpi-grid">
          {summary.map((s) => (
            <div key={s.label} className="kpi-card">
              <div className="kpi-text">
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-value" style={{ color: s.tone === 'red' ? 'var(--red-600)' : undefined }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="explorer">
          <aside className="facet-panel" aria-label="Filter cepat">
            {monthData && (
              <Card title="Per bulan">
                <Columns data={monthData} height={150} hrefFor={(d) => {
                  const n = new URLSearchParams(params.toString());
                  const cur = (n.get(ds.monthKey) ?? '').split(',').filter(Boolean);
                  const next = cur.includes(d.bulan) ? cur.filter((x) => x !== d.bulan) : [...cur, d.bulan];
                  if (next.length) n.set(ds.monthKey, next.join(',')); else n.delete(ds.monthKey);
                  n.delete('page');
                  return `${pathname}?${n}`;
                }} />
              </Card>
            )}
            {facetData.map(({ key, counts }) => (
              <Card key={key} title={fieldLabel(ds, key)}>
                <FacetList ds={ds} fkey={key} counts={counts} selected={filters[key] ?? []} onToggle={(v) => toggleFilter(key, v)} />
              </Card>
            ))}
          </aside>

          <Card flush>
            <div style={{ padding: '14px 16px', display: 'grid', gap: 12, borderBottom: '1px solid var(--gray-100)' }}>
              <div className="toolbar">
                <div className="search-field">
                  <Search aria-hidden />
                  <input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Cari ${ds.singular.toLowerCase()}`} aria-label="Cari" />
                </div>
                <div className="spacer" />
                <span className="muted">{fmtNum(sorted.length)} baris</span>
                {(activeFilters.length > 0 || term) && (
                  <button type="button" className="btn btn-soft btn-sm" onClick={clearAll}><FilterX />Reset filter</button>
                )}
              </div>
              {activeFilters.length > 0 && (
                <div className="filter-chips">
                  {activeFilters.map(([k, vals]) => (
                    <span key={k} className="filter-chip">
                      {fieldLabel(ds, k)}: <b>{vals.length > 4 ? `${vals.length} data terpilih` : vals.map((v) => displayValue(ds, k, v)).join(' / ')}</b>
                      <button type="button" onClick={() => removeFilter(k)} aria-label={`Hapus filter ${fieldLabel(ds, k)}`}><X /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th className="num" style={{ width: 48 }}>No</th>
                    {ds.columns.map((c) => {
                      const sortable = c.type !== 'skills';
                      const active = sortKey === c.key;
                      const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                      return (
                        <th
                          key={c.key}
                          className={`${isNumericCol(c) ? 'num' : ''} ${sortable ? 'sortable' : ''} ${active ? 'sorted' : ''}`}
                          onClick={sortable ? () => setSort(c.key) : undefined}
                          aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                        >
                          {c.label}{sortable && <Icon className="sort-icon" aria-hidden />}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && (
                    <tr><td colSpan={ds.columns.length + 1} className="cell-empty">Tidak ada data yang cocok dengan filter.</td></tr>
                  )}
                  {visible.map((r, i) => (
                    <tr key={r.id} className="clickable" onClick={() => openRecord(r.id)}>
                      <td className="num muted">{(current - 1) * PAGE_SIZE + i + 1}</td>
                      {ds.columns.map((c) => (
                        <td key={c.key} className={isNumericCol(c) ? 'num' : ''}><CellValue col={c} row={r} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span>
                {sorted.length ? `Menampilkan ${(current - 1) * PAGE_SIZE + 1}-${Math.min(current * PAGE_SIZE, sorted.length)} dari ${fmtNum(sorted.length)}` : 'Tidak ada data'}
              </span>
              {pages > 1 && (
                <span className="pager-nav">
                  <button type="button" className="btn btn-outline btn-sm" disabled={current <= 1} onClick={() => setParams((n) => n.set('page', current - 1), { keepPage: true })}>Sebelumnya</button>
                  <span>{current} / {pages}</span>
                  <button type="button" className="btn btn-outline btn-sm" disabled={current >= pages} onClick={() => setParams((n) => n.set('page', current + 1), { keepPage: true })}>Berikutnya</button>
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>

      {openRow && <RecordDrawer ds={ds} row={openRow} from={from} onClose={closeRecord} />}
    </AppShell>
  );
}

function FacetList({ ds, fkey, counts, selected, onToggle }) {
  const [all, setAll] = useState(false);
  const max = Math.max(...counts.map((c) => c[1]), 1);
  const shown = all ? counts : counts.slice(0, 6);
  return (
    <div className="barlist">
      {shown.map(([value, n]) => {
        const on = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            className="barlist-row"
            onClick={() => onToggle(value)}
            aria-pressed={on}
            style={{ gridTemplateColumns: 'minmax(0, 1fr) 64px 28px', background: on ? 'var(--brand-50)' : undefined, fontWeight: on ? 600 : undefined }}
          >
            <span className="lbl" title={String(displayValue(ds, fkey, value))}>{displayValue(ds, fkey, value)}</span>
            <span className="track"><span className="fill" style={{ display: 'block', width: `${(n / max) * 100}%`, background: on ? '#3b5bdb' : '#b4c0ef' }} /></span>
            <span className="v">{n}</span>
          </button>
        );
      })}
      {counts.length > 6 && (
        <button type="button" className="btn-ghost" style={{ justifySelf: 'start' }} onClick={() => setAll((v) => !v)}>
          {all ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${counts.length})`}
        </button>
      )}
      {counts.length === 0 && <span className="muted">Tidak ada nilai.</span>}
    </div>
  );
}

function RecordDrawer({ ds, row, from, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const fields = [...ds.columns.filter((c) => c.key !== ds.titleKey), ...(ds.extra ?? [])];
  const related = ds.related?.(row) ?? [];
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Detail ${ds.singular}`}>
        <div className="drawer-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="cell-code" style={{ marginBottom: 4 }}>{row.id}</div>
            <h3>{row[ds.titleKey]}</h3>
            <div className="muted">{ds.singular}</div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Tutup"><X size={20} /></button>
        </div>
        <div className="drawer-body">
          <dl className="detail-grid">
            {fields.map((c) => (
              <div key={c.key} className={c.full || c.type === 'skills' ? 'full' : ''}>
                <dt>{c.label}</dt>
                <dd>{c.type === 'skills' ? <SkillBreakdown row={row} /> : <CellValue col={c.type === 'title' ? { ...c, type: 'text' } : c} row={row} />}</dd>
              </div>
            ))}
          </dl>
          {related.length > 0 && (
            <>
              <div className="section-label">Data terkait</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {related.map((rel) => {
                  const target = DATASETS[rel.dataset];
                  const n = applyFilters(target.rows, Object.fromEntries(Object.entries(rel.filters).map(([k, v]) => [k, [String(v)]]))).length;
                  return (
                    <Link key={rel.label} href={drillHref(rel.dataset, rel.filters, { from: from ?? undefined, open: rel.open })} className="shortcut btn btn-outline" style={{ justifyContent: 'space-between' }}>
                      <span>{rel.label}</span>
                      <span className="flex items-center gap-2"><span className="badge badge-info plain">{n}</span><ExternalLink /></span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SkillBreakdown({ row }) {
  const names = ['Teknis Garmen', 'Mutu & Inspeksi', 'K3 & 5S', 'Digital', 'Leadership', 'Problem Solving'];
  return (
    <table className="table-compact" style={{ marginTop: 4 }}>
      <thead><tr><th>Kompetensi</th><th className="center">Level</th><th className="center">Target</th><th>Status</th></tr></thead>
      <tbody>
        {row.skills.map((lv, i) => (
          <tr key={i}>
            <td>{names[i]}</td>
            <td className="center"><span className={`level-cell lv-${lv}`}>{lv}</span></td>
            <td className="center">{row.targets[i]}</td>
            <td>{lv >= row.targets[i] ? <span className="badge badge-success">Kompeten</span> : <span className="badge badge-danger">Gap</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
