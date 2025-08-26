import { v2 as cloudinary } from "cloudinary";
import ApiError from "./ApiError.js";
import fs from "fs";
import { asyncHandler } from "./asyncHandler.js";
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
// Accept either a file path (string) or an in-memory buffer with originalname
// If a buffer is provided, we stream it to Cloudinary to avoid disk writes
const uploadOnCloudinary = async (file, options) => {
    try {
        if (!file) throw new ApiError(400, "Image is required");
        const processedOptions = options || {
            folder: "event-management",
            resource_type: "auto"
        }
        // If a Buffer-like object was passed (from multer memory storage)
        if (typeof file !== 'string') {
            const { buffer, originalname, mimetype } = file;
            if (!buffer) throw new ApiError(400, "Invalid file buffer");
            const streamUpload = () => new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                    ...processedOptions,
                    filename_override: originalname,
                    resource_type: processedOptions.resource_type || 'auto',
                }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                });
                stream.end(buffer);
            });
            const result = await streamUpload();
            return result;
        }
        // Fallback: a filesystem path was provided
        const result = await cloudinary.uploader.upload(file, processedOptions);
        return result;
    } catch (error) {

        throw new ApiError(500, "Error in uploading image to cloudinary");
    }
    finally {
        // If a file path string was used, try cleaning it up; ignore errors
        if (typeof file === 'string') {
            try { fs.unlinkSync(file); } catch { }
        }
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