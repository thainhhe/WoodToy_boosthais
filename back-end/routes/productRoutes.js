import express from "express";
const router = express.Router();
import {
  getProducts,
  getProductById,
} from "../controllers/productController.js";

// Gắn các hàm controller vào các route tương ứng
// Khi có yêu cầu GET đến '/api/products', hàm getProducts sẽ được gọi
router.route("/").get(getProducts);

// Khi có yêu cầu GET đến '/api/products/:id', hàm getProductById sẽ được gọi
router.route("/:id").get(getProductById);

export default router;
