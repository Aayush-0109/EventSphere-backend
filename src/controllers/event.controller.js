import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { prisma } from "../config/connectDB.js";
import { getPagination, getMeta } from "../utils/pagination.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const createEvent = asyncHandler(async (req, res, _) => {
    const user = req.user
    const { title, description, date, location } = req.body
    // images
    let imagePaths = []
    if (req.files) {
        imagePaths = req.files.map((image) => {
            return image.path
        })
    }
    const imageUrls = await Promise.all(imagePaths.map(async (path) => {
        const image = await uploadOnCloudinary(path, {
            folder: "events",
            resource_type: "image",
        })
        return {
            url: image.url,
            publicId: image.public_id
        }
    }))

    // create event
    const event = await prisma.event.create({
        data: {
            title,
            description,
            date: new Date(date),
            location,
            images: imageUrls,
            createdBy: user.id
        }
    })
    if (!event) {
        throw new ApiError(400, "Failed to create event")
    }
    event.images = event.images?.map((image) => {
        return image.url

    }) || []
    const eventData = {
        event: event,
        user: {
            id: user.id,
            name: user.name
        }
    }
    return res.status(201).json(
        new ApiResponse(201, eventData, "Event created successfully")
    )
}, "Create Event ")

const getEvents = asyncHandler(async (req, res, _) => {
    const { search, location, startDate, endDate, sortBy, sortOrder } = req.query
    // get pagination
    const { page, limit, skip } = getPagination(req)

    const whereClause = {
        date: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
            ...((!startDate && !endDate) && { gte: new Date() })
        },
        ...(search && {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ]
        }),
        ...(location && {
            location: { contains: location, mode: "insensitive" }
        })
    }

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    }
                }
            }
        }),
        prisma.event.count({
            where: whereClause
        })
    ])
    events.forEach((event) => {
        event.images = event.images[0]?.url || null
    })
    const response = {
        events,
        meta: getMeta(total, page, limit)
    }
    return res.status(200).json(
        new ApiResponse(200, response, "Events fetched successfully")
    )

}, "Get Events")

const getEventById = asyncHandler(async (req, res, _) => {
    const id = Number(req.params.id)
    const event = await prisma.event.findUnique({
        where: {
            id: id
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true
                }
            }
        }

    })
    if (!event) throw new ApiError(404, "Event not found")
    event.images = event.images?.map((image) => {
        return image.url
    }) || []
    return res.status(200).json(
        new ApiResponse(200, event, "Event fetched Successfully"))
}, "Get Event By ID")

const updateEvent = asyncHandler(async (req, res, _) => {
    const id = Number(req.params.id)
    // extract title, description, date, location from req.body
    const { title, description, date, location } = req.body
    // create a data object to store the updated fields
    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (date) data.date = new Date(date);
    if (location) data.location = location;

    const event = await prisma.event.findUnique({ where: { id: id } });
    if (!event) throw new ApiError(404, "Event not found");

    // Authorization: only creator or admin
    if (event.createdBy !== req.user.id && req.user.role !== "ADMIN") {
        throw new ApiError(403, "Not authorized to modify this event");
    }
    // update the event
    const updatedEvent = await prisma.event.update({
        where: {
            id: id
        },
        data,
        include: { user: { select: { id: true, name: true } } }
    })
    return res.status(200).json(
        new ApiResponse(200, updatedEvent, "Event updated successfully")
    )


}, "Update Event")

const deleteEvent = asyncHandler(async (req, res, _) => {
    const id = Number(req.params.id)
    // find the event
    const event = await prisma.event.findUnique({ where: { id: id } });
    if (!event) throw new ApiError(404, "Event not found");

    // authorization
    if (event.createdBy !== req.user.id && req.user.role !== "ADMIN") {
        throw new ApiError(403, "Not authorized to delete this event");
    }
    const deletedEvent = await prisma.event.delete({
        where: {
            id: id
        },
        include: { user: { select: { id: true, name: true } } }
    })
    // delete images from cloudinary
    await Promise.all(deletedEvent.images.map((image) => {
        return deleteFromCloudinary(image.publicId)
    }))

    return res.status(200).json(
        new ApiResponse(200, {}, "Event deleted successfully")
    )
}, " Delete Event")
export { createEvent, getEvents, getEventById, updateEvent, deleteEvent }