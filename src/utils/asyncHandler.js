import ApiError from "./ApiError.js";

 const  asyncHandler = (fn, route) => async (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(
            (err)=>{
                next(new ApiError(500, `Error in ${route} : ${err.message}`))
            }
        );
}

export {asyncHandler};