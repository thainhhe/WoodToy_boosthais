import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result with url and public_id
 */
export const uploadImage = async (fileBuffer, folder = "products", options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `woodtoy/${folder}`,
        resource_type: "image",
        format: "jpg", // Convert to JPG for consistency
        transformation: [
          { width: 1200, height: 1200, crop: "limit" }, // Max dimensions
          { quality: "auto:good" }, // Auto quality optimization
          { fetch_format: "auto" }, // Auto format (WebP for supported browsers)
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload video to Cloudinary
 * @param {Buffer} fileBuffer - Video file buffer from multer
 * @param {String} folder - Cloudinary folder name
 * @param {Object} options - Additional upload options
 * @returns {Promise<Object>} - Upload result with url and public_id
 */
export const uploadVideo = async (fileBuffer, folder = "products", options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `woodtoy/${folder}`,
        resource_type: "video",
        transformation: [
          { width: 1920, height: 1080, crop: "limit" }, // Max HD resolution
          { quality: "auto:good" },
        ],
        eager: [
          // Generate thumbnail
          { 
            width: 400, 
            height: 300, 
            crop: "fill", 
            format: "jpg",
            start_offset: "1" // Thumbnail from 1 second
          }
        ],
        eager_async: true,
        ...options,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            duration: result.duration,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            thumbnail: result.eager && result.eager[0] ? result.eager[0].secure_url : null,
          });
        }
      }
    );

    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Upload multiple images
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleImages = async (fileBuffers, folder = "products") => {
  const uploadPromises = fileBuffers.map((buffer) => 
    uploadImage(buffer, folder)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Upload multiple videos
 * @param {Array<Buffer>} fileBuffers - Array of video file buffers
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleVideos = async (fileBuffers, folder = "products") => {
  const uploadPromises = fileBuffers.map((buffer) => 
    uploadVideo(buffer, folder)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Delete image/video from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteMedia = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete multiple images
 * @param {Array<String>} publicIds - Array of public_ids
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  const deletePromises = publicIds.map((publicId) => 
    deleteMedia(publicId, "image")
  );
  
  return Promise.all(deletePromises);
};

/**
 * Delete video and its thumbnail
 * @param {String} publicId - Video public_id
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteVideo = async (publicId) => {
  return deleteMedia(publicId, "video");
};

/**
 * Delete multiple videos
 * @param {Array<String>} publicIds - Array of video public_ids
 * @returns {Promise<Array>} - Array of deletion results
 */
export const deleteMultipleVideos = async (publicIds) => {
  const deletePromises = publicIds.map((publicId) => 
    deleteMedia(publicId, "video")
  );
  
  return Promise.all(deletePromises);
};

/**
 * Extract public_id from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  
  try {
    // Extract public_id from URL
    // Example: https://res.cloudinary.com/xxx/image/upload/v123/woodtoy/products/abc.jpg
    // Returns: woodtoy/products/abc
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    const pathParts = parts[1].split("/");
    // Remove version (v123) and extension
    const publicIdParts = pathParts.slice(1);
    const publicId = publicIdParts.join("/").split(".")[0];
    
    return publicId;
  } catch (error) {
    console.error("Error extracting public_id:", error);
    return null;
  }
};

/**
 * Get optimized image URL with transformations
 * @param {String} publicId - Cloudinary public_id
 * @param {Object} options - Transformation options
 * @returns {String} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 800,
    crop = "limit",
    quality = "auto:good",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: format },
    ],
    secure: true,
  });
};

/**
 * Validate file type
 * @param {String} mimetype - File mimetype
 * @param {String} type - 'image' or 'video'
 * @returns {Boolean}
 */
export const validateFileType = (mimetype, type = "image") => {
  const validTypes = {
    image: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
  };

  return validTypes[type]?.includes(mimetype) || false;
};

/**
 * Validate file size
 * @param {Number} size - File size in bytes
 * @param {Number} maxSizeMB - Maximum size in MB
 * @returns {Boolean}
 */
export const validateFileSize = (size, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
};

