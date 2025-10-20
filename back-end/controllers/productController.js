import Product from "../models/Product.js";
import { handleError } from "../utils/errorHandler.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
  RESPONSE_MESSAGES,
} from "../utils/responseHandler.js";
import {
  uploadImage,
  uploadVideo,
  uploadMultipleImages,
  deleteMedia,
  deleteMultipleImages,
  deleteVideo,
  extractPublicId,
} from "../utils/uploadUtils.js";

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    
    return sendSuccess(
      res,
      {
        products,
        count: products.length,
      },
      RESPONSE_MESSAGES.product.listed
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching products");
    return res.status(status).json(response);
  }
};

// @desc    Lấy một sản phẩm theo ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    return sendSuccess(res, { product }, RESPONSE_MESSAGES.product.fetched);
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching product");
    return res.status(status).json(response);
  }
};

// @desc    Tạo sản phẩm mới với upload ảnh và video
// @route   POST /api/products
// @access  Public (hoặc Private nếu cần authentication)
const createProduct = async (req, res) => {
  try {
    const { name, description, story, price, category, stock } = req.body;

    // Validate required fields
    if (!name || price === undefined) {
      return sendValidationError(res, ["Name and price are required"]);
    }

    // Validate price
    if (price < 0) {
      return sendValidationError(res, ["Price cannot be negative"]);
    }

    // Validate stock
    if (stock !== undefined && stock < 0) {
      return sendValidationError(res, ["Stock cannot be negative"]);
    }

    // Prepare product data
    const productData = {
      name,
      description,
      story,
      price,
      category,
      stock,
      images: [],
      video: null,
    };

    // Upload images if provided
    if (req.files && req.files.images) {
      const imageFiles = req.files.images;
      
      try {
        const uploadedImages = await uploadMultipleImages(
          imageFiles.map(file => file.buffer),
          "products"
        );
        
        productData.images = uploadedImages.map((img, index) => ({
          url: img.url,
          publicId: img.publicId,
          alt: `${name} - Image ${index + 1}`,
          isPrimary: index === 0, // First image is primary
        }));
      } catch (uploadError) {
        return sendValidationError(res, [`Failed to upload images: ${uploadError.message}`]);
      }
    }

    // Upload video if provided
    if (req.files && req.files.video && req.files.video[0]) {
      const videoFile = req.files.video[0];
      
      try {
        const uploadedVideo = await uploadVideo(videoFile.buffer, "products");
        
        productData.video = {
          url: uploadedVideo.url,
          publicId: uploadedVideo.publicId,
          thumbnail: uploadedVideo.thumbnail,
          duration: uploadedVideo.duration,
        };
      } catch (uploadError) {
        // Clean up uploaded images if video upload fails
        if (productData.images.length > 0) {
          await deleteMultipleImages(productData.images.map(img => img.publicId));
        }
        return sendValidationError(res, [`Failed to upload video: ${uploadError.message}`]);
      }
    }

    // Create new product
    const product = await Product.create(productData);

    return sendCreated(res, { product }, RESPONSE_MESSAGES.product.created);
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      if (req.files.images) {
        // Extract publicIds from uploaded images (if any were uploaded before error)
        const uploadedImages = req.files.images.filter(f => f.cloudinary_id);
        if (uploadedImages.length > 0) {
          await deleteMultipleImages(uploadedImages.map(f => f.cloudinary_id));
        }
      }
      if (req.files.video && req.files.video[0]?.cloudinary_id) {
        await deleteVideo(req.files.video[0].cloudinary_id);
      }
    }
    
    const { status, response } = handleError(error, "Error creating product", {
      duplicateMessage: "Product with this name already exists",
    });
    return res.status(status).json(response);
  }
};

// @desc    Cập nhật sản phẩm
// @route   PUT /api/products/:id
// @access  Public (hoặc Private nếu cần authentication)
const updateProduct = async (req, res) => {
  try {
    const { name, description, story, price, category, stock, deletedImages, deleteVideo } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return sendValidationError(res, ["Price cannot be negative"]);
    }

    // Validate stock if provided
    if (stock !== undefined && stock < 0) {
      return sendValidationError(res, ["Stock cannot be negative"]);
    }

    // Update basic fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (story !== undefined) product.story = story;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

    // Handle image deletion
    if (deletedImages) {
      const imagesToDelete = JSON.parse(deletedImages);
      
      // Delete from Cloudinary
      for (const publicId of imagesToDelete) {
        await deleteMedia(publicId, "image");
      }
      
      // Remove from product
      product.images = product.images.filter(
        img => !imagesToDelete.includes(img.publicId)
      );
    }

    // Handle new image uploads
    if (req.files && req.files.images) {
      const imageFiles = req.files.images;
      
      try {
        const uploadedImages = await uploadMultipleImages(
          imageFiles.map(file => file.buffer),
          "products"
        );
        
        const newImages = uploadedImages.map((img, index) => ({
          url: img.url,
          publicId: img.publicId,
          alt: `${product.name} - Image ${product.images.length + index + 1}`,
          isPrimary: product.images.length === 0 && index === 0,
        }));
        
        product.images.push(...newImages);
      } catch (uploadError) {
        return sendValidationError(res, [`Failed to upload images: ${uploadError.message}`]);
      }
    }

    // Handle video deletion
    if (deleteVideo === "true" && product.video) {
      await deleteVideo(product.video.publicId);
      product.video = null;
    }

    // Handle new video upload
    if (req.files && req.files.video && req.files.video[0]) {
      // Delete old video if exists
      if (product.video) {
        await deleteVideo(product.video.publicId);
      }
      
      const videoFile = req.files.video[0];
      
      try {
        const uploadedVideo = await uploadVideo(videoFile.buffer, "products");
        
        product.video = {
          url: uploadedVideo.url,
          publicId: uploadedVideo.publicId,
          thumbnail: uploadedVideo.thumbnail,
          duration: uploadedVideo.duration,
        };
      } catch (uploadError) {
        return sendValidationError(res, [`Failed to upload video: ${uploadError.message}`]);
      }
    }

    const updatedProduct = await product.save();

    return sendSuccess(res, { product: updatedProduct }, RESPONSE_MESSAGES.product.updated);
  } catch (error) {
    const { status, response } = handleError(error, "Error updating product");
    return res.status(status).json(response);
  }
};

// @desc    Xóa sản phẩm
// @route   DELETE /api/products/:id
// @access  Public (hoặc Private nếu cần authentication)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    // Delete all images from Cloudinary
    if (product.images && product.images.length > 0) {
      const publicIds = product.images.map(img => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    // Delete video from Cloudinary
    if (product.video) {
      await deleteVideo(product.video.publicId);
    }

    // Delete old single image if exists (backward compatibility)
    if (product.image) {
      const publicId = extractPublicId(product.image);
      if (publicId) {
        await deleteMedia(publicId, "image");
      }
    }

    await Product.deleteOne({ _id: req.params.id });

    return sendSuccess(res, null, RESPONSE_MESSAGES.product.deleted);
  } catch (error) {
    const { status, response } = handleError(error, "Error deleting product");
    return res.status(status).json(response);
  }
};

// @desc    Upload/Update product images only
// @route   POST /api/products/:id/images
// @access  Public (hoặc Private nếu cần authentication)
const uploadProductImages = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    if (!req.files || req.files.length === 0) {
      return sendValidationError(res, ["No images provided"]);
    }

    // Upload images
    const uploadedImages = await uploadMultipleImages(
      req.files.map(file => file.buffer),
      "products"
    );

    const newImages = uploadedImages.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      alt: `${product.name} - Image ${product.images.length + index + 1}`,
      isPrimary: product.images.length === 0 && index === 0,
    }));

    product.images.push(...newImages);
    await product.save();

    return sendSuccess(res, { product }, "Images uploaded successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error uploading images");
    return res.status(status).json(response);
  }
};

// @desc    Delete specific product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Public (hoặc Private nếu cần authentication)
const deleteProductImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    
    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    const imageIndex = product.images.findIndex(img => img.publicId === publicId);
    
    if (imageIndex === -1) {
      return sendNotFound(res, "Image not found");
    }

    // Delete from Cloudinary
    await deleteMedia(publicId, "image");

    // Remove from product
    product.images.splice(imageIndex, 1);

    // If deleted image was primary, make first image primary
    if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
      product.images[0].isPrimary = true;
    }

    await product.save();

    return sendSuccess(res, { product }, "Image deleted successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error deleting image");
    return res.status(status).json(response);
  }
};

// @desc    Set primary image
// @route   PUT /api/products/:id/images/:publicId/primary
// @access  Public (hoặc Private nếu cần authentication)
const setPrimaryImage = async (req, res) => {
  try {
    const { id, publicId } = req.params;
    
    const product = await Product.findById(id);

    if (!product) {
      return sendNotFound(res, RESPONSE_MESSAGES.product.notFound);
    }

    const image = product.images.find(img => img.publicId === publicId);
    
    if (!image) {
      return sendNotFound(res, "Image not found");
    }

    // Reset all images to non-primary
    product.images.forEach(img => img.isPrimary = false);
    
    // Set selected image as primary
    image.isPrimary = true;

    await product.save();

    return sendSuccess(res, { product }, "Primary image updated successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error setting primary image");
    return res.status(status).json(response);
  }
};

export { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
};
