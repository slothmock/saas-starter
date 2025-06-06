import { redirect } from 'next/navigation';
import { User } from '@/lib/db/schema';
import { Stripe, DashboardSubscription } from '@/types';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

export async function createCheckoutSession({
  user,
  priceId,
  uprn
}: {
  user: User | null;
  priceId: string;
  uprn: string | null;
}) {
  if (!uprn) {
    console.log('No UPRN provided');
    return redirect('/');
  }

  if (!user) {
    return redirect(`/sign-up?redirect=checkout&priceId=${priceId}&uprn=${uprn}`);
  }
  const stripeId = user!.stripeCustomerId
  if (!stripeId) {
    const subscriptions = null;
  } else {
  const existingSub = await getUserSubscriptions(stripeId)
  }
  const customer =
    (
      await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          userId: user.id.toString()
        }
      })
    ).id;


  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata: {
        uprn
      }
    }
  });

  return redirect(session.url!);
}


export async function createCustomerPortalSession(user: User) {

  const stripeId = user!.stripeCustomerId

  if (!stripeId) {
    const subscriptions = null;
  } else {
    const subscriptions = await getUserSubscriptions(stripeId);
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeId,
      return_url: `${process.env.BASE_URL}/dashboard`
    });

    if (!session.url) throw new Error('Stripe session URL missing');

    return redirect(session.url);
  }
}

export async function getUserSubscriptions(user_id: string): Promise<DashboardSubscription[]> {
  const stripeSubs = await stripe.subscriptions.list({
    customer: user_id,
    status: 'all',
  });

  return stripeSubs.data.map((sub): DashboardSubscription => {
    const item = sub.items.data[0];
    const price = item.price;
    const product = price.product as Stripe.Product;
    const planName = product.name;

    return {
      id: sub.id,
      status: sub.status,
      planName,
      uprn: sub.metadata?.uprn || product.metadata?.uprn || null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      price: {
        amount: price.unit_amount ?? null,
        interval: price.recurring?.interval,
        currency: price.currency,
      },
    };
  });
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}


