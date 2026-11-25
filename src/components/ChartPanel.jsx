'use client';

// Satu grafik dari konfigurasi sub-modul. onPick(patch) menerima filter yang
// dipilih ({ field: nilai }) atau { open: id } untuk membuka detail baris.
import Link from 'next/link';
import { BarList, Columns, Donut, SERIES, StackedBars, TrendLines } from './charts';
import { Card } from './ui';
import { toneOf } from '@/lib/tones';
import { LAST6, MONTHS, avgBy, countBy, monthLabel, monthShort } from '@/lib/data/core';

const TONE_HEX = { success: '#2f8a5f', warning: '#d4a73a', danger: '#c2453d', info: '#3b5bdb' };
export const colorFor = (value, i) => TONE_HEX[toneOf(value)] ?? SERIES[i % SERIES.length];

// Kolom URL yang "dimiliki" grafik: dikecualikan saat menghitung grafik itu
// sendiri, supaya pilihan lain tetap terlihat (cross-filter).
export function ownFields(cfg) {
  switch (cfg.type) {
    case 'monthly': return [cfg.field, cfg.stack].filter(Boolean);
    case 'kpiTrend': return ['bulan'];
    default: return [cfg.field];
  }
}

function groups(cfg, rows) {
  const src = cfg.where ? rows.filter(cfg.where) : rows;
  let keys = cfg.order ?? Object.entries(countBy(src, cfg.field)).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  keys = keys.filter((k) => k && k !== 'undefined' && k !== 'null');
  const value = (k) => {
    const list = src.filter((r) => String(r[cfg.field]) === String(k));
    return cfg.agg ? Math.round(avgBy(list, cfg.agg.field)) : list.length;
  };
  const out = keys.map((k) => ({ key: String(k), label: cfg.label ? cfg.label(k) : String(k), value: value(k) }));
  return cfg.top ? out.slice(0, cfg.top) : out;
}

export function ChartBody({ cfg, rows, selected = {}, onPick, height = 210 }) {
  const sel = (field) => selected[field] ?? [];
  const pick = (patch) => onPick?.(patch);
  if (!rows.length) return <p className="cell-empty">Belum ada data untuk grafik ini.</p>;

  if (cfg.type === 'donut') {
    const s = sel(cfg.field);
    const data = groups(cfg, rows).map((g, i) => ({
      name: g.label, value: g.value, color: colorFor(g.key, i),
      active: s.includes(g.key), dim: s.length > 0 && !s.includes(g.key),
      onClick: () => pick({ [cfg.field]: g.key, ...(cfg.whereFilter ?? {}) }),
    }));
    return <Donut data={data} height={height * 0.72} legend="side" />;
  }

  if (cfg.type === 'bar') {
    const s = sel(cfg.field);
    const items = groups(cfg, rows).map((g) => ({
      label: g.label, value: g.value, color: cfg.agg ? undefined : TONE_HEX[toneOf(g.key)],
      active: s.includes(g.key), dim: s.length > 0 && !s.includes(g.key),
      onClick: () => pick({ [cfg.field]: g.key, ...(cfg.whereFilter ?? {}) }),
    }));
    return <BarList items={items} max={cfg.max} unit={cfg.unit ?? ''} />;
  }

  if (cfg.type === 'monthly') {
    const months = cfg.months === 'last6' ? LAST6 : MONTHS;
    if (!cfg.stack) {
      const data = months.map((m) => ({ label: monthShort(m), bulan: m, value: rows.filter((r) => r[cfg.field] === m).length }));
      return <Columns data={data} height={height} name="Jumlah" onPick={(d) => pick({ [cfg.field]: d.bulan })} />;
    }
    const keys = Object.entries(countBy(rows.filter((r) => months.includes(r[cfg.field])), cfg.stack)).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const data = months.map((m) => ({
      label: monthShort(m), bulan: m,
      ...Object.fromEntries(keys.map((k) => [k, rows.filter((r) => r[cfg.field] === m && String(r[cfg.stack]) === k).length])),
    }));
    return (
      <>
        <StackedBars data={data} height={height} series={keys.map((k, i) => ({ key: k, color: colorFor(k, i) }))} onPick={(row, k) => pick({ [cfg.field]: row.bulan, ...(k ? { [cfg.stack]: k } : {}) })} />
        <div className="legend-inline">{keys.map((k, i) => <span key={k}><i style={{ background: colorFor(k, i) }} />{k}</span>)}</div>
      </>
    );
  }

  if (cfg.type === 'kpiTrend') {
    const points = rows.filter((r) => Number.isFinite(r.capaian) && r.bulan && r.kode);
    if (!points.length) return <p className="cell-empty">Belum ada realisasi yang dapat dihitung.</p>;
    const codes = Array.from(new Map(points.map((r) => [r.kode, r.kpi])), ([kode, kpi]) => ({ kode, label: kode + ' · ' + kpi })).slice(0, 6);
    const months = [...new Set(points.map((r) => r.bulan))].sort();
    const data = months.map((m) => ({
      label: monthLabel(m), bulan: m,
      ...Object.fromEntries(codes.map((item) => {
        const point = points.find((r) => r.kode === item.kode && r.bulan === m);
        return [item.label, point?.capaian ?? null];
      })),
    }));
    return (
      <>
        <TrendLines data={data} height={height} unit="%" target={100} yDomain={[0, 'auto']}
          series={codes.map((item, i) => ({ key: item.label, color: SERIES[i] }))} onPick={(row) => pick({ bulan: row.bulan })} />
        <div className="legend-inline">{codes.map((item, i) => <span key={item.kode}><i className="line" style={{ background: SERIES[i] }} />{item.label}</span>)}</div>
      </>
    );
  }
  return null;
}

export function ChartCard({ cfg, rows, selected, onPick, href, height }) {
  return (
    <Card title={cfg.title} actions={href ? <Link href={href} className="btn-ghost">Buka</Link> : null}>
      <ChartBody cfg={cfg} rows={rows} selected={selected} onPick={onPick} height={height} />
    </Card>
  );
}

