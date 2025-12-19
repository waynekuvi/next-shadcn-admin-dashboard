import { z } from "zod";

export const sectionSchema = z.object({
  id: z.string().optional(),
  timestamp: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string(),
  score: z.number(),
  category: z.string(),
  status: z.string(),
  source: z.string(),
});
