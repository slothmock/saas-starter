import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const customerId = session.customer as string;
      const userId = session.client_reference_id;

      if (!userId || !customerId) {
        console.warn('⚠️ Missing client_reference_id or customer ID in session.');
        break;
      }

      await db
        .update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, parseInt(userId)));

      console.log(`✅ Synced Stripe customer ID ${customerId} to user ${userId}`);
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const user = await db
        .select()
        .from(users)
        .where(eq(users.stripeCustomerId, customerId))
        .limit(1);

      if (!user.length) {
        console.warn('⚠️ No user found with Stripe customer ID:', customerId);
        break;
      }

      console.log(
        `📡 Received subscription event ${event.type} for user ${user[0].id}, status: ${subscription.status}`
      );

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
