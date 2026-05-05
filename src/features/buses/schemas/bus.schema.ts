import { z } from "zod";

export const busFormSchema = z.object({
  busNumber: z.string().min(1, "Bus number is required"),
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, "Format: TS 09 UB 1234"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  seatCapacity: z.coerce.number().min(1, "Minimum 1 seat").max(100, "Maximum 100 seats"),
  fuelType: z.string().min(1, "Fuel type is required"),
  manufactureYear: z.coerce
    .number()
    .min(1900, "Year must be 1900 or later")
    .max(new Date().getFullYear(), "Year cannot be in the future"),
  insuranceExpiry: z.string().min(1, "Insurance expiry date is required"),
  fitnessExpiry: z.string().min(1, "Fitness certificate expiry is required"),
  layoutId: z.string().optional(),
});

export const editBusSchema = z.object({
  status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]),
  registrationNumber: z
    .string()
    .min(1, "Registration number is required")
    .regex(/^[A-Z]{2}\s\d{2}\s[A-Z]{1,2}\s\d{4}$/, "Format: TS 09 UB 1234"),
  seatCapacity: z.coerce.number().min(1, "Minimum 1 seat").max(100, "Maximum 100 seats"),
  insuranceExpiry: z.string().min(1, "Insurance expiry date is required"),
  layoutId: z.string().optional(),
});

export type BusFormData = z.infer<typeof busFormSchema>;
export type EditBusFormData = z.infer<typeof editBusSchema>;
