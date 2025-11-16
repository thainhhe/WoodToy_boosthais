import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { handleError } from "../utils/errorHandler.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
  RESPONSE_MESSAGES,
} from "../utils/responseHandler.js";

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name description price pricegiamgia image images video category stock"
    );

    // Create empty cart if not exists
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    return sendSuccess(
      res,
      { cart },
      "Cart retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching cart");
    return res.status(status).json(response);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return sendValidationError(res, ["Product ID is required"]);
    }

    if (quantity < 1) {
      return sendValidationError(res, ["Quantity must be at least 1"]);
    }

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return sendNotFound(res, "Product not found");
    }

    if (product.stock < quantity) {
      return sendValidationError(res, [
        `Insufficient stock. Only ${product.stock} items available`,
      ]);
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      
      if (product.stock < newQuantity) {
        return sendValidationError(res, [
          `Cannot add more. Only ${product.stock} items available`,
        ]);
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      // Update price to use discounted price if available
      cart.items[existingItemIndex].price = product.pricegiamgia || product.price;
    } else {
      // Add new item - use discounted price if available
      const finalPrice = product.pricegiamgia || product.price;
      cart.items.push({
        product: productId,
        quantity,
        price: finalPrice,
        productSnapshot: {
          name: product.name,
          image: product.primaryImage || product.image || (product.images && product.images[0]?.url),
          category: product.category,
        },
      });
    }

    await cart.save();
    
    // Populate before sending response
    await cart.populate("items.product", "name description price pricegiamgia image images video category stock");

    return sendSuccess(
      res,
      { cart },
      "Item added to cart successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error adding item to cart");
    return res.status(status).json(response);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendValidationError(res, ["Quantity must be at least 1"]);
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return sendNotFound(res, "Product not found");
    }

    if (product.stock < quantity) {
      return sendValidationError(res, [
        `Insufficient stock. Only ${product.stock} items available`,
      ]);
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return sendNotFound(res, "Item not found in cart");
    }

    cart.items[itemIndex].quantity = quantity;
    // Update price - use discounted price if available
    cart.items[itemIndex].price = product.pricegiamgia || product.price;

    await cart.save();
    await cart.populate("items.product", "name description price pricegiamgia image images video category stock");

    return sendSuccess(
      res,
      { cart },
      "Cart item updated successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error updating cart item");
    return res.status(status).json(response);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return sendNotFound(res, "Item not found in cart");
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate("items.product", "name description price pricegiamgia image images video category stock");

    return sendSuccess(
      res,
      { cart },
      "Item removed from cart successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error removing item from cart");
    return res.status(status).json(response);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return sendSuccess(
      res,
      { cart },
      "Cart cleared successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error clearing cart");
    return res.status(status).json(response);
  }
};

