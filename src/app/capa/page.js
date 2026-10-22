import { Suspense } from 'react';
import CapaDashboard from './CapaDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('capa');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <CapaDashboard />
    </Suspense>
  );
}
