'use client';

import Image from 'next/image';
import { binMap } from '@/lib/utils';
import { DashboardSubscription } from '@/types';

type Bin = {
  name: string;
  date: string;
};

type Props = {
  bins: Bin[];
  uprn: string;
  subscriptions: DashboardSubscription[];
};

export default function BinCollectionClient({ bins, uprn, subscriptions }: Props) {
  const isAlreadySubscribed = subscriptions.some(
    (sub) => sub.uprn === uprn && sub.status !== 'canceled'
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {bins.map((bin, idx) => {
          const { shortName, image } = binMap[bin.name] ?? {
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
                  src={image}
                  alt={shortName}
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <p className="font-medium">{shortName}</p>
              <p className="text-sm text-gray-600">{bin.date}</p>
            </div>
          );
        })}
      </div>

      {!isAlreadySubscribed && (
        <div className="text-center mt-10">
          <a
            href={`/pricing?redirect=checkout&uprn=${uprn}`}
            className="bg-orange-500 hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow font-semibold transition"
          >
            Get Text Reminders
          </a>
        </div>
      )}

      {isAlreadySubscribed && (
        <div className="text-center mt-10 text-sm text-gray-600 font-medium">
          You're already subscribed to reminders for this address.
        </div>
      )}
    </div>
  );
}
