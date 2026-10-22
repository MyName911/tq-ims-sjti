import { Suspense } from 'react';
import AuditDashboard from './AuditDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('audit');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <AuditDashboard />
    </Suspense>
  );
}
