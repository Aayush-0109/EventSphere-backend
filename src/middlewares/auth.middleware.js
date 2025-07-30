import ApiError from "../utils/ApiError";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const verifyToken = asyncHandler(async (req, _, next) => {
    // Fix header case sensitivity issue
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const accessToken = req.cookies?.accessToken || authHeader?.split(" ")[1];

    if (!accessToken) {
        throw new ApiError(401, "Access token required");
    }

    // Proper JWT verification - errors will be caught by asyncHandler
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded || !decoded.id) {
        throw new ApiError(401, "Invalid access token");
    }



    // Database query with proper error handling
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