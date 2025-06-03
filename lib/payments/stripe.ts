import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { subscriptions, User } from '@/lib/db/schema';
import {
  getSubscriptionByCustomerId,
  updateSubscription,
  getSubscriptionsForUser
} from '@/lib/db/queries';

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
    console.log('No uprn provided');
    return redirect('/');
  }

  if (!user) {
    return redirect(`/sign-up?redirect=checkout&priceId=${priceId}&uprn=${uprn}`);
  }

  const existingSub = await getSubscriptionByCustomerId(user.id.toString());

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: existingSub?.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 7,
      metadata: { uprn }
    }
  });

  return redirect(session.url!);
}

export async function createCustomerPortalSession(user: User) {

  const subscription = await getSubscriptionByCustomerId(user.id.toString());
  if (!subscription?.stripeCustomerId) throw new Error('No Stripe customer found');

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`
  });


  if (!session.url) throw new Error('Stripe session URL missing');
  return redirect(session.url);

}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const user = await getSubscriptionByCustomerId(customerId);
  if (!user) {
    console.error('User not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateSubscription(user.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: plan?.nickname || '',
      subscriptionStatus: status,
      uprn: subscription.metadata?.uprn || null
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateSubscription(user.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status,
      uprn: null
    });
  }
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


