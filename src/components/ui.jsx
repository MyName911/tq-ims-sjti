'use client';

import Link from 'next/link';
import { ChevronRight, MousePointerClick, Star } from 'lucide-react';
import { toneOf } from '@/lib/tones';
import { fmtDate, fmtNum, monthLabel } from '@/lib/data/core';

export function Card({ title, subtitle, actions, children, flush, footer, className = '', style }) {
  return (
    <section className={`card ${className}`} style={style}>
      {(title || actions) && (
        <div className="card-header">
          <div style={{ minWidth: 0 }}>
            <div className="card-title">{title}</div>
            {subtitle && <div className="card-subtitle">{subtitle}</div>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${flush ? 'flush' : ''}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </section>
  );
}

export function DrillHint({ text = 'Klik untuk detail' }) {
  return <span className="drill-hint"><MousePointerClick aria-hidden />{text}</span>;
}

export function SeeAll({ href, children = 'Lihat semua' }) {
  return <Link href={href} className="btn-ghost">{children}<ChevronRight aria-hidden /></Link>;
}

export function Kpi({ label, value, unit, icon: Icon, tone = 'blue', hint, delta, deltaGood = true, href }) {
  const body = (
    <>
      {Icon && <div className={`kpi-icon tone-${tone}`}><Icon aria-hidden /></div>}
      <div className="kpi-text">
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}{unit && <small>{unit}</small>}</div>
        {(hint || delta) && (
          <div className="kpi-hint">
            {delta && <span className={deltaGood ? 'up' : 'down'}>{delta}</span>}
            {hint}
          </div>
        )}
      </div>
    </>
  );
  return href ? <Link href={href} className="kpi-card">{body}</Link> : <div className="kpi-card">{body}</div>;
}

export function Badge({ value, children, plain }) {
  if (value == null || value === '') return <span className="muted">-</span>;
  return <span className={`badge badge-${toneOf(value)} ${plain ? 'plain' : ''}`}>{children ?? value}</span>;
}

export function Seg({ value, onChange, options }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => {
        const [v, label, count] = Array.isArray(o) ? o : [o, o];
        return (
          <button key={v} type="button" role="tab" aria-selected={value === v} className={value === v ? 'active' : ''} onClick={() => onChange(v)}>
            {label}{count != null && <span className="count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function Progress({ value, color, showLabel = true }) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  const c = color ?? (v >= 100 ? 'var(--green-500)' : v >= 70 ? 'var(--brand-500)' : v >= 40 ? 'var(--sun-500)' : 'var(--red-500)');
  return (
    <div className="progress-row">
      <div className="progress"><div style={{ width: `${v}%`, background: c }} /></div>
      {showLabel && <span>{Math.round(v)}%</span>}
    </div>
  );
}

export function Stars({ value }) {
  return (
    <span className="stars" aria-label={`${value} dari 5`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={i <= value ? '' : 'off'} fill="currentColor" strokeWidth={0} aria-hidden />)}
    </span>
  );
}

export function LevelCell({ level, href, title }) {
  if (level == null) return <span className="muted">-</span>;
  if (href) return <Link href={href} className={`level-cell lv-${level}`} title={title}>{level}</Link>;
  return <span className={`level-cell lv-${level}`} title={title}>{level}</span>;
}

// Gauge cincin untuk skor 0-100.
export function Gauge({ value, size = 92, stroke = 9, color }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const col = color ?? (v >= 88 ? 'var(--green-500)' : v >= 80 ? 'var(--sun-500)' : 'var(--red-500)');
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${v}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 600ms ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontSize={size * 0.22} fontWeight="700" fill="var(--gray-900)">{Math.round(v)}%</text>
    </svg>
  );
}

export function PageHeader({ eyebrow, title, description, actions, crumbs }) {
  return (
    <>
      {crumbs && <Breadcrumb items={crumbs} />}
      <div className="page-header">
        <div>
          {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {actions && <div className="page-header-actions">{actions}</div>}
      </div>
    </>
  );
}

export function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} style={{ display: 'contents' }}>
          {i > 0 && <ChevronRight aria-hidden />}
          {it.href ? <Link href={it.href}>{it.label}</Link> : <span>{it.label}</span>}
        </span>
      ))}
    </nav>
  );
}

// Menampilkan satu nilai sel sesuai tipe kolom registry dataset.
export function CellValue({ col, row }) {
  const v = row[col.key];
  switch (col.type) {
    case 'code':
      return <span className="cell-code">{v}</span>;
    case 'title':
      return (
        <div style={{ minWidth: 180, maxWidth: 420 }}>
          <div className="cell-title">{v}</div>
          {col.sub && row[col.sub] && <div className="cell-sub">{row[col.sub]}</div>}
        </div>
      );
    case 'badge':
      return <Badge value={v} />;
    case 'date':
      return <span className="nowrap">{fmtDate(v)}</span>;
    case 'month':
      return <span className="nowrap">{monthLabel(v)}</span>;
    case 'num': {
      if (v == null) return <span className="muted">-</span>;
      const d = col.decimals === 'auto' ? (Number.isInteger(v) ? 0 : String(v).split('.')[1]?.length ?? 1) : col.decimals ?? 0;
      return <span>{col.signed && v > 0 ? '+' : ''}{fmtNum(v, d)}</span>;
    }
    case 'pct':
      return v == null ? <span className="muted">-</span> : <span>{fmtNum(v, col.decimals ?? 1)}%</span>;
    case 'progress':
      return v == null ? <span className="muted">-</span> : <div style={{ minWidth: 110 }}><Progress value={v} /></div>;
    case 'rating':
      return v == null ? <span className="muted">-</span> : <Stars value={v} />;
    case 'level':
      return v == null ? <span className="muted">-</span> : <LevelCell level={v} />;
    case 'skills':
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          {v?.map((lv, i) => lv == null ? <span key={i} className="muted">-</span> : <LevelCell key={i} level={lv} title={`Target ${row.targets?.[i] ?? "—"}`} />)}
        </div>
      );
    default:
      return v == null || v === '' ? <span className="muted">-</span> : <span>{v}</span>;
  }
}

// Filter tingkat dashboard: semua widget dan tautan drill-down ikut berubah.
export function DashFilters({ filters, onReset }) {
  const active = filters.some((f) => f.value);
  return (
    <div className="toolbar">
      {filters.map((f) => (
        <div key={f.key} style={{ minWidth: 170 }}>
          <label className="form-label" htmlFor={`df-${f.key}`}>{f.label}</label>
          <select id={`df-${f.key}`} className="form-select" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
            <option value="">{f.allLabel ?? 'Semua'}</option>
            {f.options.map((o) => {
              const [v, l] = Array.isArray(o) ? o : [o, o];
              return <option key={v} value={v}>{l}</option>;
            })}
          </select>
        </div>
      ))}
      {active && <button type="button" className="btn btn-soft btn-sm" style={{ minHeight: 38 }} onClick={onReset}>Reset</button>}
    </div>
  );
}

export function isNumericCol(col) {
  return ['num', 'pct'].includes(col.type);
}
