'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { withTeam } from '@/lib/auth/middleware';

export const checkoutAction = withTeam(async (formData, team) => {
  console.log(`Creating checkout session for team ${team?.name}...`);
  console.log(`Form data: ${formData}`)
  const priceId = formData.get('priceId') as string;
  const uprn = formData.get('uprn') as string | null;
  await createCheckoutSession({ team, priceId, uprn });
});

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession!.url);
});
