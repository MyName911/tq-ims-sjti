'use client';

import { useState } from 'react';
import { FORMS, initialValues } from '@/lib/forms';

// Form tambah / ubah data. Nilai disimpan sebagai teks lalu dibangun menjadi
// baris lengkap oleh FORMS[key].build.
export default function RecordForm({ datasetKey, row, get, onSubmit, onCancel, submitLabel = 'Simpan' }) {
  const form = FORMS[datasetKey];
  const [values, setValues] = useState(() => initialValues(datasetKey, row));
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    for (const f of form.fields) {
      const v = values[f.key];
      if (f.required && (v === '' || v == null)) next[f.key] = 'Wajib diisi';
      if (f.type === 'number' && v !== '' && v != null) {
        const n = Number(v);
        if (Number.isNaN(n)) next[f.key] = 'Harus angka';
        else if (f.min != null && n < f.min) next[f.key] = `Minimal ${f.min}`;
        else if (f.max != null && n > f.max) next[f.key] = `Maksimal ${f.max}`;
      }
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit(form.build(values, { get, existing: row }));
  };

  return (
    <form className="record-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        {form.fields.map((f) => {
          const id = `f-${datasetKey}-${f.key}`;
          const opts = typeof f.options === 'function' ? f.options(get) : f.options;
          const common = { id, value: values[f.key] ?? '', onChange: (e) => set(f.key, e.target.value), 'aria-invalid': !!errors[f.key] };
          return (
            <div key={f.key} className={`form-group ${f.span === 'full' ? 'span-full' : ''}`}>
              <label className={`form-label ${f.required ? 'required' : ''}`} htmlFor={id}>{f.label}</label>
              {f.type === 'select' ? (
                <select className="form-select" {...common}>
                  <option value="">Pilih</option>
                  {opts.map((o) => {
                    const [v, l] = Array.isArray(o) ? o : [o, o];
                    return <option key={v} value={v}>{l}</option>;
                  })}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea className="form-input" rows={3} {...common} />
              ) : (
                <input className="form-input" type={f.type ?? 'text'} min={f.min} max={f.max} step={f.step} {...common} />
              )}
              {errors[f.key] && <div className="form-error">{errors[f.key]}</div>}
            </div>
          );
        })}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>Batal</button>
        <button type="submit" className="btn btn-primary btn-sm">{submitLabel}</button>
      </div>
    </form>
  );
}
