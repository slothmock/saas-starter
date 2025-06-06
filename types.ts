import Stripe from "stripe";

export { Stripe };

export type DashboardSubscription = {
  id: string;
  status: Stripe.Subscription.Status;
  planName: string;
  uprn: string | null;
  cancelAtPeriodEnd: boolean;
  price: {
    amount: number | null;
    interval: Stripe.Price.Recurring.Interval | undefined;
    currency: string;
  };
};

