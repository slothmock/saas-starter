'use server';

import { createCheckoutSession, createCustomerPortalSession } from '@/lib/payments/stripe';
import { getUser } from '../db/queries';
import { redirect } from 'next/navigation';

export async function checkoutAction(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect('/sign-up')
    return;
  const priceId = formData.get('priceId')?.toString() || '';
  const uprn = formData.get('uprn')?.toString() || '';

  if (!priceId || !uprn) {
    return redirect('/');
  }

  return await createCheckoutSession({ user, priceId, uprn });
}}

export async function customerPortalAction() {
  const user = await getUser();
  if (!user) {
    return redirect('/sign-in');
  }

  return await createCustomerPortalSession(user);
}