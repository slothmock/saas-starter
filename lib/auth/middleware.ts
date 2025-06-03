import { z } from 'zod';
import { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // allows for additional custom state
};

type ValidatedActionFunction<S extends z.ZodTypeAny, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

/**
 * Runs a Zod-validated action with no auth required.
 */
export function validatedAction<S extends z.ZodTypeAny, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (_prevState: ActionState, formData: FormData): Promise<T | ActionState> => {
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }
    return action(parsed.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodTypeAny, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;

/**
 * Runs a Zod-validated action that requires an authenticated user.
 */
export function validatedActionWithUser<S extends z.ZodTypeAny, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (_prevState: ActionState, formData: FormData): Promise<T | ActionState> => {
    const user = await getUser();
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
    }

    return action(parsed.data, formData, user);
  };
}
