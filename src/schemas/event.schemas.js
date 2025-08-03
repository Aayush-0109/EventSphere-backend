import { idSchema ,paginationSchema} from "./common.schemas.js";
import {z }from "zod";

const createEventSchema = z.object({
    title: z.string()
        .min(3, "Title must have atleast 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .trim(),
    description: z.string()
        .min(10, " Description must Have atleast 10 characters")
        .max(1000, "description cannot exceed 1000 characters")
        .trim(),
    date: z
        .datetime("Invalid date format , use ISO string")
        .transform(date => new Date(date))
        .refine(date => date > new Date(), "Event date must be in future"),
    location: z.string()
        .min(3, "Location must have atleast 3 characters")
        .max(200, "Location cannot exceed 200 characters")
        .trim()
})

const updateEventSchema = z.object({
    title: z.string()
        .min(3, "Title must have atleast 3 characters")
        .max(100, "Title cannot exceed 100 characters")
        .trim()
        .optional(),
    description: z.string()
        .min(10, " Description must Have atleast 10 characters")
        .max(1000, "description cannot exceed 1000 characters")
        .trim()
        .optional(),
    date: z
        .datetime("Invalid date format , use ISO string")
        .transform(date => new Date(date))
        .refine(date => date > new Date(), "Event date must be in future")
        .optional(),
    location: z.string()
        .min(3, "Location must have atleast 3 characters")
        .max(200, "Location cannot exceed 200 characters")
        .trim()
        .optional()
}).refine(data => data.title || data.description || data.date || data.location, "Atleast one field must be provided")

const eventParamsSchema = z.object({
    id: idSchema
})
const getEventsQuerySchema = z.object({
    search: z.string().optional(),
    location: z.string().optional(),
    startDate: z.datetime().optional(),
    endDate: z.datetime.optional(),
    sortOrder: z.enum(["asc", "desc"])
        .default("desc")
        .catch("desc")
        .optional(),
    sortBy: z.enum(["createdAt", "date", "title"])
        .default("createdAt")
        .catch("createdAt")
        .optional(),
        ...paginationSchema.shape
})
export{getEventsQuerySchema,eventParamsSchema,updateEventSchema,createEventSchema}