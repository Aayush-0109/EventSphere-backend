import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware.js"
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import { createOrganizerRequest, getOrganizerRequests, getOrganizerRequestsById, updateRequestStatus } from "../controllers/organizerRequest.controllers.js";
import { pdfUpload } from "../middlewares/multer.middleware.js";
import { updateRequestStatusSchema, createdOrganizerRequestSchema, organizerRequestParamsSchema, getOrganizerRequestsQuerySchema } from "../schemas/organizerRequest.schemas.js"
import { validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware.js";
import { strictRateLimit } from "../middlewares/rateLimiting-middleware.js";
const router = Router()
router.post("/create", verifyToken, strictRateLimit, authorizeRoles("USER"), pdfUpload.single("resume"), validateBody(createdOrganizerRequestSchema), createOrganizerRequest)
router.get("/get", verifyToken, authorizeRoles("ADMIN"), validateQuery(getOrganizerRequestsQuerySchema), getOrganizerRequests);
router.get("/get/:id", verifyToken, authorizeRoles("ADMIN"), validateParams(organizerRequestParamsSchema), getOrganizerRequestsById)
router.put("/update/:id", verifyToken, authorizeRoles("ADMIN"), validateParams(organizerRequestParamsSchema), validateBody(updateRequestStatusSchema), updateRequestStatus)


export default router
