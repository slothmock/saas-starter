import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { setSession } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import Stripe from 'stripe';
import { users } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.redirect(new URL('/pricing', request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer', 'subscription'],
    });

    const stripeCustomer = session.customer;
    const stripeSubscription = session.subscription;

    if (
      !stripeCustomer ||
      typeof stripeCustomer === 'string' ||
      !stripeSubscription ||
      typeof stripeSubscription === 'string'
    ) {
      throw new Error('Missing or invalid customer/subscription object from Stripe.');
    }

    const customerId = stripeCustomer.id;
    const subscriptionId = stripeSubscription.id;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    });

    const plan = subscription.items.data[0]?.price;
    if (!plan) throw new Error('No plan found for this subscription.');

    const product = plan.product as Stripe.Product;
    const uprn = subscription.metadata?.uprn;
    const productId = product.id;

    if (!uprn || !productId) {
      throw new Error('Missing UPRN or Product ID in subscription metadata.');
    }

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(userId)))
      .limit(1);

    if (user.length === 0) {
      throw new Error('User not found in database.');
    }

    await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
      })
      .where(eq(users.id, Number(userId)));

    console.log(`✔ Subscription synced for user ${user[0].stripeCustomerId} with UPRN ${uprn}`);
    await setSession(user[0]);

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('❌ Error in Stripe checkout callback:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}
