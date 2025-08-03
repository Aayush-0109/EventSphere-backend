import ApiError from "../utils/ApiError.js"

const validateBody = (schema) => (req, _, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
        const errorMessages = result.error?.errors?.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
        throw new ApiError(400,"Validation failed",errorMessages)
    }
    req.body = result.data;
    next()
}
const validateParams = (schema) =>(req,_,next)=>{
    const result = schema.safeParse(req.params)
    if (!result.success) {
        const errorMessages = result.error?.errors?.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
        throw new ApiError(400,"Invalid parameters",errorMessages)
    }
    req.params = result.data;
    next()
}

const validateQuery = (schema) =>(req,_,next)=>{
    const result = schema.safeParse(req.query)
    if (!result.success) {
        const errorMessages = result.error?.errors?.map((err) => ({
            field: err.path.join('.'),
            message: err.message
        }))
        throw new ApiError(400,"Invalid query parameters",errorMessages)
    }
    req.query = result.data;
    next()
}
export{ validateBody,validateQuery,validateParams}