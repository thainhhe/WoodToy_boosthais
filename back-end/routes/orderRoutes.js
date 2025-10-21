import express from "express";
const router = express.Router();
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and checkout
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShippingAddress:
 *       type: object
 *       required:
 *         - fullName
 *         - phone
 *         - street
 *         - city
 *       properties:
 *         fullName:
 *           type: string
 *           example: "Nguyen Van A"
 *         phone:
 *           type: string
 *           pattern: "^(\\+84|0)[3|5|7|8|9][0-9]{8}$"
 *           example: "0912345678"
 *         street:
 *           type: string
 *           example: "123 Nguyen Hue"
 *         ward:
 *           type: string
 *           example: "Ben Nghe"
 *         district:
 *           type: string
 *           example: "District 1"
 *         city:
 *           type: string
 *           example: "Ho Chi Minh City"
 *         country:
 *           type: string
 *           default: "Vietnam"
 *     OrderItem:
 *       type: object
 *       properties:
 *         product:
 *           type: string
 *         name:
 *           type: string
 *         image:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         quantity:
 *           type: number
 *         subtotal:
 *           type: number
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         orderNumber:
 *           type: string
 *           example: "ORD202410190001"
 *         user:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         subtotal:
 *           type: number
 *         tax:
 *           type: number
 *         discount:
 *           type: number
 *         total:
 *           type: number
 *         shippingAddress:
 *           $ref: '#/components/schemas/ShippingAddress'
 *         paymentMethod:
 *           type: string
 *           enum: [COD, Bank Transfer, Credit Card, E-Wallet]
 *         paymentStatus:
 *           type: string
 *           enum: [Pending, Paid, Failed, Refunded]
 *         status:
 *           type: string
 *           enum: [Pending, Confirmed, Processing, Shipping, Delivered, Cancelled, Refunded]
 *         notes:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order (Checkout)
 *     description: Create a new order from cart items
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 $ref: '#/components/schemas/ShippingAddress'
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, Bank Transfer, Credit Card, E-Wallet]
 *                 default: COD
 *                 example: "COD"
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Please call before delivery"
 *               discount:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 example: 50000
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error (empty cart, insufficient stock, etc.)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get user's orders
 *     description: Retrieve order history for authenticated user
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Confirmed, Processing, Shipping, Delivered, Cancelled, Refunded]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     totalPages:
 *                       type: number
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.route("/")
  .post(protect, createOrder)
  .get(protect, getUserOrders);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (Admin only)
 *     description: Retrieve all orders with filters (admin access required)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All orders retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.get("/admin/all", protect, authorize("admin"), getAllOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Retrieve a specific order by its ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not order owner
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     description: Update the status of an order (admin access required)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Confirmed, Processing, Shipping, Delivered, Cancelled, Refunded]
 *                 example: "Shipping"
 *               note:
 *                 type: string
 *                 example: "Order has been shipped via Express Delivery"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}/payment:
 *   put:
 *     summary: Update payment status (Admin only)
 *     description: Update the payment status of an order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentStatus
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [Pending, Paid, Failed, Refunded]
 *                 example: "Paid"
 *               transactionId:
 *                 type: string
 *                 example: "TXN123456789"
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put("/:id/payment", protect, authorize("admin"), updatePaymentStatus);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel order
 *     description: Cancel an order (only if status is Pending or Confirmed)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Changed my mind"
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled at this stage
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not order owner
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put("/:id/cancel", protect, cancelOrder);

export default router;

