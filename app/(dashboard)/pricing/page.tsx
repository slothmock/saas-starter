import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const monthlyPlan = products.find((product) => product.name === 'Monthly');
  const annualPlan = products.find((product) => product.name === 'Annual');

  const monthlyPrice = prices.find((price) => price.productId === monthlyPlan?.id);
  const annualPrice = prices.find((price) => price.productId === annualPlan?.id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <PricingCard
          name={monthlyPlan?.name || 'Monthly'}
          price={monthlyPrice?.unitAmount || 99}
          interval={monthlyPrice?.interval || 'month'}
          trialDays={monthlyPrice?.trialPeriodDays || 7}
          features={[
            'Weekly SMS Reminders',
            'Add multiple numbers per household (99p charge)',
            'Email Support',
            'Cancel anytime'
          ]}
          priceId={monthlyPrice?.id}
        />
        <PricingCard
          name={annualPlan?.name || 'Annual'}
          price={annualPrice?.unitAmount || 999}
          interval={annualPrice?.interval || 'annual'}
          trialDays={annualPrice?.trialPeriodDays || 7}
          features={[
            'Everything in Base, and:',
            '2 months completely free',
          ]}
          priceId={annualPrice?.id}
        />
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
}) {
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with a {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        £{price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          per number / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
