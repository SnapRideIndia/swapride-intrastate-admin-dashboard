import { z } from "zod";

export const pointFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Pincode must be exactly 6 digits").regex(/^\d+$/, "Pincode must contain only numbers"),
  address: z.string().min(5, "Full address is required"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  images: z.array(z.any()).default([]),
});

export type PointFormData = z.infer<typeof pointFormSchema>;
