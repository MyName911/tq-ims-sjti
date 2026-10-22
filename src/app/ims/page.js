import { Suspense } from 'react';
import ImsDashboard from './ImsDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('ims');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <ImsDashboard />
    </Suspense>
  );
}
