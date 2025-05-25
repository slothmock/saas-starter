import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { Team } from '@/lib/db/schema';
import {
  getTeamByStripeCustomerId,
  getUser,
  updateTeamSubscription
} from '@/lib/db/queries';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

/**
 * Creates a Stripe checkout session for a team subscription.
 *
 * This function initializes a checkout session using Stripe's API for a given team
 * and price ID. If the team or user is not available, it redirects to the sign-up
 * page with the appropriate query parameters.  Upon successful session creation, the user is redirected to the session URL.
 *
 * @param {Team | null} team - The team object associated with the subscription.
 * @param {string} priceId - The Stripe price ID for the subscription.
 * @param {string | null} uprn - The unique property reference number for metadata.
 */
export async function createCheckoutSession({
  team,
  priceId,
  uprn
}: {
  team: Team | null;
  priceId: string;
  uprn: string | null;
}) {
  const user = await getUser();

  if (!uprn) {
    console.log('No uprn provided');
    return redirect('/');
  }

  if (!team || !user) {
    return redirect(`/sign-up?redirect=checkout&priceId=${priceId}&uprn=${uprn}`);
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: team.stripeCustomerId || undefined,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 7 },
    metadata: { uprn }
  });

  const price = await stripe.prices.retrieve(priceId);
  const product = typeof price.product === 'string'
    ? await stripe.products.retrieve(price.product)
    : price.product;

  await updateTeamSubscription(team.id, {
    stripeSubscriptionId: session.id,
    stripeProductId: product.id,
    planName: product.object,
    subscriptionStatus: 'active',
    uprn
  });

  return redirect(session.url!);
}



/**
 * Creates a customer portal session for a given team using Stripe's billing portal.
 *
 * This function checks if the team has valid Stripe customer and product IDs.
 * If not, it redirects to the pricing page. It retrieves or creates a billing
 * portal configuration if none exists, ensuring the team's product is active
 * and has active prices. The configuration allows subscription updates, cancellations,
 * and payment method updates. Finally, it creates and returns a billing portal
 * session for the team.
 *
 * @param {Team} team - The team object containing Stripe customer and product IDs.
 * @returns {Promise<Stripe.BillingPortal.Session>} A promise that resolves to the created billing portal session.
 * @throws Will throw an error if the team's product is not active or if no active prices are found.
 */
export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
    return;
  }

  const configurations = await stripe.billingPortal.configurations.list();
  let configuration = configurations.data[0];

  if (!configuration) {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true
    });

    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription'
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [{
            product: product.id,
            prices: prices.data.map(price => price.id)
          }]
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other'
            ]
          }
        },
        payment_method_update: {
          enabled: true
        }
      }
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error('Team not found for Stripe customer:', customerId);
    return;
  }

  if (status === 'active' || status === 'trialing') {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status,
      uprn: (plan?.metadata?.uprn as string)
    });
  } else if (status === 'canceled' || status === 'unpaid') {
    await updateTeamSubscription(team.id, {
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
