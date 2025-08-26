import { idSchema, paginationSchema } from "./common.schemas.js";
import { z } from "zod";

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
        .string().datetime("Invalid date format , use ISO string")
        .transform(date => new Date(date))
        .refine(date => date > new Date(), "Event date must be in future"),
    longitude: z.string().transform((val) => parseFloat(val)),
    latitude: z.string().transform((val) => parseFloat(val)),

    address: z.string().min(5, "Complete address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    country: z.string().min(2, "Country is required"),
    postalCode: z.string().min(3, "Postal code is required"),
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
        .string().datetime("Invalid date format , use ISO string")
        .transform(date => new Date(date))
        .refine(date => date > new Date(), "Event date must be in future")
        .optional(),
    longitude: z.string().transform((val) => parseFloat(val)),
    latitude: z.string().transform((val) => parseFloat(val)),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    state: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    postalCode: z.string().min(6).max(6).optional(),
}).refine(data => {
    const fields = [data.address, data.city, data.state, data.country, data.postalCode]
    const hasAnyAddressField = fields.some((field) => field !== undefined);
    const hasAllAddressFields = fields.every((field) => field !== undefined);

    const hasAnyGeoField = data.longitude || data.latitude
    const hasAllGeoFields = data.longitude && data.latitude
    if (hasAnyAddressField && !hasAllAddressFields) {
        return false;
    }
    if (hasAnyGeoField && !hasAllGeoFields) return false;
    if (data.title || data.description || data.date) return true;
}, "Atleast one field must be provided or If updating location, all address fields must be provided together")

const eventParamsSchema = z.object({
    id: idSchema
})
const getEventsQuerySchema = z.object({
    search: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().datetime("Invalid date format , use ISO string").optional(),
    endDate: z.string().datetime("Invalid date format , use ISO string").optional(),
    sortOrder: z.enum(["asc", "desc"])
        .catch("desc")
        .optional()
        .default("desc"),
    sortBy: z.enum(["createdAt", "date", "title"])
        .default("createdAt")
        .catch("createdAt")
        .optional(),
    ...paginationSchema.shape
})

const geoSearchSchema = z.object({
    longitude: z.string().transform((val) => parseFloat(val)),
    latitude: z.string().transform((val) => parseFloat(val)),
    radius: z.string().transform((val) => parseInt(val)),
    unit: z.enum(["km", "Mi"]).default("km"),
    ...paginationSchema.shape
})
export { getEventsQuerySchema, eventParamsSchema, updateEventSchema, createEventSchema, geoSearchSchema }