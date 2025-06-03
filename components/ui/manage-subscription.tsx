'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import type { Subscription } from '@/lib/db/schema';

type Props = {
  subscriptions: Subscription[];
};

export default function ManageSubscription({ subscriptions }: Props) {
  if (!subscriptions.length) {
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
  }

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
                  {subscription.subscriptionStatus === 'active'
                    ? 'Billed monthly'
                    : subscription.subscriptionStatus === 'trialing'
                      ? 'Trial period'
                      : 'No active subscription'}
                </p>
              </div>

              <form action={customerPortalAction}>
                <Button type="submit" className="rounded-full bg-orange-500">
                  Manage Subscription
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
