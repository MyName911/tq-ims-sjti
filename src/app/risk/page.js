import { Suspense } from 'react';
import RiskDashboard from './RiskDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('risk');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <RiskDashboard />
    </Suspense>
  );
}
