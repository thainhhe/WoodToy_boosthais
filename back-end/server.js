import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js"; // 1. Import hàm kết nối DB
import swaggerSpec from "./config/swagger.js"; // Import Swagger config
import { validateCloudinaryConfig } from "./config/cloudinary.js"; // Import Cloudinary validation

// Import routes
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

// 2. Gọi hàm để kết nối đến MongoDB Atlas
connectDB();

// 3. Validate Cloudinary configuration
validateCloudinaryConfig();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Loại bỏ đoạn code mongoose.connect() cũ ở đây

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Wooden Toys API Docs",
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running and connected to Atlas!" });
});

// Redirect root to API docs
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
