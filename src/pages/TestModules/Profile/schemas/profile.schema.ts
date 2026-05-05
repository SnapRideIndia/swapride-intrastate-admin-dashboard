import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  gender: z.string().optional(),
  dateOfBirth: z.date().optional(),
  bloodGroup: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
