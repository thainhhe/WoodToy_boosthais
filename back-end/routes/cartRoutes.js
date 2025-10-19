import express from "express";
const router = express.Router();
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *           description: Product ID
 *         quantity:
 *           type: number
 *           minimum: 1
 *         price:
 *           type: number
 *         productSnapshot:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             image:
 *               type: string
 *             category:
 *               type: string
 *     Cart:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *         totalItems:
 *           type: number
 *         totalPrice:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get user's cart
 *     description: Retrieve the authenticated user's shopping cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                     cart:
 *                       $ref: '#/components/schemas/Cart'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Clear cart
 *     description: Remove all items from cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Server error
 */
router.route("/")
  .get(protect, getCart)
  .delete(protect, clearCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart or increase quantity if already exists
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID to add
 *                 example: "507f1f77bcf86cd799439011"
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 default: 1
 *                 description: Quantity to add
 *                 example: 2
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Validation error (insufficient stock, invalid product, etc.)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.post("/items", protect, addToCart);

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   put:
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific item in the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 description: New quantity
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Remove item from cart
 *     description: Remove a specific item from the cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart or item not found
 *       500:
 *         description: Server error
 */
router.route("/items/:productId")
  .put(protect, updateCartItem)
  .delete(protect, removeFromCart);

export default router;

