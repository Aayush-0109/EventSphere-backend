import { emailSchema, passwordSchema } from "./common.schemas.js"
import {z} from "zod"

const registerUserSchema = z.object({
    name: z.string().min(2, "name must have atleast 2 characters").max(50, "Name cannot exceedt 50 characters").trim(),
    email: emailSchema,
    password: passwordSchema
})

const loginUserSchema = z.object({
    email: emailSchema,
    password: passwordSchema
})

const updateUserSchema = z.object({
    name: emailSchema.optional().min(2).max(50),
    password: passwordSchema.optional()
}).refine(data => data.name || data.password, "At least one field must be provided")
export {registerUserSchema,loginUserSchema,updateUserSchema}