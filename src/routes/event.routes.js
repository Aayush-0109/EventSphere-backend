import { Router } from "express";
import {
    getEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent,
    getNearbyEvents,
    getMyEvents
} from "../controllers/event.controller.js"
import { bookEvent, getEventBookings } from "../controllers/booking.controller.js";
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { imageUpload } from "../middlewares/multer.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware.js";
import { getEventsQuerySchema, createEventSchema, eventParamsSchema, updateEventSchema, geoSearchSchema } from "../schemas/event.schemas.js"
import { moderateRateLimit, gentleRateLimit, strictRateLimit } from "../middlewares/rateLimiting-middleware.js";
import cacheMiddleware from "../middlewares/cache.middleware.js";


const router = Router()
router.get("/", gentleRateLimit, cacheMiddleware(300), validateQuery(getEventsQuerySchema), getEvents);
router.get("/:id", gentleRateLimit, cacheMiddleware(300), validateParams(eventParamsSchema), getEventById);
router.get("/search/nearby", gentleRateLimit, cacheMiddleware(300), validateQuery(geoSearchSchema), getNearbyEvents)




router.get("/get/my-events", verifyToken, authorizeRoles("ORGANIZER", "ADMIN"),gentleRateLimit,validateQuery(getEventsQuerySchema), getMyEvents);
router.post("/", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), strictRateLimit, imageUpload.array("images", 10), validateBody(createEventSchema), createEvent);
router.put("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), strictRateLimit, validateParams(eventParamsSchema), validateBody(updateEventSchema), updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), moderateRateLimit, validateParams(eventParamsSchema), deleteEvent);

router.post("/:id/book", verifyToken, authorizeRoles("USER", "ORGANIZER"), moderateRateLimit, validateParams(eventParamsSchema), bookEvent)
router.get("/get/bookings/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), moderateRateLimit, validateParams(eventParamsSchema), validateQuery(getEventsQuerySchema), getEventBookings)
export default router;