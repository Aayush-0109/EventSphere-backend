import { Router } from "express";
import { cancelBooking , getUserBookings ,getBookingById} from "../controllers/booking.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";

const router = Router();
router.get("/:bookingId", verifyToken, getBookingById)
router.get("/get/my-bookings", verifyToken,authorizeRoles("USER","ORGANIZER"), getUserBookings)
router.delete("/:bookingId", verifyToken, cancelBooking)



export default router;