import multer from "multer";
import { validateFileType, validateFileSize } from "../utils/uploadUtils.js";

// Configure multer to use memory storage (files stored as Buffer)
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  if (validateFileType(file.mimetype, "image")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
      ),
      false
    );
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  if (validateFileType(file.mimetype, "video")) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only MP4, WebM, MOV, and AVI videos are allowed."
      ),
      false
    );
  }
};

// Combined filter for images and videos
const mediaFilter = (req, file, cb) => {
  const isImage = validateFileType(file.mimetype, "image");
  const isVideo = validateFileType(file.mimetype, "video");

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only image and video files are allowed."
      ),
      false
    );
  }
};

// File size limits
const limits = {
  images: {
    fileSize: 10 * 1024 * 1024, // 10MB per image
  },
  video: {
    fileSize: 100 * 1024 * 1024, // 100MB for video
  },
};

/**
 * Upload multiple images (max 10)
 */
export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: limits.images,
}).array("images", 10); // Field name 'images', max 10 files

/**
 * Upload single video
 */
export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: limits.video,
}).single("video"); // Field name 'video'

/**
 * Upload product media (images + video + story images)
 * images: multiple files (max 10)
 * video: single file
 * storyImage_0, storyImage_1, ... storyImage_29: individual files for story blocks
 */
export const uploadProductMedia = multer({
  storage,
  fileFilter: mediaFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (for video)
  },
}).any(); // Use .any() to accept dynamic field names like storyImage_0, storyImage_1, etc.

/**
 * Upload single avatar image for user profile
 */
export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatar
  },
}).single("avatar"); // Field name 'avatar'

/**
 * Error handler middleware for multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size: 10MB for images, 100MB for videos.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 10 images allowed.",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected field name. Use 'images' for images and 'video' for video.",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  
  next();
};

