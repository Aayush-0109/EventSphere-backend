import ApiError from "../utils/ApiError.js"

const validateBody = (schema) => (req, _, next) => {
    console.log(req.body);
    const result = schema.safeParse(req.body)
    if (!result.success) {
        console.log(result.error.issues)
        const errorMessages = result.error?.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
     return  next(new ApiError(400, "Validation failed", errorMessages))
    }
    req.body = result.data;
    next()
}
const validateParams = (schema) => (req, _, next) => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
        const errorMessages = result.error?.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
       return next(new ApiError(400, "Invalid parameters", errorMessages))
    }
    req.params = result.data;
    next()
}

const validateQuery = (schema) => (req, _, next) => {
    const result = schema.safeParse(req.query)
    if (!result.success) {
        const errorMessages = result.error?.issues?.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
      return  next(new ApiError(400, "Invalid query parameters", errorMessages))
    }
    req.validatedQuery = result.data;
    next()
}
export { validateBody, validateQuery, validateParams }