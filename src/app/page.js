import Link from 'next/link';
import Image from 'next/image';
import { MODULES } from '@/lib/modules';
import { COMPANY, CONSULTANT } from '@/lib/data/core';

export default function Hub() {
  return (
    <div className="hub">
      <header className="hub-top">
        <div className="hub-brand">
          <Image src="/brand/tq-logo.png" alt="Logo Total Quality" width={60} height={34} priority />
          <div>
            <strong>{CONSULTANT.name}</strong>
            <span>{COMPANY.name}</span>
          </div>
        </div>
      </header>

      <main className="hub-main">
        <h1 className="hub-title">ISO 9001:2026 Digital System</h1>
        <div className="hub-grid">
          {MODULES.map((m) => (
            <Link key={m.id} href={`/${m.id}`} className="hub-tile" title={`${m.name}, ${m.clause}`}>
              <span className="hub-icon"><m.icon aria-hidden /></span>
              <h3>{m.short}</h3>
            </Link>
          ))}
        </div>
      </main>

      <footer className="hub-foot">© 2026 {CONSULTANT.name}, data dummy</footer>
    </div>
  );
}
