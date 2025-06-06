'use server';

import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, type User } from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
  uprn: z.string().optional()
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const isPasswordValid = await comparePasswords(password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  await setSession(user);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    const uprn = formData.get('uprn') as string | null;
    return createCheckoutSession({ user, priceId, uprn });
  }

  redirect('/dashboard');
});

const signUpSchema = z.object({
  username: z.string().min(1, 'Name is required').max(100),
  email: z.string().email(),
  password: z.string().min(8),
  uprn: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { username, email, password, uprn } = data;

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser) return { error: 'User already exists.', email, password };

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name: username, email: email, passwordHash: passwordHash }).returning();
  if (!user) return { error: 'Failed to create user.', email, password };

  await setSession(user);

  const redirectTo = formData.get('redirect') as string | null;
  if (redirectTo === 'checkout') {
    const priceId = formData.get('priceId') as string;
    const uprn = formData.get('uprn') as string;
    return createCheckoutSession({ user, priceId, uprn });
  }

  redirect('/dashboard');
});

export async function signOut() {
  const user = (await getUser()) as User;
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await db
      .update(users)
      .set({ passwordHash: newPasswordHash })
      .where(eq(users.id, user.id));

    return {
      success: 'Password updated successfully.'
    };
  }
);

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user: User) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')`
      })
      .where(eq(users.id, user.id));

    (await cookies()).delete('session');
    redirect('/');
  }
);

const updateAccountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address')
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const { name, email } = data;

    await db.update(users).set({ name, email }).where(eq(users.id, user.id));

    return { name, success: 'Account updated successfully.' };
  }
);
