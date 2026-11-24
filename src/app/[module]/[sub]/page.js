import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SubModulePage from '@/components/SubModulePage';
import { MODULES } from '@/lib/modules';
import { DATASETS } from '@/lib/datasets';
import { SUBMODULES } from '@/lib/submodules';

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.flatMap((m) => m.datasets.map((sub) => ({ module: m.id, sub })));
}

export async function generateMetadata({ params }) {
  const { sub } = await params;
  return { title: SUBMODULES[sub]?.short ?? 'Data' };
}

export default async function SubPage({ params }) {
  const { module, sub } = await params;
  if (!DATASETS[sub] || DATASETS[sub].module !== module) notFound();
  // Filter dibaca dari query string di browser, jadi halaman tetap statis.
  return (
    <Suspense fallback={<div className="loading-block">Memuat data...</div>}>
      <SubModulePage datasetKey={sub} />
    </Suspense>
  );
}
