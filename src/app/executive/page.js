import { Suspense } from 'react';
import ExecutiveDashboard from './ExecutiveDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('executive');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <ExecutiveDashboard />
    </Suspense>
  );
}
