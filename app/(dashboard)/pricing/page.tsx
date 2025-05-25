// app/pricing/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import PricingPageServer from '@/components/server/PricingPageServer';

export default function PricingPage() {
  const searchParams = useSearchParams();
  const uprn = searchParams.get('uprn') ?? undefined;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PricingPageServer uprn={uprn} />
    </main>
  );
}
