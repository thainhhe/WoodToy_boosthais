import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

/**
 * EXAMPLE: Protected Product Routes
 * 
 * This file shows how to protect your product routes with authentication and authorization.
 * To use this configuration, replace the content of productRoutes.js with this file.
 * 
 * Routes configuration:
 * - GET /api/products - Public (anyone can view products)
 * - GET /api/products/:id - Public (anyone can view a single product)
 * - POST /api/products - Protected (only admins can create products)
 * - PUT /api/products/:id - Protected (only admins can update products)
 * - DELETE /api/products/:id - Protected (only admins can delete products)
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products from the database (Public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new product (Admin only)
 *     description: Add a new product to the database (Requires admin role)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 example: "A fun wooden car puzzle for kids"
 *               price:
 *                 type: number
 *                 example: 24.99
 *               image:
 *                 type: string
 *                 example: "wooden-car-puzzle.jpg"
 *               category:
 *                 type: string
 *                 example: "Vehicles"
 *               stock:
 *                 type: number
 *                 example: 30
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server Error
 */
// Public: Get all products
router.get("/", getProducts);

// Protected: Create product (admin only)
router.post("/", protect, authorize("admin"), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a single product by its MongoDB ID (Public)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 *   put:
 *     summary: Update a product (Admin only)
 *     description: Update an existing product by its MongoDB ID (Requires admin role)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ID of the product
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Wooden Puzzle"
 *               description:
 *                 type: string
 *                 example: "An updated description"
 *               price:
 *                 type: number
 *                 example: 34.99
 *               image:
 *                 type: string
 *                 example: "updated-image.jpg"
 *               category:
 *                 type: string
 *                 example: "Educational"
 *               stock:
 *                 type: number
 *                 example: 45
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 *   delete:
 *     summary: Delete a product (Admin only)
 *     description: Remove a product from the database by its MongoDB ID (Requires admin role)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
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
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server Error
 */
// Public: Get product by ID
router.get("/:id", getProductById);

// Protected: Update product (admin only)
router.put("/:id", protect, authorize("admin"), updateProduct);

// Protected: Delete product (admin only)
router.delete("/:id", protect, authorize("admin"), deleteProduct);

export default router;

