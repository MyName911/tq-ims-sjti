'use client';

import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { facetCounts, fieldLabel, rangeFields } from '@/lib/datasets';

// Dropdown pilihan ganda dengan jumlah data per nilai.
export function MultiSelect({ label, options, selected, onChange, display = (v) => v }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const shown = q ? options.filter(([v]) => String(display(v)).toLowerCase().includes(q.toLowerCase())) : options;
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  const summary = selected.length === 0 ? 'Semua' : selected.length === 1 ? display(selected[0]) : `${selected.length} dipilih`;
  return (
    <div className="ms">
      <span className="form-label">{label}</span>
      <button type="button" className={`ms-trigger ${selected.length ? 'on' : ''}`} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className="ms-value">{summary}</span>
        <ChevronDown size={15} aria-hidden />
      </button>
      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="ms-menu" role="listbox" aria-multiselectable="true">
            {options.length > 8 && (
              <div className="search-field ms-search">
                <Search aria-hidden />
                <input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari" aria-label={`Cari ${label}`} autoFocus />
              </div>
            )}
            <div className="ms-list">
              {shown.map(([v, n]) => (
                <label key={v} className="ms-option">
                  <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} />
                  <span className="ms-name">{display(v)}</span>
                  <span className="ms-count">{n}</span>
                </label>
              ))}
              {shown.length === 0 && <div className="muted" style={{ padding: 8 }}>Tidak ada pilihan.</div>}
            </div>
            {selected.length > 0 && (
              <button type="button" className="btn-ghost ms-clear" onClick={() => onChange([])}>Bersihkan</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Panel filter lanjutan: semua kolom kategori + rentang tanggal/angka.
export default function FilterPanel({ ds, rowsFor, cat, range, setCat, setRange, display }) {
  const ranges = rangeFields(ds);
  return (
    <div className="filter-panel">
      {ds.facets.map((key) => (
        <MultiSelect
          key={key}
          label={fieldLabel(ds, key)}
          options={facetCounts(rowsFor(key), key)}
          selected={cat[key] ?? []}
          onChange={(vals) => setCat(key, vals)}
          display={(v) => display(key, v)}
        />
      ))}
      {ranges.map((c) => {
        const isDate = c.type === 'date';
        const r = range[c.key] ?? {};
        return (
          <div key={c.key} className="range-field">
            <span className="form-label">{c.label}{isDate ? '' : ' (min - maks)'}</span>
            <div className="range-inputs">
              <input className="form-input" type={isDate ? 'date' : 'number'} value={r.from ?? ''} onChange={(e) => setRange(c.key, e.target.value, r.to)} aria-label={`${c.label} dari`} placeholder="Dari" />
              <span className="muted">s.d.</span>
              <input className="form-input" type={isDate ? 'date' : 'number'} value={r.to ?? ''} onChange={(e) => setRange(c.key, r.from, e.target.value)} aria-label={`${c.label} sampai`} placeholder="Sampai" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
