import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { prisma } from "../config/connectDB.js";
import { getPagination, getMeta } from "../utils/pagination.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import cache from "../utils/cache.js";
import geo from "../utils/geoService.js";
const createEvent = asyncHandler(async (req, res, _) => {
    const user = req.user
    const { title, description, date, address, city, state, country, postalCode, longitude, latitude } = req.body

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
            address,
            city,
            state,
            country,
            postalCode,
            longitude,
            latitude,
            images: imageUrls,
            createdBy: user.id
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
    })

    if (!event) {
        throw new ApiError(500, "Failed to create event")
    }
    await geo.addEvent(event.id, longitude, latitude)
    event.images = event.images?.map((image) => {
        return image.url

    }) || []

    await geo.removePattern("NearbyFrom:*")
    await cache.del('GET:/api/v1/events');
    await cache.delPattern('GET:/api/v1/events?*')
    return res.status(201).json(
        new ApiResponse(201, event, "Event created successfully")
    )
}, "Create Event ")

const getEvents = asyncHandler(async (req, res, _) => {

    const { search, location, startDate, endDate, sortBy, sortOrder } = req.validatedQuery ? req.validatedQuery : {}
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
            OR: [
                { address: { contains: location, mode: "insensitive" } },
                { city: { contains: location, mode: "insensitive" } },
                { state: { contains: location, mode: "insensitive" } },
                { country: { contains: location, mode: "insensitive" } },
            ]
        }),




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
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            }
        }),
        prisma.event.count({
            where: whereClause
        })
    ])
    events.forEach((event) => {
        event.images = event.images[0]?.url || null;
        event.registrations = event._count?.registrations || 0;
        delete event._count
    })


    const response = {
        events,
        meta: getMeta(total, page, limit)
    }
    return res.status(200).json(
        new ApiResponse(200, response, "Events fetched successfully")
    )

}, "Get Events")

const getNearbyEvents = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req);
    const { longitude, latitude, radius, unit } = req.validatedQuery;
    const { geoEvents, total } = await geo.getNearbyEvents(longitude, latitude, radius, unit);
    const paginatedGeoEvents = geoEvents.slice(skip, skip + limit);
    const eventIds = paginatedGeoEvents.map((geoEvent) => (Number(geoEvent[0])))
    const eventsFromDB = await prisma.event.findMany({
        where: {
            id: {
                in: eventIds
            }
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                }
            },
            _count: {
                select: {
                    registrations: true
                }
            }
        }
    })
    const eventMap = new Map(eventsFromDB.map(e => [e.id, e]));
    const events = paginatedGeoEvents.map(geoEvent => {
        const event = eventMap.get(Number(geoEvent[0]));
        if (event) {
            event.images = event.images ? event.images[0]?.url : null;
            event.registrations = event._count?.registrations || 0
            delete event._count
            event.distance = parseFloat(geoEvent[1]); // Add distance info
        }
        return event;
    }).filter(event => event !== null);
    return res.status(200).json(new ApiResponse(200, {
        events,
        meta: getMeta(total, page, limit)
    }, "Events fetched successfully"))

}, "get nearby events")

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
                    name: true,
                    profileImage: true
                }
            },
            _count: {
                select: {
                    registrations: true
                }
            }
        }

    })
    if (!event) throw new ApiError(404, "Event not found")
    event.images = event.images?.map((image) => {
        return image.url
    }) || []
    event.registrations = event._count?.registrations
    delete event._count
    return res.status(200).json(
        new ApiResponse(200, event, "Event fetched Successfully"))
}, "Get Event By ID")

const updateEvent = asyncHandler(async (req, res, _) => {
    const id = Number(req.params.id)
    // extract title, description, date, location from req.body
    const { title, description, date, address, city, state, country, postalCode, longitude, latitude } = req.body
    // create a data object to store the updated fields
    const data = {};
    if (title) data.title = title;
    if (description) data.description = description;
    if (date) data.date = new Date(date);
    if (address) {
        data.address = address,
            data.city = city,
            data.state = state,
            data.country = country,
            data.postalCode = postalCode
    }
    if (longitude) {
        data.longitude = longitude,
            data.latitude = latitude
    }

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
        include: {
            user: {
                select: {
                    id: true, name: true, profileImage: true
                }
            },
            _count: {
                select: {
                    registrations: true
                }
            }
        }
    })
    updateEvent.registrations = updateEvent._count?.registrations
    delete updateEvent._count
    if (longitude) await geo.updateEvent(id, longitude, latitude);
    // cache invalidation
    await geo.removePattern("NearbyFrom:*")
    await cache.del('GET:/api/v1/events');
    await cache.delPattern('GET:/api/v1/events?*')
    await cache.del(`GET:/api/v1/events/${id}`)
    //  cache.del('GET:/api/')
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

    // cache invalidation
    await geo.removeEvent(id)
    await geo.removePattern("NearbyFrom:*")
    await cache.del('GET:/api/v1/events');
    await cache.delPattern('GET:/api/v1/events?*')
    await cache.del(`GET:/api/v1/events/${id}`)

    return res.status(200).json(
        new ApiResponse(200, {}, "Event deleted successfully")
    )
}, " Delete Event")

const getMyEvents = asyncHandler(async (req, res) => {
    const user = req.user;
    const { page, limit, skip } = getPagination(req);
    const { sortBy, sortOrder } = req.validatedQuery || {};

    const whereClause = {
        createdBy: user.id
    };

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: {
                [sortBy || 'createdAt']: sortOrder || 'desc'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    }
                },
                _count: {
                    select: {
                        registrations: true
                    }
                }
            }
        }),
        prisma.event.count({ where: whereClause })
    ]);


    events.forEach((event) => {
        event.images = event.images[0]?.url || null;

        event.registrations = event._count?.registrations || 0;
        delete event._count;
    });

    const response = {
        events,
        meta: getMeta(total, page, limit)
    };


    return res.status(200).json(
        new ApiResponse(200, response, "My events fetched successfully")
    );
}, "Get My Events");
export { createEvent, getEvents, getNearbyEvents, getEventById, updateEvent, deleteEvent, getMyEvents }