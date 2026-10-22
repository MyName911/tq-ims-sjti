'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Layers, UserCheck, UserCog, BadgeAlert, Grid3x3, PieChart as PieIcon, GraduationCap, BookOpen, Building2, Award, CalendarClock, Search, ExternalLink } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { Badge, Card, DashFilters, Kpi, LevelCell, PageHeader, Seg, SeeAll } from '@/components/ui';
import { BarList, Columns, Donut, StackedBars } from '@/components/charts';
import { employees, trainings, certifications, SKILLS, SKILL_SHORT, LEVELS, PROGRAMS } from '@/lib/data/skill';
import { MONTHS, countBy, fmtDate, fmtNum, monthLabel, monthShort, pct, sumBy } from '@/lib/data/core';
import { drillHref } from '@/lib/datasets';
import { moduleById } from '@/lib/modules';

const mod = moduleById('skill');
const initials = (n) => n.split(/\s+/).map((x) => x[0]).slice(0, 2).join('');
const CERT_COLORS = { Aktif: '#2f8a5f', 'Akan Kadaluarsa': '#d4a73a', Kadaluarsa: '#c2453d' };

export default function SkillDashboard() {
  const router = useRouter();
  const [dept, setDept] = useState('');
  const [gol, setGol] = useState('');
  const [q, setQ] = useState('');
  const [onlyGap, setOnlyGap] = useState(false);
  const [selId, setSelId] = useState(null);
  const [profileTab, setProfileTab] = useState('ringkasan');

  const base = { ...(dept && { departemen: dept }), ...(gol && { golongan: gol }) };
  const emps = useMemo(() => employees.filter((e) => (!dept || e.departemen === dept) && (!gol || e.golongan === gol)), [dept, gol]);
  const ids = new Set(emps.map((e) => e.id));
  const st = countBy(emps, 'status');
  const lvl = countBy(emps, 'levelKeseluruhan');
  const gapBySkill = SKILLS.map((s, si) => ({ s, n: emps.filter((e) => e.skills[si] < e.targets[si]).length }));
  const trn = trainings.filter((t) => ids.has(t.empId));
  const certs = certifications.filter((c) => ids.has(c.empId));
  const certSt = countBy(certs, 'status');
  const hrefE = (extra = {}, src) => drillHref('employees', { ...base, ...extra }, { src });
  const hrefS = (extra = {}, src) => drillHref('skill-scores', { ...base, ...extra }, { src });

  const matrix = emps.filter((e) => (!onlyGap || e.status !== 'Kompeten') && (!q || `${e.nama} ${e.jabatan}`.toLowerCase().includes(q.toLowerCase())));
  const sel = emps.find((e) => e.id === selId) ?? matrix[0] ?? emps[0];

  const depts = [...new Set(emps.map((e) => e.departemen))];
  const byDept = depts.map((d) => ({ label: d, departemen: d, Kompeten: emps.filter((e) => e.departemen === d && e.status === 'Kompeten').length, 'Perlu Pengembangan': emps.filter((e) => e.departemen === d && e.status !== 'Kompeten').length }))
    .sort((a, b) => b.Kompeten + b['Perlu Pengembangan'] - a.Kompeten - a['Perlu Pengembangan']);
  const recs = PROGRAMS.map(([p, skill, metode, jam]) => {
    const list = trn.filter((t) => t.program === p && t.status !== 'Selesai');
    return { p, skill, metode, jam, n: list.length };
  }).filter((r) => r.n > 0).sort((a, b) => b.n - a.n);
  const hours = MONTHS.map((m) => ({ label: monthShort(m), bulan: m, value: sumBy(trn.filter((t) => t.bulan === m && t.status === 'Selesai'), 'jam') }));

  return (
    <AppShell moduleId={mod.id} title={mod.name}>
      <PageHeader
        crumbs={[{ label: 'ISO 9001:2026', href: '/' }, { label: mod.short }]}
        eyebrow={mod.clause}
        title="Digital Skill Matrix"
        actions={(
          <DashFilters
            onReset={() => { setDept(''); setGol(''); }}
            filters={[
              { key: 'dept', label: 'Departemen', value: dept, onChange: setDept, options: [...new Set(employees.map((e) => e.departemen))] },
              { key: 'gol', label: 'Golongan', value: gol, onChange: setGol, options: ['Operator', 'Leader', 'Staff', 'Supervisor', 'Manager'] },
            ]}
          />
        )}
      />

      <div className="stack">
        <div className="kpi-grid">
          <Kpi label="Total karyawan" value={emps.length} unit="orang" icon={Users} tone="blue" href={hrefE({}, 'KPI Total karyawan')} hint="karyawan kunci terpetakan" />
          <Kpi label="Kompetensi inti" value={SKILLS.length * emps.length} unit="penilaian" icon={Layers} tone="mint" href={hrefS({}, 'KPI Penilaian kompetensi')} hint={`${SKILLS.length} skill untuk ${emps.length} orang`} />
          <Kpi label="Karyawan kompeten" value={st.Kompeten ?? 0} icon={UserCheck} tone="sun" href={hrefE({ status: 'Kompeten' }, 'KPI Karyawan kompeten')} hint={`${pct(st.Kompeten ?? 0, emps.length)}% dari total`} />
          <Kpi label="Perlu pengembangan" value={st['Perlu Pengembangan'] ?? 0} icon={UserCog} tone="red" href={hrefE({ status: 'Perlu Pengembangan' }, 'KPI Perlu pengembangan')} hint={`${pct(st['Perlu Pengembangan'] ?? 0, emps.length)}% dari total`} />
          <Kpi label="Sertifikat akan kadaluarsa" value={certSt['Akan Kadaluarsa'] ?? 0} icon={BadgeAlert} tone="peach" href={drillHref('certifications', { ...(dept && { departemen: dept }), status: 'Akan Kadaluarsa' }, { src: 'KPI Sertifikat akan kadaluarsa' })} hint="dalam 90 hari" />
        </div>

        <div className="grid-main-side">
          <Card title="Matriks keahlian per karyawan" icon={Grid3x3} flush actions={<SeeAll href={hrefE()} />}>
            <div className="toolbar" style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)' }}>
              <div className="search-field" style={{ maxWidth: 260 }}>
                <Search aria-hidden />
                <input className="form-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama / jabatan" aria-label="Cari karyawan" />
              </div>
              <label className="flex items-center gap-2" style={{ fontSize: 13.5 }}>
                <input type="checkbox" checked={onlyGap} onChange={(e) => setOnlyGap(e.target.checked)} /> Hanya yang perlu pengembangan
              </label>
              <div className="spacer" />
              <span className="muted">{matrix.length} karyawan</span>
            </div>
            <div className="table-wrapper" style={{ maxHeight: 520, overflowY: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nama karyawan</th>
                    <th>Departemen</th>
                    {SKILLS.map((s) => <th key={s} className="center">{SKILL_SHORT[s]}</th>)}
                    <th className="num">Rata-rata</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((e) => (
                    <tr key={e.id} className="clickable" onClick={() => setSelId(e.id)} style={sel?.id === e.id ? { background: 'var(--brand-50)' } : undefined}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="user-avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{initials(e.nama)}</span>
                          <div><div className="cell-title">{e.nama}</div><div className="cell-sub">{e.jabatan}</div></div>
                        </div>
                      </td>
                      <td>{e.departemen}</td>
                      {e.skills.map((lv, si) => (
                        <td key={si} className="center" onClick={(ev) => ev.stopPropagation()}>
                          <span style={{ display: 'inline-block', outline: lv < e.targets[si] ? '2px solid var(--red-500)' : 'none', outlineOffset: 1, borderRadius: 8 }}>
                            <LevelCell level={lv} title={`${SKILLS[si]}: level ${lv}, target ${e.targets[si]}`} href={hrefS({ skill: SKILLS[si], level: lv }, `Matriks, ${SKILLS[si]} level ${lv}`)} />
                          </span>
                        </td>
                      ))}
                      <td className="num"><b>{fmtNum(e.rataRata, 1)}</b></td>
                      <td><Badge value={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="legend-inline" style={{ padding: '10px 16px', borderTop: '1px solid var(--gray-100)' }}>
              <b style={{ color: 'var(--gray-700)' }}>Level:</b>
              {[5, 4, 3, 2, 1].map((l) => <span key={l}><span className={`level-cell lv-${l}`} style={{ width: 22, height: 18, fontSize: 11 }}>{l}</span>{['', 'Sangat kurang', 'Kurang', 'Cukup', 'Baik', 'Sangat baik'][l]}</span>)}
              <span><span style={{ width: 16, height: 14, outline: '2px solid var(--red-500)', borderRadius: 4, display: 'inline-block' }} />Di bawah target jabatan</span>
            </div>
          </Card>

          {sel && (
            <Card
              title="Detail profil karyawan"
              footer={<Link href={drillHref('employees', { id: sel.id }, { open: sel.id })} className="btn btn-primary btn-sm">Lihat profil lengkap <ExternalLink /></Link>}
            >
              <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                <span className="user-avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(sel.nama)}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-900)' }}>{sel.nama}</div>
                  <div className="muted">{sel.jabatan}, {sel.departemen}</div>
                  <div style={{ marginTop: 4 }}><Badge value={sel.status} /></div>
                </div>
              </div>
              <Seg value={profileTab} onChange={setProfileTab} options={[['ringkasan', 'Ringkasan'], ['pelatihan', 'Pelatihan'], ['sertifikasi', 'Sertifikasi']]} />
              <div style={{ marginTop: 12 }}>
                {profileTab === 'ringkasan' && (
                  <table className="table-compact">
                    <thead><tr><th>Skill</th><th className="center">Level</th><th className="center">Target</th><th>Status</th></tr></thead>
                    <tbody>
                      {SKILLS.map((s, si) => (
                        <tr key={s}>
                          <td>{s}</td>
                          <td className="center"><LevelCell level={sel.skills[si]} /></td>
                          <td className="center">{sel.targets[si]}</td>
                          <td>{sel.skills[si] >= sel.targets[si] ? <Badge value="Kompeten" /> : <Badge value="Perlu Pengembangan" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {profileTab === 'pelatihan' && (
                  <div className="feed">
                    {trainings.filter((t) => t.empId === sel.id).map((t) => (
                      <Link key={t.id} href={drillHref('trainings', { id: t.id }, { open: t.id })} className="feed-item" style={{ padding: '9px 4px' }}>
                        <span className="feed-icon tone-blue"><GraduationCap /></span>
                        <span className="feed-body"><strong>{t.program}</strong><br />{t.metode}, {t.jam} jam, {fmtDate(t.tanggal)}</span>
                        <Badge value={t.status} />
                      </Link>
                    ))}
                    {trainings.every((t) => t.empId !== sel.id) && <span className="muted">Belum ada riwayat pelatihan.</span>}
                  </div>
                )}
                {profileTab === 'sertifikasi' && (
                  <div className="feed">
                    {certifications.filter((c) => c.empId === sel.id).map((c) => (
                      <Link key={c.id} href={drillHref('certifications', { id: c.id }, { open: c.id })} className="feed-item" style={{ padding: '9px 4px' }}>
                        <span className="feed-icon tone-mint"><Award /></span>
                        <span className="feed-body"><strong>{c.sertifikasi}</strong><br />Berlaku s.d. {fmtDate(c.kadaluarsa)}</span>
                        <Badge value={c.status} />
                      </Link>
                    ))}
                    {certifications.every((c) => c.empId !== sel.id) && <span className="muted">Belum ada sertifikasi.</span>}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="grid-3">
          <Card title="Distribusi level kompetensi" icon={PieIcon}>
            <Donut height={150} centerLabel="Karyawan" legend="bottom" data={LEVELS.map((l) => ({ name: l.label, value: lvl[l.level] ?? 0, color: l.color, href: hrefE({ levelKeseluruhan: l.level }, `Distribusi ${l.label}`) }))} />
          </Card>
          <Card title="Kebutuhan pelatihan per skill" icon={GraduationCap}>
            <BarList items={gapBySkill.map(({ s, n }) => ({ label: s, value: n, href: hrefS({ skill: s, status: 'Gap' }, `Kebutuhan pelatihan, ${s}`) })).sort((a, b) => b.value - a.value)} />
          </Card>
          <Card title="Rekomendasi pelatihan" icon={BookOpen} flush>
            <div className="feed">
              {recs.slice(0, 5).map((r) => (
                <Link key={r.p} href={drillHref('trainings', { program: r.p, status: ['Terjadwal', 'Berjalan'], ...(dept && { departemen: dept }) }, { src: `Rekomendasi, ${r.p}` })} className="feed-item">
                  <span className="feed-icon tone-peach"><BookOpen /></span>
                  <span className="feed-body"><strong>{r.p}</strong><br />Untuk {r.n} karyawan, {r.jam} jam, {r.metode}</span>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid-3">
          <Card title="Kompetensi per departemen" icon={Building2} style={{ gridColumn: 'span 2' }}>
            <StackedBars
              data={byDept}
              height={250}
              series={[{ key: 'Kompeten', color: '#2f8a5f' }, { key: 'Perlu Pengembangan', color: '#d08a4a' }]}
              hrefFor={(row, s) => hrefE({ departemen: row.departemen, ...(s && { status: s }) }, `Kompetensi ${row.departemen}${s ? `, ${s}` : ''}`)}
            />
            <div className="legend-inline"><span><i style={{ background: '#2f8a5f' }} />Kompeten</span><span><i style={{ background: '#d08a4a' }} />Perlu pengembangan</span></div>
          </Card>
          <Card title="Status sertifikasi" icon={Award}>
            <Donut height={140} centerLabel="Sertifikat" data={Object.keys(CERT_COLORS).map((s) => ({ name: s, value: certSt[s] ?? 0, color: CERT_COLORS[s], href: drillHref('certifications', { status: s, ...(dept && { departemen: dept }) }, { src: `Status sertifikasi, ${s}` }) }))} />
          </Card>
        </div>

        <Card title="Jam pelatihan selesai per bulan" subtitle={`Total ${fmtNum(sumBy(trn.filter((t) => t.status === 'Selesai'), 'jam'))} jam pelatihan tahun 2026`} icon={CalendarClock}>
          <Columns data={hours} height={200} unit=" jam" name="Jam pelatihan" color="#8fa2e6" hrefFor={(d) => drillHref('trainings', { bulan: d.bulan, status: 'Selesai', ...(dept && { departemen: dept }) }, { src: `Jam pelatihan ${monthLabel(d.bulan)}` })} />
        </Card>
      </div>
    </AppShell>
  );
}
