import { Router } from "express";
import {
    getEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js"
import { bookEvent, getEventBookings } from "../controllers/booking.controller.js";
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { imageUpload } from "../middlewares/multer.middleware.js";
const router = Router()
router.get("/", getEvents);
router.get("/:id", getEventById);

// protected routes



router.post("/", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"),imageUpload.array("images",10), createEvent);
router.put("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), deleteEvent);

router.post("/:eventId/book",verifyToken,authorizeRoles("USER","ORGANIZER"),bookEvent)
router.get("/get/bookings/:eventId",verifyToken,authorizeRoles("ADMIN","ORGANIZER"),getEventBookings)
export default router;