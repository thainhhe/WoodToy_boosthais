import Product from "../models/Product.js";
import { handleError } from "../utils/errorHandler.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
  RESPONSE_MESSAGES,
} from "../utils/responseHandler.js";

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

// @desc    Tạo sản phẩm mới
// @route   POST /api/products
// @access  Public (hoặc Private nếu cần authentication)
const createProduct = async (req, res) => {
  try {
    const { name, description, story, price, image, category, stock } = req.body;

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

    // Create new product
    const product = await Product.create({
      name,
      description,
      story,
      price,
      image,
      category,
      stock,
    });

    return sendCreated(res, { product }, RESPONSE_MESSAGES.product.created);
  } catch (error) {
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
    const { name, description, story, price, image, category, stock } = req.body;

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

    // Update fields
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (story !== undefined) product.story = story;
    if (price !== undefined) product.price = price;
    if (image !== undefined) product.image = image;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = stock;

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

    await Product.deleteOne({ _id: req.params.id });

    return sendSuccess(res, null, RESPONSE_MESSAGES.product.deleted);
  } catch (error) {
    const { status, response } = handleError(error, "Error deleting product");
    return res.status(status).json(response);
  }
};

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
