import { desc, and, eq, isNull } from 'drizzle-orm';
import { db } from './drizzle';
import { users, subscriptions } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getSubscriptionsForUser(userId: number) {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));
}

export async function getSubscriptionByCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId))

  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(
  subscriptionId: number,
  subscriptionData: {
    stripeSubscriptionId?: string | null;
    stripeProductId?: string | null;
    planName?: string | null;
    subscriptionStatus: string;
    uprn?: string | null;
  }
) {
  await db
    .update(subscriptions)
    .set({
      ...(subscriptionData.stripeSubscriptionId !== null && {
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      }),
      ...(subscriptionData.stripeProductId !== null && {
        stripeProductId: subscriptionData.stripeProductId,
      }),
      ...(subscriptionData.planName !== null && {
        planName: subscriptionData.planName,
      }),
      ...(subscriptionData.uprn !== null && {
        uprn: subscriptionData.uprn,
      }),
      subscriptionStatus: subscriptionData.subscriptionStatus,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, subscriptionId));
}

/**
 * Retrieves the subscriptions associated with the currently authenticated user.
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of subscription records.
 * @throws {Error} If the user is not authenticated.
 */
export async function getUserSubscriptions() {
  const user = await getUser();
  if (!user) throw new Error('User not authenticated');

  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));
}

