import { Suspense } from 'react';
import { db } from '@/lib/db/drizzle';
import { User, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSubscriptionsForUser, getUser } from '@/lib/db/queries';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import ManageSubscription from '@/components/ui/manage-subscription';

export default async function SettingsPage() {
  const user = await getUser();

  const subscriptions = await getSubscriptionsForUser(user!.id);

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Account Settings</h1>
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
}