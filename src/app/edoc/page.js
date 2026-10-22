import { Suspense } from 'react';
import EdocDashboard from './EdocDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('edoc');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <EdocDashboard />
    </Suspense>
  );
}
