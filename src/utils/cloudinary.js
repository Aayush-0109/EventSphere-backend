import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from "fs";
import { asyncHandler } from "./asyncHandler.js";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const uploadOnCloudinary = async (path, options) => {
    try {
        if (!path) throw new ApiError(400, "Image path is required");
        const processedOptions = options || {
            folder: "event-management",
            resource_type: "auto"
        }
        const result = await cloudinary.uploader.upload(path, processedOptions);
        return result;
    } catch (error) {

        throw new ApiError(500, "Error in uploading image to cloudinary");
    }
    finally {
         fs.unlinkSync(path);
    }
}

const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        if (result.result !== "ok") {
            throw new ApiError(404, "Image not found");
        }
        return result;
    } catch (error) {
        throw new ApiError(500, "Error in deleting image from cloudinary");
    }

}
export { uploadOnCloudinary, deleteFromCloudinary }