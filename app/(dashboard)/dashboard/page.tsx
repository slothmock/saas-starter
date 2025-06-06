import { Suspense } from 'react';
import { db } from '@/lib/db/drizzle';
import { User, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import ManageSubscription from '@/components/ui/manage-subscription';
import { getUserSubscriptions } from '@/lib/payments/stripe';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) return redirect('/')
  const stripeId = user!.stripeCustomerId
  if (!stripeId) {
    const subscriptions = null;
  } else {
  const subscriptions = await getUserSubscriptions(stripeId);
  
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Your Subscriptions</h1>
      <Suspense
        fallback={
          <Card className="mb-8 h-[140px]">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <ManageSubscription subscriptions={subscriptions} />
      </Suspense>
    </section>
  );
}}