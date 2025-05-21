import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t py-12 mt-16 text-sm text-gray-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              PembsWasteSMS
            </h2>
            <p className="mt-2 max-w-xs">
              Helping Pembrokeshire residents stay on top of bin day — no apps, just service.
            </p>
            <hr className="mt-6" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-8">
            <div className="flex flex-col gap-2">
              <Link href="/legal/privacy" className="hover:text-gray-800">Privacy Policy</Link>
              <Link href="/legal/terms" className="hover:text-gray-800">Terms & Conditions</Link>
              <Link href="/legal/cookies" className="hover:text-gray-800">Cookie Policy</Link>
              <Link href="/contact" className="hover:text-gray-800">Contact</Link>
            </div>
            <div className="mt-6 sm:mt-0">
              <p className="text-xs text-gray-500">
                Payments securely handled by Stripe.<br />
                See their <a href="https://stripe.com/gb/privacy" target="_blank">Privacy Policy</a> for more info. 
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} PembsWasteSMS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
