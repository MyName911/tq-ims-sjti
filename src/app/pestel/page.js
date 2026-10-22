import { Suspense } from 'react';
import PestelDashboard from './PestelDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('pestel');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <PestelDashboard />
    </Suspense>
  );
}
