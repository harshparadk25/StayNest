import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
import {CloudinaryStorage} from "multer-storage-cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "staynest/properties",
    allowedFormats: ["jpg", "png", "jpeg"], 
  },
});

const upload = multer({ storage });
export default upload;



