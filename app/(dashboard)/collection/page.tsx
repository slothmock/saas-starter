import { notFound } from 'next/navigation';
import { getAddressByUprn } from '@/lib/supabase';
import { getCollectionInfo } from '@/lib/getCollectionInfo';
import BinCollectionClient from '@/components/ui/BinCollectionClient';
import { getUserSubscriptions } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import { DashboardSubscription } from '@/types';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[]> | undefined>;
}

export default async function CollectionPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const uprn = params?.uprn as string;
  if (!uprn) return notFound();

  const address = await getAddressByUprn(uprn);
  if (!address) return notFound();

  const collection = await getCollectionInfo(uprn);
  const user = await getUser();

  const subscriptions: DashboardSubscription[] =
    user?.stripeCustomerId
      ? await getUserSubscriptions(user.stripeCustomerId)
      : [];

  return (
    <section className="mt-8 m-4">
      <h2 className="text-2xl font-semibold mb-2">Next Bin Collection</h2>
      <p className="text-gray-700 mb-6">{address}</p>

      {collection ? (
        <BinCollectionClient
          bins={collection.bins}
          uprn={uprn}
          subscriptions={subscriptions}
        />
      ) : (
        <p className="text-gray-500">No upcoming collections found for this address.</p>
      )}
    </section>
  );
}
