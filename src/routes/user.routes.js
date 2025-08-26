import { Router } from "express";
import verifyToken from "../middlewares/auth.middleware.js";
import authorizeRoles from "../middlewares/authorzeRoles.middleware.js";
import { validateParams, validateQuery } from "../middlewares/validation.middleware.js";
import { getUsers, deleteUser } from "../controllers/user.controller.js";
import { deleteUserParamSchema, getUsersQuerySchema } from "../schemas/user.schemas.js";

const router = Router()


router.get("/", verifyToken, authorizeRoles("ADMIN"), validateQuery(getUsersQuerySchema), getUsers);
router.delete("/:id", verifyToken, authorizeRoles("ADMIN"), validateParams(deleteUserParamSchema), deleteUser);

export default router