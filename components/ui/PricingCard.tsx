import { SubmitButton } from "@/components/ui/submit-button";
import { checkoutAction } from "@/lib/payments/actions";
import { Check } from "lucide-react";

export default function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  uprn
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features: string[];
  priceId?: string;
  uprn: string | undefined;
}) {
  console.log(priceId, uprn);
return (
  <div className="flex flex-col justify-between h-full pt-6 border border-orange-500 shadow-lg rounded-lg p-6 bg-white">
    <div>
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        with a {trialDays} day free trial
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        £{price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    <form action={checkoutAction}>
      <input type="hidden" name="priceId" value={priceId}/>
      <input type="hidden" name="uprn" value={uprn}/>
      <SubmitButton className="w-full bg-orange-500 text-white hover:text-white cursor-pointer py-3 rounded-lg mt-4 hover:bg-orange-600 transition" />
    </form>
  </div>
)}