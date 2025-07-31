import {v2 as cloudinary} from "cloudinary";
import ApiError from "./ApiError.js";
import fs from "fs";
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async(path)=>{
    try {
        if(!path) throw new ApiError(400,"Image path is required");
        const options = {
            folder : "event-management",
            resource_type : "auto"
        }
       const result = await cloudinary.uploader.upload(path,options);
      await fs.unlinkSync(path);
       return result;
    } catch (error) {
        throw new ApiError(500,"Error in uploading image to cloudinary");
        await fs.unlinkSync(path);
    }
}
export {uploadOnCloudinary}