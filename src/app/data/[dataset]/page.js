import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import DataExplorer from '@/components/DataExplorer';
import { DATASETS, datasetKeys } from '@/lib/datasets';

export const dynamicParams = false;

export function generateStaticParams() {
  return datasetKeys.map((dataset) => ({ dataset }));
}

export async function generateMetadata({ params }) {
  const { dataset } = await params;
  return { title: DATASETS[dataset]?.title ?? 'Data' };
}

export default async function DataPage({ params }) {
  const { dataset } = await params;
  if (!DATASETS[dataset]) notFound();
  // Filter dibaca dari query string di browser, jadi halaman tetap statis.
  return (
    <Suspense fallback={<div className="loading-block" style={{ padding: 80, textAlign: 'center', color: 'var(--gray-500)' }}>Memuat data...</div>}>
      <DataExplorer datasetKey={dataset} />
    </Suspense>
  );
}
