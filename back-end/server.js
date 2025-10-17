import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js"; // 1. Import hàm kết nối DB

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

// API Routes
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running and connected to Atlas!" });
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
