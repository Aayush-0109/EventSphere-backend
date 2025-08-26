import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { prisma } from "../config/connectDB.js";
import { getMeta, getPagination } from "../utils/pagination.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import cache from "../utils/cache.js";

const getUsers = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const { search, role, sortBy, sortOrder } = req.validatedQuery || {};

    
    const whereClause = {
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ]
        }),
        ...(role && role !== 'ALL' && { role }),
    };

    
    const orderByClause = {};
    if (sortBy && sortOrder) {
        orderByClause[sortBy] = sortOrder;
    } else {
        orderByClause.createdAt = 'desc'; 
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: orderByClause,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        events: true,
                        registrations: true
                    }
                }
            }
        }),
        prisma.user.count({ where: whereClause })
    ]);

    
    const transformedUsers = users.map(user => ({
        ...user,
        eventsCount: user._count.events,
        registrationsCount: user._count.registrations,
        _count: undefined
    }));
    transformedUsers.forEach((user) => {
        user.profileImage = user.profileImage?.url || ""
    })

    const response = {
        users: transformedUsers,
        meta: getMeta(total, page, limit)
    };

    return res.status(200).json(
        new ApiResponse(200, response, "Users fetched successfully")
    );
}, "Get Users");



const deleteUser = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);
    const currentUser = req.user;

    
    if (currentUser.id === userId) {
        throw new ApiError(400, "You cannot delete your own account");
    }


    const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            events: {
                select: { id: true, images: true }
            }
        }
    });

    if (!userToDelete) {
        throw new ApiError(404, "User not found");
    }
    if (userToDelete.role === "ADMIN") throw new ApiError(400, "You cannot delete other admin's account");


    
    if (userToDelete.profileImage && typeof userToDelete.profileImage === 'object' && userToDelete.profileImage.publicId) {
        try {
            await deleteFromCloudinary(userToDelete.profileImage.publicId);
        } catch (error) {
            console.error("Failed to delete profile image:", error);
        }
    }

    for (const event of userToDelete.events) {
        if (event.images && Array.isArray(event.images)) {
            for (const image of event.images) {
                if (image.publicId) {
                    try {
                        await deleteFromCloudinary(image.publicId);
                    } catch (error) {
                        console.error("Failed to delete event image:", error);
                    }
                }
            }
        }
    }

    
    await prisma.user.delete({
        where: { id: userId }
    });

    await cache.del('GET:/api/v1/users');
    await cache.delPattern('GET:/api/v1/users?*');
    await cache.del('GET:/api/v1/events');
    await cache.delPattern('GET:/api/v1/events?*');

    return res.status(200).json(
        new ApiResponse(200, {}, "User deleted successfully")
    );
}, "Delete User");

export { getUsers, deleteUser };
