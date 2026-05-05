import { z } from "zod";

export const adminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone number is required"),
  roleId: z.string().min(1, "Role is required"),
  status: z.enum(["Active", "Inactive", "Suspended"]),
  department: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  profilePicture: z.any().optional(),
});

export const createAdminSchema = adminSchema
  .extend({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[!@#$%^&*]/, "Password must contain a special character (!@#$%^&*)"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updateAdminSchema = adminSchema;

export type AdminFormData = z.infer<typeof adminSchema>;
export type CreateAdminFormData = z.infer<typeof createAdminSchema>;
