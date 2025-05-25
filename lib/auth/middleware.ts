import { z } from 'zod';
import { TeamDataWithMembers, User } from '@/lib/db/schema';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;


/**
 * Executes a validated action using a Zod schema to parse and validate form data.
 *
 * @template S - The Zod schema type used for validation.
 * @template T - The return type of the action function.
 * @param {S} schema - The Zod schema to validate the form data against.
 * @param {ValidatedActionFunction<S, T>} action - The action function to execute if validation succeeds.
 * @returns {Promise<T>} A promise that resolves to the result of the action function or an error object.
 */
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }
    return action(result.data, formData);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  user: User
) => Promise<T>;


/**
 * Executes a validated action with user authentication.
 *
 * @template S - The Zod schema type for validation.
 * @template T - The return type of the action function.
 * @param {S} schema - The Zod schema used to validate the form data.
 * @param {ValidatedActionWithUserFunction<S, T>} action - The action function to execute if validation succeeds.
 * @returns {Function} A function that takes the previous action state and form data,
 *                     validates the form data against the schema, and executes the action
 *                     with the validated data and authenticated user.
 * @throws {Error} If the user is not authenticated.
 */
export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) throw new Error('User is not authenticated');

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }
    return action(result.data, formData, user);
  };
}

type ActionWithTeamFunction<T> = (
  formData: FormData,
  team: TeamDataWithMembers
) => Promise<T>;


/**
 * Wraps an action function with user and team validation logic.
 *
 * @template T - The return type of the action function.
 * @param {ActionWithTeamFunction<T>} action - The action function to be executed with the team data.
 * @returns {Function} A function that takes form data, validates the user and team, and executes the action.
 * @throws Will redirect to '/sign-up' if the user is not authenticated.
 * @throws Will throw an error if the team is not found.
 */
export function withTeam<T>(action: ActionWithTeamFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) redirect('/sign-up');

    const team = await getTeamForUser();
    if (!team) throw new Error('Team not found');

    return action(formData, team);
  };
}