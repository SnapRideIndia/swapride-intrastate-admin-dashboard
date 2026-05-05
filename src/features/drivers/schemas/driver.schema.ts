import { z } from "zod";

export const driverFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50, "Name must be less than 50 characters"),
  licenseNumber: z
    .string()
    .min(5, "License number must be at least 5 characters")
    .regex(/^[A-Z0-9-]+$/, "License number must be alphanumeric (uppercase)"),
  mobileNumber: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  license: z
    .any()
    .refine((files) => files && files.length > 0, "License document is required")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
      "Only .jpg, .png, and .webp formats are supported",
    ),
  photo: z
    .any()
    .refine((files) => files && files.length > 0, "Profile photo is required")
    .refine((files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (files) => !files || files.length === 0 || ["image/jpeg", "image/png", "image/webp"].includes(files[0].type),
      "Only .jpg, .png, and .webp formats are supported",
    ),
});

export const editDriverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobileNumber: z.string().min(10, "Valid mobile number is required"),
  licenseNumber: z.string().min(5, "License number is required"),
  status: z.string(),
});

export type DriverFormData = z.infer<typeof driverFormSchema>;
export type EditDriverFormData = z.infer<typeof editDriverSchema>;
