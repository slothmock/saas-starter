'use client';

import { useState, useEffect } from 'react';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import debounce from 'lodash.debounce';
import Logo from '@/components/ui/logo';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Debounced fetch logic
  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const fetchResults = debounce(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search-address?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    fetchResults();

    return () => {
      fetchResults.cancel(); // cancel debounce on unmount or rerender
    };
  }, [query]);

  const handleSelect = (addressId: string) => {
    router.push(`/collection?uprn=${addressId}`);
  };

  return (
    <main>
      <section className="py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-8">
            <Logo />
            <p className="text-base text-gray-500 sm:text-xl">
              Never forget bin day again with our super simple text reminders!
              <br />
              You can <strong>also</strong> find Pembrokeshire's next waste collection information by entering your
              address or postcode below.
            </p>

            <div className="sm:max-w-lg w-full">
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-full border shadow-sm focus:outline-none ring-2 ring-orange-500"
                  placeholder="Enter your address or postcode"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <SearchIcon className="absolute right-4 top-3.5 text-gray-400 h-5 w-5 cursor-pointer" />
              </div>

              {loading && <p className="text-sm mt-2 text-gray-500">Searching...</p>}

              {results.length > 0 && (
                <ul className="max-h-64 overflow-y-auto mt-4 border rounded-lg shadow-sm bg-white divide-y text-left">
                  {results.map((addr) => (
                    <li
                      key={addr.uprn}
                      className="px-4 py-3 hover:bg-orange-50 cursor-pointer"
                      onClick={() => handleSelect(addr.uprn)}
                    >
                      {addr.address_text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}