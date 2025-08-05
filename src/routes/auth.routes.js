import{ Router} from "express";
import  {imageUpload}  from "../middlewares/multer.middleware.js";
import { registerUser,loginUser , logOutUser, updateUser} from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import {registerUserSchema,loginUserSchema,updateUserSchema} from "../schemas/auth.schemas.js"
import { strictRateLimit  } from "../middlewares/rateLimiting-middleware.js";
const router = Router();
router.post("/register",strictRateLimit, imageUpload.single("profileImage"),validateBody(registerUserSchema),registerUser)
router.post("/login",strictRateLimit,validateBody(loginUserSchema),loginUser)
router.post("/logout",verifyToken,strictRateLimit,logOutUser)
router.put("/update",verifyToken,strictRateLimit,validateBody(updateUserSchema),updateUser)
export default router;