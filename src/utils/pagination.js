

const getPagination = (req) => {
    const page = Number(req.validatedQuery.page) 
    const limit = Number(req.validatedQuery.limit) 
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