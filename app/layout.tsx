import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';

export const metadata: Metadata = {
  title: 'PembsWasteSMS',
  description: 'Pembrokeshire Waste Collecton information and text reminder service'
};

export const viewport: Viewport = {
  maximumScale: 0.5
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] max-w-[100dvw] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser(),
            }
          }}
        >
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
