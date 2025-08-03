import { z } from "zod";
import { idSchema, paginationSchema } from "./common.schemas.js";


const createdOrganizerRequestSchema = z.object({
    overview: z.string()
        .min(5, "Overview must be atleast 5 characters")
        .max(100, "Overview cannot exceed 100 characters")
        .trim()
})
const getOrganizerRequestsQuerySchema = z.object({
    sortOrder: z.enum(["asc", "desc"])
        .default("desc")
        .catch("desc")
        .optional(),
    ...paginationSchema.shape
})

const organizerRequestParamsSchema = z.object({
    id: idSchema
})
const updateRequestStatusSchema = z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "PENDING"], {
        errorMap: () => ({ message: "Status must be PENDING, ACCEPTED, or REJECTED" })
    })
})

export { updateRequestStatusSchema , organizerRequestParamsSchema,getOrganizerRequestsQuerySchema,createdOrganizerRequestSchema}