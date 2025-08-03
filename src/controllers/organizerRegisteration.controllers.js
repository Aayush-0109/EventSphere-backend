import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { prisma } from "../config/connectDB.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { getMeta, getPagination } from "../utils/pagination.js"
const createOrganizerRequest = asyncHandler(async (req, res) => {
    const user = req.user;
    const overview = req.body.overview;
    if (!overview) throw new ApiError(400, "Request Overview Required")
    let resume = null
    if (req.file) {
        const uploadedResume = await uploadOnCloudinary(req.file.path, {
            folder: "resume",
            resource_type: "raw"
        })
        if (!uploadedResume) throw new ApiError(500, "Error in uploading resume to cloudinary");
        resume = {
            url: uploadedResume.url,
            publicId: uploadedResume.public_id
        }
    }

    const existingRequest = await prisma.organizerRequest.findFirst(
        {
            where: {
                userId: user.id
            }
        }
    )

    if (existingRequest) {
        throw new ApiError(400, "You have already apllied with request id " + existingRequest.id);
    }
    const createdRequest = await prisma.organizerRequest.create({
        data: {
            userId: user.id,
            overview,
            resume
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true
                }
            }
        }
    })
    if (!createdRequest) throw new ApiError(500, "Could not create the request ")
    createdRequest.resume = createdRequest.resume?.url
    return res.status(201).json(
        new ApiResponse(201, createdRequest, "Request created successfully")
    )


}, " create organizer request")

const getOrganizerRequests = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req)
    const sortOrder = req.query?.sortOrder === "asc" ? "asc" : "desc"
    const [requests, total] = await Promise.all([
        prisma.organizerRequest.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: sortOrder
            }
        }),
        prisma.organizerRequest.count()
    ])
    requests.forEach((request) => {
        request.resume = request.resume?.url
    })
    const response = {
        requests,
        meta: getMeta(total, page, limit)
    }
    return res.status(200).json(new ApiResponse(200, response, "requests fetched successfully"))
}, " get organizer Requests")

const getOrganizerRequestsById = asyncHandler(async (req, res) => {
    const requestId = Number(req.params.id)
    if (isNaN(requestId)) throw new ApiError(400, "Request id is Invalid")

    const organizerRequest = await prisma.organizerRequest.findUnique({
        where: {
            id: requestId
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true
                }
            }
        }
    })
    // removing public id from response
    if (!organizerRequest) throw new ApiError(404, "organizer request not found");
    organizerRequest.user.profileImage = organizerRequest.user.profileImage?.url
    organizerRequest.resume = organizerRequest.resume?.url


    return res.status(200).json(new ApiResponse(200, organizerRequest, "Request fetched successfully"))


}, " get organizer request by id")

const updateRequestStatus = asyncHandler(async (req, res) => {
    // validating request
    const allowedStatus = ["PENDING", "ACCEPTED", "REJECTED"];
    const id = Number(req.params.id);
    if(isNaN(id)) throw new ApiError(400, "invalid id ")
    const status = req.body.status?.toUpperCase();
    if (!allowedStatus.includes(status)) throw new ApiError(400, "Invalid status")
    // extracting request and updating
    const existingRequest = await prisma.organizerRequest.findUnique({
        where: {
            id
        }
    })
    if (!existingRequest) throw new ApiError(404, "Organizer request not found")
    if (status === existingRequest.status) throw new ApiError(400, "Invalid status : same as before")
      const response = await prisma.$transaction(async (tx)=>{
        const updatedRequest = await tx.organizerRequest.update({
        where: {
            id,
        },
        data: {
            status
        }
    })
   
    // updating user role
    const userId = updatedRequest.userId;
    const user = await tx.user.findUnique({
        where: {
            id: userId
        },
        select: {
            name: true,
            id: true,
            role: true,
        }
    })
    const oldRole = user.role
    let newRole = null;
    if (status === "ACCEPTED" && oldRole === "USER") {
        newRole = "ORGANIZER"
    }
    else if (status !== "ACCEPTED" && oldRole === "ORGANIZER") {
        newRole = "USER"
    }
    let updatedUser = null
    if (newRole) {
        updatedUser = await tx.user.update({
            where: {
                id: userId
            },
            data: {
                role: newRole
            },
            select: {
                name: true,
                id: true,
                role: true,
            }
        })
    }
    return {updatedRequest,updatedUser}
    })
      // removing public id from response
      response.updatedRequest.resume = response.updatedRequest?.resume?.url
    return res.status(200).json(
        new ApiResponse(200, response, "Status updated Successfully")
    )

}, "Update request status")

export { createOrganizerRequest, getOrganizerRequests, getOrganizerRequestsById ,updateRequestStatus}

