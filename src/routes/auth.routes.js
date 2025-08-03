import{ Router} from "express";
import  {imageUpload}  from "../middlewares/multer.middleware.js";
import { registerUser,loginUser , logOutUser, updateUser} from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validation.middleware.js";
import {registerUserSchema,loginUserSchema,updateUserSchema} from "../schemas/auth.schemas.js"
const router = Router();
router.post("/register", imageUpload.single("profileImage"),validateBody(registerUserSchema),registerUser)
router.post("/login",validateBody(loginUserSchema),loginUser)
router.post("/logout",verifyToken,logOutUser)
router.put("/update",verifyToken,validateBody(updateUserSchema),updateUser)
export default router;