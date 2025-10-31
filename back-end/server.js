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
import blogRoutes from "./routes/blogRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";

dotenv.config();

// 2. Gọi hàm để kết nối đến MongoDB Atlas
connectDB();

// 3. Validate Cloudinary configuration
validateCloudinaryConfig();

const app = express();

// CORS Configuration - Allow all origins in development
if (process.env.NODE_ENV === 'production') {
  const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:3000",
    process.env.CORS_ORIGIN,
  ].filter(Boolean);

  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
  };
  app.use(cors(corsOptions));
} else {
  // Development - allow all origins
  app.use(cors());
}

// Middleware
// Increase payload limit for large blog content (default is 100kb)
app.use(express.json({ limit: "50mb" })); // Allow up to 50MB JSON payload
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Allow up to 50MB form data

// 3. Loại bỏ đoạn code mongoose.connect() cũ ở đây

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Wooden Toys API Docs",
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/stories", storyRoutes);

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "Backend is running and connected to Atlas!",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✅ Configured" : "❌ Missing"
  });
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
