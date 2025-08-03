

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
const fileFilter = (req,file,cb)=> {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if(allowedTypes.includes(file.mimeType)){
        return cb(null,true);
    } else{
        return(cb(new ApiError(400,"Invalid file type. Only PNG, JPG, and JPEG are allowed."),false));
    }
}
export const upload = multer({storage, fileFilter});
 