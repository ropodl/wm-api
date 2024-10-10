import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { tenant_id } = req.headers;
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const destinationPath = `uploads/media/${tenant_id}/${year}/${month}/${day}`;

    // Create the destination folder if it does not exist
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    cb(null, destinationPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.toLowerCase().replace(/\s/g, "-"));
  },
});

const imageFileFilter = (req, file, cb) => {
  if (!file) {
    cb("Image file missing", false);
  }
  if (!file.mimetype.startsWith("image")) {
    cb("Supports only image files", false);
  }
  cb(null, true);
};

const videoFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("video")) {
    cb("Supports only video files", false);
  }
  cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("application/")) {
    cb("Supports only document files", false);
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1000000000 },
});
export const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 1000000000 },
});
export const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 1000000000 },
});
