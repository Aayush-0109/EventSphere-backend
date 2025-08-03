import{ Router} from "express";
import  {imageUpload}  from "../middlewares/multer.middleware.js";
import { registerUser,loginUser , logOutUser, updateUser} from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", imageUpload.single("profileImage"),registerUser)
router.post("/login",loginUser)
router.post("/logout",verifyToken,logOutUser)
router.put("/update",verifyToken,updateUser)
export default router;