
import { z } from "zod";
import { idSchema } from "./common.schemas.js";

const getUsersQuerySchema = z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().min(1).max(100).optional(),
    role: z.enum(['USER', 'ORGANIZER', 'ADMIN', 'ALL']).optional(),
    sortBy: z.enum(['name', 'email', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
});
const deleteUserParamSchema = z.object({
  id : idSchema
})

export { getUsersQuerySchema ,deleteUserParamSchema};