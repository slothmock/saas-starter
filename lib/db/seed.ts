import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const monthlyProduct = await stripe.products.create({
    name: 'Monthly',
    description: 'Monthly subscription plan',
  });

  await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 199, 
    currency: 'gbp',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const annualProduct = await stripe.products.create({
    name: 'Annual',
    description: 'Annual subscription plan',
  });

  await stripe.prices.create({
    product: annualProduct.id,
    unit_amount: 2199,
    currency: 'gbp',
    recurring: {
      interval: 'year',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  const email = 'admin@pembswastesms.uk';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Reminder',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
