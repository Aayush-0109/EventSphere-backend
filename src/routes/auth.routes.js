import { Router } from "express";
import { imageUpload } from "../middlewares/multer.middleware.js";
import { registerUser, loginUser, logOutUser, updateUser, refreshAccessToken, getUser, sendOtp, verifyOtp,getSocketToken } from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { validateBody, validateQuery } from "../middlewares/validation.middleware.js";
import { registerUserSchema, loginUserSchema, updateUserSchema, sendOtpSchema, verifyOtpSchema } from "../schemas/auth.schemas.js"
import { gentleRateLimit, strictRateLimit } from "../middlewares/rateLimiting-middleware.js";
const router = Router();
router.get("/me",verifyToken,gentleRateLimit,getUser)
router.post("/register", strictRateLimit, imageUpload.single("profileImage"), validateBody(registerUserSchema), registerUser)
router.post("/login", strictRateLimit, validateBody(loginUserSchema), loginUser)
router.post("/refresh-token", strictRateLimit, refreshAccessToken)
router.post("/logout", verifyToken, strictRateLimit, logOutUser)
router.put("/update", verifyToken, strictRateLimit, validateBody(updateUserSchema), updateUser)
router.post("/send-otp",strictRateLimit,validateQuery(sendOtpSchema),sendOtp);
router.post("/verify-otp",strictRateLimit,validateQuery(verifyOtpSchema),verifyOtp)
router.post("/socket-token",verifyToken, strictRateLimit, getSocketToken);
export default router;