'use client';

import Image from 'next/image';
import { binMap } from '@/lib/utils';

type Bin = {
  name: string;
  date: string;
};

export default function BinCollectionClient({
  bins,
  uprn,
}: {
  bins: Bin[];
  uprn: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bins.map((bin, idx) => {
          const mapped = binMap[bin.name] ?? {
            shortName: bin.name,
            image: '/binImages/default.svg',
          };

          return (
            <div
              key={idx}
              className="bg-white p-4 rounded shadow-lg text-center border border-orange-500"
            >
              <div className="flex justify-center mb-2">
                <Image
                  src={mapped.image}
                  alt={mapped.shortName}
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <p className="font-medium">{mapped.shortName}</p>
              <p className="text-sm text-gray-600">{bin.date}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <a
          href={`/sign-up?uprn=${uprn}`}
          className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow font-semibold transition"
        >
          Get Text Reminders
        </a>
      </div>
    </div>
  );
}
