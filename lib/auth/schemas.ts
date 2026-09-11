import { z } from 'zod';

/** Must be >= the password policy set in the Supabase dashboard. */
export const MIN_PASSWORD_LENGTH = 8;

const emailField = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .pipe(z.email('That does not look like an email address.'));

export const loginSchema = z.object({
  email: emailField,
  // Not MIN_PASSWORD_LENGTH: a password predating the current policy should
  // still reach Supabase and be rejected there.
  password: z.string().min(1, 'Enter your password.'),
});

export const signupSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'That name looks too short.')
    .max(80, 'That name is too long.'),
  email: emailField,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

export type AuthFieldName = keyof SignupValues;
export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

export function toFieldErrors(error: z.ZodError): AuthFieldErrors {
  const { fieldErrors } = z.flattenError(error);
  const result: AuthFieldErrors = {};
  const entries = Object.entries(fieldErrors) as [AuthFieldName, string[] | undefined][];

  for (const [field, messages] of entries) {
    const first = messages?.[0];
    if (first) result[field] = first;
  }

  return result;
}
