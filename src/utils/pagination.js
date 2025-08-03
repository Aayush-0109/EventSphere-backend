

const getPagination = (req) => {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    return {
        page,
        limit,
        skip
    }
}

const getMeta = (total, page, limit) => {
    return {
        total,
        page,
        limit,
        skip: (page - 1) * limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
    }
}
export { getPagination, getMeta }