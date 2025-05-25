import { notFound } from 'next/navigation';
import { getAddressByUprn } from '@/lib/supabase';
import { getCollectionInfo } from '@/lib/getCollectionInfo';
import BinCollectionClient from '@/components/ui/BinCollectionClient';

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function CollectionPage({ searchParams }: PageProps) {
  const uprn = typeof searchParams?.uprn === 'string' ? searchParams.uprn : undefined;
  if (!uprn) return notFound();

  const address = await getAddressByUprn(uprn);
  if (!address) return notFound();

  const collection = await getCollectionInfo(uprn);

  return (
    <section className="y-20 mt-8 m-4">
      <h2 className="text-2xl font-semibold mb-2">Next Bin Collection</h2>
      <p className="text-gray-700 mb-6">{address}</p>

      {collection ? (
        <BinCollectionClient bins={collection.bins} uprn={uprn} />
      ) : (
        <p className="text-gray-500">No upcoming collections found for this address.</p>
      )}
    </section>
  )
};

