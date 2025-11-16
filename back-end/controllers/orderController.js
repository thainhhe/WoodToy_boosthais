import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { handleError } from "../utils/errorHandler.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
  sendPaginated,
  RESPONSE_MESSAGES,
} from "../utils/responseHandler.js";

// @desc    Create order from cart (Checkout)
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = "COD",
      notes,
      discount = 0,
    } = req.body;

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.street || !shippingAddress.city) {
      return sendValidationError(res, [
        "Complete shipping address is required (fullName, phone, street, city)",
      ]);
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    
    if (!cart || cart.items.length === 0) {
      return sendValidationError(res, ["Cart is empty"]);
    }

    // Verify stock availability and prepare order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return sendValidationError(res, [`Product ${item.productSnapshot.name} no longer exists`]);
      }

      if (product.stock < item.quantity) {
        return sendValidationError(res, [
          `Insufficient stock for ${product.name}. Only ${product.stock} available`,
        ]);
      }

      // Use discounted price if available
      const finalPrice = product.pricegiamgia || product.price;
      const itemSubtotal = finalPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.primaryImage || product.image || (product.images && product.images[0]?.url),
        category: product.category,
        price: finalPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // Calculate tax (10%)
    const tax = subtotal * 0.1;
    
    // Calculate total
    const total = subtotal + tax - discount;

    // Generate order number
    const count = await Order.countDocuments();
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = `ORD${dateStr}${String(count + 1).padStart(5, "0")}`;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderNumber,
      items: orderItems,
      subtotal,
      tax,
      discount,
      total,
      shippingAddress,
      paymentMethod,
      notes,
      statusHistory: [{
        status: "Pending",
        note: "Order created",
        updatedBy: req.user._id,
      }],
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    // Populate order details
    await order.populate("user", "name email phoneNumber");

    return sendCreated(
      res,
      { order },
      "Order created successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error creating order");
    return res.status(status).json(response);
  }
};

// @desc    Get user's orders (Order history)
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const query = { user: req.user._id };
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("items.product", "name price pricegiamgia image images video");

    return sendPaginated(
      res,
      orders,
      page,
      limit,
      total,
      "Orders retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching orders");
    return res.status(status).json(response);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phoneNumber")
      .populate("items.product", "name description price pricegiamgia image images video category");

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    // Check if user owns this order (or is admin)
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this order",
      });
    }

    return sendSuccess(
      res,
      { order },
      "Order retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching order");
    return res.status(status).json(response);
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipping",
      "Delivered",
      "Cancelled",
      "Refunded",
    ];

    if (!status || !validStatuses.includes(status)) {
      return sendValidationError(res, [`Status must be one of: ${validStatuses.join(", ")}`]);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    // Update status
    order.status = status;

    // Add to status history
    order.statusHistory.push({
      status,
      note: note || `Status changed to ${status}`,
      updatedBy: req.user._id,
    });

    // Update specific timestamps
    if (status === "Delivered") {
      order.deliveredAt = Date.now();
      order.paymentStatus = "Paid";
      order.paymentDate = Date.now();
    } else if (status === "Cancelled") {
      order.cancelledAt = Date.now();
      order.cancelReason = note || "Cancelled by admin";
      
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();
    await order.populate("user", "name email phoneNumber");

    return sendSuccess(
      res,
      { order },
      `Order status updated to ${status}`
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error updating order status");
    return res.status(status).json(response);
  }
};

// @desc    Update payment status (Admin only)
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    const validPaymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];

    if (!paymentStatus || !validPaymentStatuses.includes(paymentStatus)) {
      return sendValidationError(res, [
        `Payment status must be one of: ${validPaymentStatuses.join(", ")}`,
      ]);
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === "Paid") {
      order.paymentDate = Date.now();
    }
    if (transactionId) {
      order.transactionId = transactionId;
    }

    await order.save();

    return sendSuccess(
      res,
      { order },
      `Payment status updated to ${paymentStatus}`
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error updating payment status");
    return res.status(status).json(response);
  }
};

// @desc    Cancel order (User can cancel if status is Pending/Confirmed)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (!["Pending", "Confirmed"].includes(order.status)) {
      return sendValidationError(res, [
        "Order cannot be cancelled at this stage",
      ]);
    }

    order.status = "Cancelled";
    order.cancelledAt = Date.now();
    order.cancelReason = reason || "Cancelled by user";

    order.statusHistory.push({
      status: "Cancelled",
      note: order.cancelReason,
      updatedBy: req.user._id,
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();

    return sendSuccess(
      res,
      { order },
      "Order cancelled successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error cancelling order");
    return res.status(status).json(response);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;

    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("user", "name email phoneNumber")
      .populate("items.product", "name price pricegiamgia image images video");

    return sendPaginated(
      res,
      orders,
      page,
      limit,
      total,
      "All orders retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching all orders");
    return res.status(status).json(response);
  }
};

