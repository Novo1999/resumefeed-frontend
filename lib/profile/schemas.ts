import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'That name looks too short.')
    .max(80, 'That name is too long.'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
