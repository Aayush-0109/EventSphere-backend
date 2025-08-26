import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {prisma} from "../config/connectDB.js"
import {asyncHandler} from "../utils/asyncHandler.js";
import { de } from "zod/v4/locales";

const verifyToken = asyncHandler(async (req, _, next) => {
   
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const accessToken = req.cookies?.accessToken || authHeader?.split(" ")[1];

    if (!accessToken) {
        throw new ApiError(401, "Access token required");
    }

    
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded || !decoded.id) {
        throw new ApiError(401, "Invalid access token");
    }



    
    const userFound = await prisma.user.findUnique({
        where: {
            id: decoded.id
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,

        }
    });

    if (!userFound) {
        throw new ApiError(401, "User not found or inactive");
    }

    req.user = userFound;
    next();
}, "JWT verification");

export default verifyToken;