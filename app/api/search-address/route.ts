import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function normalisePostcode(input: string): string | null {
  const stripped = input.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(stripped)) return null;
  return stripped.slice(0, -3) + ' ' + stripped.slice(-3);
}

function buildSearchQuery(input: string): string {
  const tokens = input.trim().toLowerCase().split(/\s+/);

  // Check each token: if it looks like a postcode, normalise it
  const processedTokens = tokens.map(token => {
    const maybePostcode = normalisePostcode(token);
    return maybePostcode ? maybePostcode.toLowerCase() : token;
  });

  // Combine into plain `&` format for strong matching
  return processedTokens.join(' & ');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json([]);
  }

  const processedQuery = buildSearchQuery(query);

  const { data, error } = await supabase
    .from('collection_addresses')
    .select('uprn, address_text')
    .textSearch('search_vector', processedQuery, {
      type: 'plain', // Use 'plain' for direct token logic
      config: 'english',
    })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
