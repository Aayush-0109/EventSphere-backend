import{ Router} from "express";
import  {upload}  from "../middlewares/multer.middleware.js";
import { registerUser,loginUser } from "../controllers/auth.controller.js";
const router = Router();
router.post("/register", upload.single("profileImage"),registerUser)
router.post("/login",loginUser)
export default router;