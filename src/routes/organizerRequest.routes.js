import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware.js"
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import { createOrganizerRequest ,getOrganizerRequests, getOrganizerRequestsById , updateRequestStatus} from "../controllers/organizerRegisteration.controllers.js";
import { pdfUpload   } from "../middlewares/multer.middleware.js";
const router = Router()
 router.post("/create",verifyToken, authorizeRoles("USER"),pdfUpload.single("resume"),createOrganizerRequest)
 router.get("/get",verifyToken,authorizeRoles("ADMIN"),getOrganizerRequests);
 router.get("/get/:id",verifyToken,authorizeRoles("ADMIN"), getOrganizerRequestsById)
 router.put("/update/:id",verifyToken,authorizeRoles("ADMIN"),updateRequestStatus)


export default router