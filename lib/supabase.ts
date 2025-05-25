import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAddressByUprn(uprn: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('collection_addresses')
    .select('address_text')
    .eq('uprn', uprn)
    .single();

  if (error || !data) return null;

  return data.address_text;
}
