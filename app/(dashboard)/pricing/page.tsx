import { PricingPageServer } from '@/components/server/PricingPageServer';

export default function Page({ searchParams }: { searchParams: { uprn?: string } }) {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <PricingPageServer uprn={searchParams?.uprn} />
    </main>
  );
}
