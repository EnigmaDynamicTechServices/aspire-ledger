import multer, { diskStorage } from "multer";
import { existsSync, mkdirSync, unlink } from "fs";
import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";

// Ensure the upload directory exists
// Create __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "upload");

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files to the 'upload' directory
  },
  filename: (req, file, cb) => {
    // Unique filename with timestamp and original file name
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/\s+/g, "_");
    cb(null, `${timestamp}-${cleanFileName}`);
  },
});

let imageFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/svg+xml", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image are allowed!"), false);
  }
};

let fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDFs are allowed!"), false);
  }
};

let uploadImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: imageFilter,
}).single("image");

let uploadFile = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
}).single("file");

let deleteFile = function (request) {
  const file = request.file;
  const files = request.files;

  if (file != null) {
    unlink(file.path, function (err) {
      if (err) {
        winston.error(
          `${err.status || 500}  Error deleting file - ${err.message} `
        );
      }
    });
  } else if (files != null) {
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        unlink(files[i].path, function (err) {
          if (err) {
            winston.error(
              `${err.status || 500}  Error deleting list of files - ${
                err.message
              } `
            );
          }
        });
      }
    }
  }
};

let deleteFileByUrl = async function (request, fileUrl) {
  if (fileUrl != null && fileUrl.length > 0) {
    const filePath = await fileUrl.replace(
      `${request.protocol + "://" + request.get("host") + "/"}`,
      ""
    );
    unlink(filePath, function (err) {
      if (err) {
        winston.error(
          `${err.status || 500}  Error deleting file by url - ${err.message} `
        );
      }
    });
  }
};

export default {
  uploadImage,
  uploadFile,
  deleteFile,
  deleteFileByUrl,
};
