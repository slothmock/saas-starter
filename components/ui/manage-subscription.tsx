'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerPortalAction, viewCollectionAction } from '@/lib/payments/actions';
import { Stripe, DashboardSubscription } from '@/types';
import { redirect } from 'next/navigation';

type Props = {
  subscriptions: DashboardSubscription[];
};

export default function ManageSubscription({ subscriptions }: Props) {
  if (!subscriptions) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No subscriptions found. You can set one up below.</p>
          <Button asChild className="mt-4 rounded-full bg-orange-500">
            <a href="/">Set up Reminders</a>
          </Button>
        </CardContent>
      </Card>
    );
  } else {

    return (
      <div className="space-y-6">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="mb-8">
            <CardHeader>
              <CardTitle>
                Subscription for UPRN: {subscription.uprn || 'Not Found'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="font-medium">
                    Plan: {subscription.planName || 'Free'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.status === 'active'
                      ? 'Billed monthly'
                      : subscription.status === 'trialing'
                        ? 'Trial period'
                        : 'No active subscription'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <form action={customerPortalAction}>
                    <Button type="submit" className="rounded-full bg-gray-600 cursor-pointer">
                      Manage Subscription
                    </Button>
                  </form>

                  <form action={viewCollectionAction}>
                    <input type="hidden" name="uprn" value={subscription.uprn ?? ''} />
                    <Button type="submit" className="rounded-full bg-orange-500 cursor-pointer">
                      View Next Collection
                    </Button>
                  </form>

                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
