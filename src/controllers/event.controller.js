import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { prisma } from "../config/connectDB.js";

const createEvent = asyncHandler(async (req, res, _) => {
    const user = req.user
    const { title, description, date, location } = req.body
    if (!title || !description || !date || !location) {
        throw new ApiError(400, "All fields are required")
    }
    const event = await prisma.event.create({
        data: {
            title,
            description,
            date: new Date(date),
            location,
            createdBy: user.id
        }
    })
    if (!event) {
        throw new ApiError(400, "Failed to create event")
    }
   const eventData = {
    event : event,
    user : {
        id : user.id,
        name : user.name
    }
   }
    return res.status(201).json(
        new ApiResponse(201, eventData, "Event created successfully")
    )
}, "Create Event ")

const getEvents = asyncHandler(async (req, res, _) => {
    const events = await prisma.event.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    })

    return res.status(200).json(
        new ApiResponse(200, events, "Events fetched successfully")
    )

}, "Get Events")

const getEventById = asyncHandler(async (req, res, _) => {
    const id = Number(req.params.id)
    if (isNaN(id)) throw new ApiError(400, "Event ID is invalid")
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
    return res.status(200).json(
        new ApiResponse(200, event, "Event fetched Successfully"))
}, "Get Event By ID")

const updateEvent = asyncHandler(async (req, res, _) => {
    // id is required
    const id = Number(req.params.id)
    if (isNaN(id)) throw new ApiError(400, "Event ID is invalid")

    // extract title, description, date, location from req.body
    const { title, description, date, location } = req.body
    if (!title && !description && !date && !location) throw new ApiError(400, "At least one field (title, description, date, or location) must be provided")

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
    if (isNaN(id)) throw new ApiError(400, "Event ID is invalid")

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

    return res.status(200).json(
        new ApiResponse(200, deletedEvent, "Event deleted successfully")
    )
}, " Delete Event")
export { createEvent, getEvents, getEventById, updateEvent, deleteEvent }