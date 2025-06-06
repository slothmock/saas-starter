'use server';

import { createCheckoutSession, createCustomerPortalSession } from '@/lib/payments/stripe';
import { getUser } from '../db/queries';
import { redirect } from 'next/navigation';

export async function checkoutAction(formData: FormData) {
  const user = await getUser();
  if (user === null) {
    redirect('/sign-up')
    return;
  }
  const priceId = formData.get('priceId')?.toString() || '';
  const uprn = formData.get('uprn')?.toString() || '';

  if (priceId === '' || uprn === '') {
    console.log("No priceId or UPRN");
    return redirect('/');
  }

  return await createCheckoutSession({ user, priceId, uprn });
}

export async function customerPortalAction() {
  const user = await getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  return await createCustomerPortalSession(user);
}

export async function viewCollectionAction(formData: FormData) {
  const uprn = formData.get('uprn')?.toString() || '';
  if (!uprn) {
    console.log("No UPRN provided");
    return redirect('/');
  }
  return redirect(`/collection?uprn=${uprn}`);
}