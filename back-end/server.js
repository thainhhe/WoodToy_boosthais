import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js"; // 1. Import hàm kết nối DB
import swaggerSpec from "./config/swagger.js"; // Import Swagger config

// Import routes
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

// 2. Gọi hàm để kết nối đến MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Loại bỏ đoạn code mongoose.connect() cũ ở đây

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Wooden Toys API Docs"
}));

// API Routes
app.use("/api/products", productRoutes);

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
