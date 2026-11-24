'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DATASETS } from '@/lib/datasets';

export default function LegacyRedirect({ dataset }) {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const qs = params.toString();
    router.replace(`/${DATASETS[dataset].module}/${dataset}${qs ? `?${qs}` : ''}`);
  }, [router, params, dataset]);
  return <div className="loading-block">Mengalihkan...</div>;
}
