

import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/temp");
    },
    filename: function(req,file,cb){
        cb(null,Date.now() + "-" + file.originalname);
    }
})
// image
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, "Invalid image type"), false);
};
export const imageUpload = multer({ storage, fileFilter: imageFileFilter });

// pdf
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new ApiError(400, "Invalid file type, only PDF allowed"), false);
};
export const pdfUpload = multer({ storage, fileFilter: pdfFileFilter ,limits: { fileSize: 2 * 1024 * 1024 }});
