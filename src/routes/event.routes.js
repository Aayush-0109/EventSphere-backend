import { Router } from "express";
import {
    getEvents,
    createEvent,
    getEventById,
    updateEvent,
    deleteEvent
} from "../controllers/event.controller.js"
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import verifyToken from "../middlewares/auth.middleware.js";
const router = Router()
router.get("/", getEvents);
router.get("/:id", getEventById);

// protected routes

router.post("/", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), createEvent);
router.put("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), updateEvent);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN", "ORGANIZER"), deleteEvent);
export default router;