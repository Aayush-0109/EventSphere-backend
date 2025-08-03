import { z } from "zod";
import { paginationSchema ,idSchema} from "./common.schemas.js";
;

const bookingParamsSchema = z.object({
    id : idSchema,
  
})

const getBookingsQuerySchema = z.object({
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    ...paginationSchema.shape
});

export {bookingParamsSchema , getBookingsQuerySchema}