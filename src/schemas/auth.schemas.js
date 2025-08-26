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
    name: z.string().min(2).max(50).optional(),
    password: passwordSchema.optional()
}).refine(data => data.name || data.password, "At least one field must be provided")

const sendOtpSchema = z.object({
    email : emailSchema
})

const verifyOtpSchema = z.object({
    email : emailSchema,
    otp : z.string().min(6).max(6).transform((val)=>parseInt(val))
})

export {registerUserSchema,loginUserSchema,updateUserSchema,sendOtpSchema,verifyOtpSchema}