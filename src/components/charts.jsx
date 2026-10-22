'use client';

// Grafik yang bisa diklik. Setiap elemen (irisan donut, segmen batang, titik
// bulan, baris bar) membawa href ke halaman data detail yang sudah terfilter.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ComposedChart, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea, LabelList,
} from 'recharts';
import { fmtNum } from '@/lib/data/core';

export const SERIES = ['#3b5bdb', '#d4a73a', '#8fa2e6', '#5f6f86', '#b9c3d6', '#2c4aa8', '#a58a5a', '#1d2c6e'];
const AXIS = { fontSize: 11.5, fill: '#636c7c' };
const GRID = '#eceff5';
// Grafik mengisi sisa tinggi kartu; `height` menjadi tinggi minimum.
const FILL = { width: '100%', height: '100%', style: { position: 'absolute', inset: 0 } };

export function ChartTooltip({ active, payload, label, title, unit = '', hint = 'Klik untuk lihat data detail', total }) {
  if (!active || !payload?.length) return null;
  const items = payload.filter((p) => p.value != null && p.dataKey !== '__total');
  const sum = items.reduce((s, p) => s + (Number(p.value) || 0), 0);
  return (
    <div className="chart-tooltip">
      <div className="t-title">{title ?? label ?? payload[0]?.name}</div>
      {items.map((p) => (
        <div key={p.dataKey ?? p.name} className="t-row">
          <i style={{ background: p.color ?? p.payload?.color ?? p.payload?.fill }} />
          {p.name}
          <b>{fmtNum(p.value, Number.isInteger(p.value) ? 0 : 1)}{unit}</b>
        </div>
      ))}
      {total && items.length > 1 && <div className="t-row" style={{ fontWeight: 600 }}>Total<b>{fmtNum(sum)}{unit}</b></div>}
      {hint && <div className="t-hint">{hint}</div>}
    </div>
  );
}

// ─── Donut ─────────────────────────────────────────────────────────────────
export function Donut({ data, height = 200, centerValue, centerLabel, legend = 'side', showPct = true, innerRatio = 0.64 }) {
  const router = useRouter();
  const [hover, setHover] = useState(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const visible = data.filter((d) => d.value > 0);
  const chart = (
    <div className={`donut-wrap ${legend === 'side' ? '' : 'chart-fill'}`} style={legend === 'side' ? { width: height, height, flexShrink: 0 } : { minHeight: height }}>
      <ResponsiveContainer {...FILL}>
        <PieChart>
          <Pie
            data={visible}
            dataKey="value"
            nameKey="name"
            innerRadius={`${innerRatio * 100}%`}
            outerRadius="100%"
            paddingAngle={visible.length > 1 ? 1.5 : 0}
            stroke="#fff"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive
            onMouseEnter={(_, i) => setHover(visible[i]?.name)}
            onMouseLeave={() => setHover(null)}
            onClick={(d) => d?.href && router.push(d.href)}
            style={{ cursor: 'pointer' }}
          >
            {visible.map((d) => (
              <Cell key={d.name} fill={d.color} opacity={hover && hover !== d.name ? 0.35 : 1} style={{ transition: 'opacity 150ms', outline: 'none' }} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} wrapperStyle={{ zIndex: 10 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <div>
          <strong>{centerValue ?? fmtNum(total)}</strong>
          {centerLabel && <span>{centerLabel}</span>}
        </div>
      </div>
    </div>
  );
  const rows = (
    <div className="legend" style={{ flex: '1 1 180px', minWidth: 0 }}>
      {data.map((d) => {
        const inner = (
          <>
            <span className="swatch" style={{ background: d.color }} />
            <span className="name">{d.name}</span>
            <span className="val">{fmtNum(d.value)}</span>
            {showPct && <span className="pct">{total ? fmtNum((d.value / total) * 100, 1) : 0}%</span>}
          </>
        );
        const cls = `legend-row ${hover === d.name ? 'hover' : ''}`;
        return d.href ? (
          <Link key={d.name} href={d.href} className={cls} onMouseEnter={() => setHover(d.name)} onMouseLeave={() => setHover(null)}>{inner}</Link>
        ) : <div key={d.name} className={cls}>{inner}</div>;
      })}
    </div>
  );
  return legend === 'side' ? (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>{chart}{rows}</div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>{chart}{legend !== 'none' && rows}</div>
  );
}

// ─── Kolom bertumpuk per periode ───────────────────────────────────────────
// series: [{ key, label, color }]. hrefFor(row, seriesKey|null) menghasilkan URL detail.
export function StackedBars({ data, xKey = 'label', series, hrefFor, height = 260, totalLine, stacked = true, unit = '', showTotalLabel = true, yWidth = 34 }) {
  const router = useRouter();
  const go = (row, key) => { const h = hrefFor?.(row, key); if (h) router.push(h); };
  const Chart = totalLine ? ComposedChart : BarChart;
  const rows = data.map((d) => ({ ...d, __total: series.reduce((s, x) => s + (d[x.key] ?? 0), 0) }));
  return (
    <div className="chart-fill" style={{ minHeight: height }}>
      <ResponsiveContainer {...FILL}>
        <Chart
          data={rows}
          margin={{ top: 22, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="28%"
          onClick={(s) => {
            const i = Number(s?.activeTooltipIndex ?? s?.activeIndex);
            if (!Number.isNaN(i) && rows[i]) go(rows[i], null);
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={yWidth} allowDecimals={false} />
          <Tooltip content={<ChartTooltip unit={unit} total={stacked} />} cursor={{ fill: 'rgb(76 110 245 / 0.06)' }} />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              stackId={stacked ? 'a' : undefined}
              fill={s.color}
              maxBarSize={stacked ? 30 : 18}
              stroke="#fff"
              strokeWidth={stacked ? 1.5 : 0}
              radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
              onClick={(entry, _i, e) => { e?.stopPropagation?.(); go(entry.payload ?? entry, s.key); }}
              style={{ cursor: 'pointer' }}
            >
              {stacked && showTotalLabel && i === series.length - 1 && !totalLine && (
                <LabelList dataKey="__total" position="top" style={{ fontSize: 11.5, fontWeight: 600, fill: '#394150' }} />
              )}
            </Bar>
          ))}
          {totalLine && (
            <Line type="linear" dataKey="__total" name="Total" stroke="#1d2c6e" strokeWidth={2} dot={{ r: 4, fill: '#1d2c6e', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }}>
              <LabelList dataKey="__total" position="top" offset={10} style={{ fontSize: 11.5, fontWeight: 700, fill: '#1d2c6e' }} />
            </Line>
          )}
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Garis tren ────────────────────────────────────────────────────────────
export function TrendLines({ data, xKey = 'label', series, hrefFor, height = 250, unit = '', yDomain, yTicks, target, yWidth = 38 }) {
  const router = useRouter();
  return (
    <div className="chart-fill" style={{ minHeight: height }}>
      <ResponsiveContainer {...FILL}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
          onClick={(s) => {
            const i = Number(s?.activeTooltipIndex ?? s?.activeIndex);
            const h = !Number.isNaN(i) && data[i] ? hrefFor?.(data[i]) : null;
            if (h) router.push(h);
          }}
          style={{ cursor: hrefFor ? 'pointer' : 'default' }}
        >
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={yWidth} domain={yDomain ?? ['auto', 'auto']} ticks={yTicks} tickFormatter={(v) => `${fmtNum(v)}${unit}`} />
          <Tooltip content={<ChartTooltip unit={unit} hint={hrefFor ? 'Klik untuk lihat data bulan ini' : null} />} cursor={{ stroke: '#b4c0ef', strokeWidth: 1 }} />
          {target != null && <ReferenceLine y={target} stroke="#8790a0" strokeDasharray="4 4" label={{ value: `Target ${target}${unit}`, position: 'insideTopRight', fontSize: 11, fill: '#636c7c' }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={{ r: 3.5, fill: s.color, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Bar horizontal (Top N), HTML murni ────────────────────────────────────
export function BarList({ items, max, color = '#3b5bdb', unit = '', labelWidth }) {
  const m = max ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="barlist">
      {items.map((it) => {
        const inner = (
          <>
            <span className="lbl" title={it.label}>{it.label}</span>
            <span className="track"><span className="fill" style={{ display: 'block', width: `${Math.max(2, (it.value / m) * 100)}%`, background: it.color ?? color }} /></span>
            <span className="v">{fmtNum(it.value, it.decimals ?? 0)}{unit}</span>
          </>
        );
        const style = labelWidth ? { gridTemplateColumns: `${labelWidth}px 1fr auto` } : undefined;
        return it.href
          ? <Link key={it.label} href={it.href} className="barlist-row" style={style} title={`${it.label}: klik untuk detail`}>{inner}</Link>
          : <div key={it.label} className="barlist-row" style={style}>{inner}</div>;
      })}
    </div>
  );
}

// ─── Kolom sederhana satu seri ─────────────────────────────────────────────
export function Columns({ data, xKey = 'label', yKey = 'value', color = '#3b5bdb', hrefFor, height = 180, unit = '', name = 'Jumlah' }) {
  const router = useRouter();
  return (
    <div className="chart-fill" style={{ minHeight: height }}>
      <ResponsiveContainer {...FILL}>
        <BarChart data={data} margin={{ top: 18, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} interval={0} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
          <Tooltip content={<ChartTooltip unit={unit} hint={hrefFor ? 'Klik untuk lihat data detail' : null} />} cursor={{ fill: 'rgb(76 110 245 / 0.06)' }} />
          <Bar dataKey={yKey} name={name} fill={color} radius={[4, 4, 0, 0]} maxBarSize={24} onClick={(e) => { const h = hrefFor?.(e.payload ?? e); if (h) router.push(h); }} style={{ cursor: hrefFor ? 'pointer' : 'default' }}>
            {data.map((d, i) => <Cell key={i} fill={d.color ?? color} />)}
            <LabelList dataKey={yKey} position="top" style={{ fontSize: 11, fontWeight: 600, fill: '#394150' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Matriks pengaruh-kepentingan stakeholder ──────────────────────────────
export function PowerInterest({ data, height = 300, hrefFor }) {
  const router = useRouter();
  return (
    <div className="chart-fill" style={{ minHeight: height }}>
      <ResponsiveContainer {...FILL}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 18, left: 0 }}>
          <ReferenceArea x1={5.5} x2={10.5} y1={5.5} y2={10.5} fill="#eef1fb" fillOpacity={0.7} />
          <ReferenceArea x1={0.5} x2={5.5} y1={5.5} y2={10.5} fill="#f7f4ea" fillOpacity={0.6} />
          <ReferenceArea x1={5.5} x2={10.5} y1={0.5} y2={5.5} fill="#f2f4f8" fillOpacity={0.7} />
          <CartesianGrid stroke={GRID} />
          <XAxis type="number" dataKey="kepentingan" domain={[0.5, 10.5]} ticks={[1, 3, 5, 7, 9]} tick={AXIS} label={{ value: 'Kepentingan', position: 'insideBottom', offset: -10, fontSize: 11.5, fill: '#636c7c' }} />
          <YAxis type="number" dataKey="pengaruh" domain={[0.5, 10.5]} ticks={[1, 3, 5, 7, 9]} tick={AXIS} width={34} label={{ value: 'Pengaruh', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11.5, fill: '#636c7c' }} />
          <ZAxis range={[90, 90]} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              return (
                <div className="chart-tooltip">
                  <div className="t-title">{p.nama}</div>
                  <div className="t-row">Kategori<b>{p.kategori}</b></div>
                  <div className="t-row">Pengaruh<b>{p.pengaruh}</b></div>
                  <div className="t-row">Kepentingan<b>{p.kepentingan}</b></div>
                  <div className="t-row">Strategi<b>{p.kuadran}</b></div>
                  <div className="t-hint">Klik untuk buka profil stakeholder</div>
                </div>
              );
            }}
          />
          <Scatter data={data} onClick={(e) => { const h = hrefFor?.(e.payload ?? e); if (h) router.push(h); }} style={{ cursor: 'pointer' }}>
            {data.map((d) => <Cell key={d.id} fill={d.tipe === 'Internal' ? '#3b5bdb' : '#d4a73a'} stroke="#fff" strokeWidth={2} />)}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// Sparkline mini untuk kartu hub.
export function Sparkline({ values, color = '#3b5bdb', width = 120, height = 34 }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * (width - 4) + 2, height - 4 - ((v - min) / span) * (height - 8)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={`${d} L${last[0]},${height} L2,${height} Z`} fill={color} opacity="0.1" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function LegendInline({ items }) {
  return (
    <div className="legend-inline">
      {items.map((i) => <span key={i.label}><i className={i.line ? 'line' : ''} style={{ background: i.color }} />{i.label}</span>)}
    </div>
  );
}
