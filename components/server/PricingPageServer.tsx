'use server';

import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import PricingCard from '../ui/PricingCard';

export async function revalidate() {
    return 3600;
}

export async function PricingPageServer({ uprn }: { uprn?: string }) {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const monthlyPlan = products.find((product) => product.name === 'Monthly');
  const annualPlan = products.find((product) => product.name === 'Annual');
  const monthlyPrice = prices.find((price) => price.productId === monthlyPlan?.id);
  const annualPrice = prices.find((price) => price.productId === annualPlan?.id);

  return (
    <div className="grid md:grid-cols-2 gap-20 max-w-2xl mx-auto">
      <PricingCard
        name={monthlyPlan?.name || 'Monthly'}
        price={monthlyPrice?.unitAmount || 99}
        interval={monthlyPrice?.interval || 'month'}
        trialDays={monthlyPrice?.trialPeriodDays || 14}
        features={[
          'Weekly SMS Reminders',
          'Email Support',
          'Cancel anytime'
        ]}
        priceId={monthlyPrice?.id}
        uprn={uprn}
      />
      <PricingCard
        name={annualPlan?.name || 'Annual'}
        price={annualPrice?.unitAmount || 999}
        interval={annualPrice?.interval || 'annual'}
        trialDays={annualPrice?.trialPeriodDays || 7}
        features={[
          'Everything in Base, and:',
          '2 months completely free!',
        ]}
        priceId={annualPrice?.id}
        uprn={uprn}
      />
    </div>
  );
}
