import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  source: z.string().optional(),
  status: z.string().default("NEW"),
  category: z.string().optional(),
  score: z.number().default(0),
});

export const createLeadSchema = leadSchema;

export const updateLeadSchema = z.object({
  originalLead: z.object({
    timestamp: z.string(),
    email: z.string(),
  }),
  newLead: leadSchema.extend({
    timestamp: z.string(),
  }),
});

export const deleteLeadSchema = z.object({
  email: z.string(),
  timestamp: z.string(),
});

