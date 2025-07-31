import ApiError from "../utils/ApiError.js";
const notfound = (req,res,next)=>{
    const error = new ApiError(404, "Route not found")
    res.status(error.statuscode).json({
        success: false,
        message: error.message
    })
}

const errorHandler = (err,req,res,next)=>{
    console.log(err)
    if(err instanceof ApiError){
        res.status(err.statuscode).json({
            success: false,
            message: err.message,
            errors : err.errors
        })
    }
    else{
        res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error"
        })
    }   
    
    
}

export {notfound, errorHandler}