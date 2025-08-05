import { z } from "zod"
const emailSchema = z
    .email("Invalid email format")
    .min(1, "email is required")
const passwordSchema = z.string()
    .min(8, "minimun 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");

const idSchema = z.string()
    .transform(Number).refine((val) => val > 0, { message: "Id must be positive number" });

const paginationSchema = z.object({
    page: z.string()
        .optional()
        .default("1")
        .catch("1")
        .transform(Number),
    limit: z.string()
        .optional()
        .default("10")
        .catch("10")
        .transform(Number)
        .refine(limit => (limit > 0 && limit <= 100), "Limit must be between 1 to 100"),
})

export { emailSchema, passwordSchema, idSchema, paginationSchema }