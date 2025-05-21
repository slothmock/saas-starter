import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getCollectionInfo } from '@/lib/getCollectionInfo';
import BinCollectionClient from './BinCollectionClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function CollectionPage({ searchParams }: { searchParams: { uprn?: string } }) {
  const params = await searchParams;
  const uprn = params?.uprn;

  if (!uprn) return notFound();

  // Fetch address
  const { data: addressData, error } = await supabase
    .from('collection_addresses')
    .select('address_text')
    .eq('uprn', uprn)
    .single();

  if (error || !addressData) return notFound();

  const collection = await getCollectionInfo(uprn);

  return (
    <section className="y-20 mt-8 m-4">
      <h2 className="text-2xl font-semibold mb-2">Next Bin Collection</h2>
      <p className="text-gray-700 mb-6">{addressData.address_text}</p>

      {collection ? (
        <BinCollectionClient bins={collection.bins} uprn={uprn} />
      ) : (
        <p className="text-gray-500">No upcoming collections found for this address.</p>
      )}
    </section>
  );
}
