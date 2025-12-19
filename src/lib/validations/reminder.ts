import { z } from "zod";

export const reminderSchema = z.object({
  patient_name: z.string().min(1, "Patient name is required"),
  appointment_date: z.string().min(1, "Appointment date is required"),
  reminder_type: z.string().default("SMS"), // SMS, EMAIL, CALL
  confirmed: z.string().optional().default("No"),
  showed_up: z.string().optional().default("Pending"),
});

export const createReminderSchema = reminderSchema;

export const updateReminderSchema = z.object({
  originalReminder: z.object({
    timestamp: z.string(),
    patient_name: z.string(),
  }),
  newReminder: reminderSchema.extend({
    timestamp: z.string(),
  }),
});

export const deleteReminderSchema = z.object({
  timestamp: z.string(),
  patient_name: z.string(),
});

