import { Suspense } from 'react';
import LegacyRedirect from './LegacyRedirect';
import { datasetKeys } from '@/lib/datasets';

export const dynamicParams = false;

export function generateStaticParams() {
  return datasetKeys.map((dataset) => ({ dataset }));
}

// Alamat lama /data/<dataset> diarahkan ke /<sistem>/<dataset> beserta filternya.
export default async function LegacyDataPage({ params }) {
  const { dataset } = await params;
  return (
    <Suspense>
      <LegacyRedirect dataset={dataset} />
    </Suspense>
  );
}
