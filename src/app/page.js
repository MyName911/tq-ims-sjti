import Image from 'next/image';
import HubGrid from '@/components/HubGrid';
import { COMPANY, CONSULTANT } from '@/lib/data/core';

export default function Hub() {
  return (
    <div className="hub">
      <header className="hub-top">
        <div className="hub-brand">
          <Image src="/brand/sj-logo.png" alt="Logo PT Safarijunie Textindo" width={60} height={60} priority style={{ objectFit: 'contain' }} />
          <div>
            <strong>{COMPANY.name}</strong>
            <span>IMS Digital System</span>
          </div>
        </div>
      </header>

      <main className="hub-main">
        <h1 className="hub-title">Sistem Manajemen Mutu STI</h1>
        <p className="hub-scope">{COMPANY.standard} · {COMPANY.products}</p>
        <HubGrid />
      </main>

      <footer className="hub-foot">© 2026 {COMPANY.name} · Powered by {CONSULTANT.name}</footer>
    </div>
  );
}
