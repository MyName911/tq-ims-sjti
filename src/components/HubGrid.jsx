'use client';

import Link from 'next/link';
import { MODULES } from '@/lib/modules';
import { SIDEBAR_INTRO_KEY } from '@/lib/ui-state';

// Masuk ke sistem dari halaman main: sidebar ditampilkan sesaat lalu disembunyikan
// (lihat AppShell), agar pengguna tahu sidebar ada tetapi dashboard tampil penuh.
const markIntro = () => {
  try { sessionStorage.setItem(SIDEBAR_INTRO_KEY, '1'); } catch { /* mode privat */ }
};

export default function HubGrid() {
  return (
    <div className="hub-grid">
      {MODULES.map((m) => (
        <Link key={m.id} href={`/${m.id}`} className="hub-tile" title={`${m.name}, ${m.clause}`} onClick={markIntro}>
          <span className="hub-icon"><m.icon aria-hidden /></span>
          <h3>{m.short}</h3>
        </Link>
      ))}
    </div>
  );
}
