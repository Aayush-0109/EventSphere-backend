import { Router } from "express";
import { cancelBooking , getUserBookings ,getBookingById} from "../controllers/booking.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import{bookingParamsSchema , getBookingsQuerySchema} from "../schemas/booking.schemas.js"
import { validateParams, validateQuery } from "../middlewares/validation.middleware.js";
import { moderateRateLimit,gentleRateLimit, strictRateLimit  } from "../middlewares/rateLimiting-middleware.js";
const router = Router();
router.get("/:id", verifyToken,moderateRateLimit,validateParams(bookingParamsSchema), getBookingById)
router.get("/get/my-bookings",verifyToken,moderateRateLimit,authorizeRoles("USER","ORGANIZER"),validateQuery(getBookingsQuerySchema),getUserBookings)
router.delete("/:id", verifyToken,moderateRateLimit ,validateParams(bookingParamsSchema),cancelBooking)



export default router;