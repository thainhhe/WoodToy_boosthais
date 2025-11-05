import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  setPrimaryImage,
} from "../controllers/productController.js";
import { uploadProductMedia, uploadImages, handleMulterError } from "../middleware/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints with image and video upload
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products from the database
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     count:
 *                       type: number
 *       500:
 *         description: Server Error
 *   post:
 *     summary: Create a new product with images, videos, and story blocks
 *     description: Add a new product with multiple images (max 10), multiple videos (max 10), and rich story content (text + images interleaved)
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wooden Car Puzzle"
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *                 example: "A fun wooden car puzzle for kids"
 *               story:
 *                 type: string
 *                 maxLength: 5000
 *                 example: "Each piece is handcrafted with love"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 24.99
 *               category:
 *                 type: string
 *                 example: "Vehicles"
 *               stock:
 *                 type: number
 *                 example: 30
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Product images (max 10, each max 10MB)"
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Product videos (max 10, each max 100MB)"
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: "Legacy: Single product video (max 100MB) - use 'videos' array instead"
 *               storyBlocks:
 *                 type: string
 *                 description: "JSON array of story blocks (max 50 blocks). Example: [{type:'text',order:0,content:'...'},{type:'image',order:1,caption:'...',alt:'...'}]"
 *                 example: '[{"type":"text","order":0,"content":"This toy is handcrafted..."},{"type":"image","order":1,"caption":"Artisan at work","alt":"wooden-toy-making"}]'
 *               storyImage_0:
 *                 type: string
 *                 format: binary
 *                 description: "Story image for block index 0 (if block type is 'image')"
 *               storyImage_1:
 *                 type: string
 *                 format: binary
 *                 description: "Story image for block index 1 (max 30 story images total)"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request - Missing required fields or invalid files
 *       500:
 *         description: Server Error
 */
router.route("/")
  .get(getProducts)
  .post(uploadProductMedia, handleMulterError, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a single product by its MongoDB ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the product
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 *   put:
 *     summary: Update a product
 *     description: Update an existing product with optional new images/video/story blocks
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               story:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "New images to add"
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "New videos to add (max 10)"
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: "Legacy: Single video (adds to videos array) - use 'videos' array instead"
 *               deletedImages:
 *                 type: string
 *                 description: "JSON array of image publicIds to delete"
 *                 example: '["woodtoy/products/abc123"]'
 *               deletedVideos:
 *                 type: string
 *                 description: "JSON array of video publicIds to delete"
 *                 example: '["woodtoy/products/video123"]'
 *               deleteVideo:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: "Legacy: Set to 'true' to delete legacy single video field"
 *               storyBlocks:
 *                 type: string
 *                 description: "Updated JSON array of story blocks (replaces existing). Example: [{type:'text',order:0,content:'...'},{type:'image',order:1,image:{...},caption:'...',alt:'...'}]"
 *                 example: '[{"type":"text","order":0,"content":"Updated content..."},{"type":"image","order":1,"caption":"New caption","alt":"new-alt"}]'
 *               deletedStoryImages:
 *                 type: string
 *                 description: "JSON array of story image publicIds to delete"
 *                 example: '["products/stories/story_abc123"]'
 *               storyImage_0:
 *                 type: string
 *                 format: binary
 *                 description: "New story image for block 0 (replaces existing if any)"
 *               storyImage_1:
 *                 type: string
 *                 format: binary
 *                 description: "New story image for block 1"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 *   delete:
 *     summary: Delete a product
 *     description: Remove a product and all its media from database and Cloudinary
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the product
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 */
router.route("/:id")
  .get(getProductById)
  .put(uploadProductMedia, handleMulterError, updateProduct)
  .delete(deleteProduct);

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     summary: Add images to existing product
 *     description: Upload additional images to a product (max 10 total)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - images
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: No images provided or limit exceeded
 *       404:
 *         description: Product not found
 */
router.post("/:id/images", uploadImages, handleMulterError, uploadProductImages);

/**
 * @swagger
 * /api/products/{id}/images/{publicId}:
 *   delete:
 *     summary: Delete a specific image
 *     description: Remove a specific image from product and Cloudinary
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary public ID (URL encode if contains slashes)
 *         example: "woodtoy/products/abc123"
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       404:
 *         description: Product or image not found
 */
router.delete("/:id/images/:publicId(*)", deleteProductImage);

/**
 * @swagger
 * /api/products/{id}/images/{publicId}/primary:
 *   put:
 *     summary: Set primary image
 *     description: Set a specific image as the primary/featured image
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: publicId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Primary image updated successfully
 *       404:
 *         description: Product or image not found
 */
router.put("/:id/images/:publicId(*)/primary", setPrimaryImage);

export default router;
