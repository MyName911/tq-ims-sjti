import { Suspense } from 'react';
import SkillDashboard from './SkillDashboard';
import { moduleById } from '@/lib/modules';

const mod = moduleById('skill');
export const metadata = { title: mod.name };

export default function Page() {
  return (
    <Suspense>
      <SkillDashboard />
    </Suspense>
  );
}
