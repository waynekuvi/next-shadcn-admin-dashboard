import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  orgRole: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof userSchema>;

