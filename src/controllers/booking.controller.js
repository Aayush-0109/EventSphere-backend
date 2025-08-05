import { prisma } from "../config/connectDB.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { getPagination, getMeta } from "../utils/pagination.js"
const bookEvent = asyncHandler(async (req, res) => {
    //get the event id from the request
    const eventId = Number(req.params.id);
    const user = req.user


    // check if the event exists
    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    })
    if (!event) {
        throw new ApiError(404, "Event not found")
    }

    // check if user is not the organizer of the event
    if (event.createdBy === user.id) {
        throw new ApiError(400, "You cannot register for your own event")
    }

    // check if the registration already exists
    const existingRegistration = await prisma.registration.findUnique(
        {
            where: {
                userId_eventId: {
                    userId: user.id,
                    eventId: event.id
                }
            }
        }
    )
    if (existingRegistration) throw new ApiError(400, `You have already registered for this event with registration id ${existingRegistration.id}`)
    // create the registration

    const newregistration = await prisma.registration.create({
        data: {
            userId: user.id,
            eventId: event.id
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true
                }
            },
            event: {
                select: {
                    title: true,
                    description: true,
                    date: true,
                    location: true,

                }
            }
        }
    })

    // send the response
    res.status(201).json(new ApiResponse(201, newregistration, "Registration created successfully"))
}, "Register for Event")
const getBookingById = asyncHandler(async (req, res) => {
    const bookingId = Number(req.params.id);
    // if (isNaN(bookingId)) throw new ApiError(400, "Invalid Booking ID")
    const booking = await prisma.registration.findUnique({
        where: {
            id: bookingId
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true
                }
            },
            event: {
                select: {
                    title: true,
                    date: true,
                    location: true,
                    description: true
                }
            }
        }
    })
    if (!booking) throw new ApiError(404, "Booking not found")
    res.status(200).json(new ApiResponse(200, booking, "Booking fetched successfully"))
}, "Get Booking By Id")
const getEventBookings = asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    // if (isNaN(id)) throw new ApiError(400, "Invalid Event ID")
    const { page, limit, skip } = getPagination(req)
    const { sortOrder } = req.validatedQuery ? req.validatedQuery :{}
    const [registrations, total] = await Promise.all([prisma.registration.findMany({
        where: {
            eventId: id
        },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    profileImage: true
                }
            }
        },
        skip,
        take : limit,
        orderBy :{
            createdAt : sortOrder
        }
    }), prisma.registration.count({
        where: {
            eventId: id
        },
    })])
    res.status(200).json(new ApiResponse(200, {
        registrations,
        meta: getMeta(total, page, limit)
    }, "Bookings fetched successfully"))

}, "Get bookings for an event")

const getUserBookings = asyncHandler(async (req, res) => {
    const user = req.user;
    const { page, limit, skip } = getPagination(req)
    const { sortOrder } = req.validatedQuery ? req.validatedQuery : {}
    const [registrations, total] = await Promise.all([
        prisma.registration.findMany({
            where: {
                userId: user.id
            },
            include: {
                event: {
                    select: {
                        title: true,
                        date: true,
                        location: true,
                        description: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: sortOrder
            }

        }),
        prisma.registration.count({
            where: {
                userId: user.id
            }
        })
    ])
    res.status(200).json(new ApiResponse(200, {
        registrations,
        meta: getMeta(total, page, limit)

    }, "Bookings fetched successfully"))
}, "Get bookings for a user")

const cancelBooking = asyncHandler(async (req, res) => {
    const bookingId = Number(req.params.id)
    // if (isNaN(bookingId)) throw new ApiError(400, "Invalid Booking ID")
    const user = req.user;
    const booking = await prisma.registration.findUnique({
        where: {
            id: bookingId
        },
        include: {
            event: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    createdBy: true
                }
            }
        }
    })
    if (!booking) throw new ApiError(404, "Booking not found")

    const isOwner = user.id === booking.userId;
    const isAdmin = user.role === "ADMIN";
    const isOrganizer = user.id === booking.event.createdBy;

    if (!isOwner && !isAdmin && !isOrganizer) {
        throw new ApiError(403, "You are not authorized to cancel this booking");
    }
    // event.date is a Date object from Prisma
    const eventDate = new Date(booking.event.date);
    const now = new Date();

    // Calculate time difference in milliseconds
    const diffMs = eventDate - now;

    // Convert to hours
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
        throw new ApiError(400, "Cannot cancel registration within 24 hours of the event");
    }
    await prisma.registration.delete({
        where: {
            id: bookingId
        }
    })
    res.status(200).json(new ApiResponse(200, null, "Booking cancelled successfully"))
}, "Cancel a booking")

export { bookEvent, getEventBookings, getUserBookings, cancelBooking, getBookingById }