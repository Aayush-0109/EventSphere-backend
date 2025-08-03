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
import { validateBody ,validateParams, validateQuery} from "../middlewares/validation.middleware.js";
import{getEventsQuerySchema,createEventSchema,eventParamsSchema,updateEventSchema} from "../schemas/event.schemas.js"



const router = Router()
router.get("/",validateQuery(getEventsQuerySchema), getEvents);
router.get("/:id",validateParams(eventParamsSchema), getEventById);

// protected routes



router.post("/", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"),imageUpload.array("images",10),validateBody(createEventSchema), createEvent);
router.put("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"),validateParams(eventParamsSchema),validateBody(updateEventSchema), updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"),validateParams(eventParamsSchema), deleteEvent);

router.post("/:id/book",verifyToken,authorizeRoles("USER","ORGANIZER"),validateParams(eventParamsSchema),bookEvent)
router.get("/get/bookings/:id",verifyToken,authorizeRoles("ADMIN","ORGANIZER"),validateParams(eventParamsSchema),validateQuery(getEventsQuerySchema),getEventBookings)
export default router;