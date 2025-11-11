  import express from "express";
  import http from "http";
  import https from "https";
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
      "http://103.101.162.139",
      "http://103.101.162.139:5000",
      "https://2handshop.id.vn",
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

  // Proxy for Vietnam location API (open.oapi.vn) - Must be before other /api routes
  // Use regex pattern to match all paths after /api/vngeo/
  app.get(/^\/api\/vngeo\/(.*)/, (req, res, next) => {
    try {
      console.log(`[VNGeo Proxy] Received request: ${req.method} ${req.originalUrl || req.url}`);
      console.log(`[VNGeo Proxy] req.path: ${req.path}, req.url: ${req.url}`);
      
      // Extract path after /api/vngeo/ from req.url or req.path
      const urlPath = req.url.split('?')[0]; // Remove query string
      const fullPath = urlPath.replace("/api/vngeo/", "");
      const downstreamPath = fullPath || "";
      console.log(`[VNGeo Proxy] Extracted downstreamPath: ${downstreamPath}`);
      // Build query string from req.query
      const queryParams = new URLSearchParams();
      Object.keys(req.query).forEach(key => {
        queryParams.append(key, req.query[key]);
      });
      const search = queryParams.toString() ? `?${queryParams.toString()}` : "";
      
      // open.oapi.vn API uses paths like /location/provinces, /location/districts, /location/wards
      // Remove any /api/ prefix if accidentally included
      let cleanPath = downstreamPath.replace(/^api\//, "");
      // Ensure path starts with /location/ and doesn't have double slashes
      if (!cleanPath.startsWith("location/")) {
        cleanPath = `location/${cleanPath}`;
      }
      cleanPath = cleanPath.replace(/\/+/g, "/"); // Remove double slashes
      let path = `/${cleanPath}${search}`;
      let redirectCount = 0;
      const maxRedirects = 5;

      let currentHost = "open.oapi.vn";
      const useHttps = true; // New API uses HTTPS
      
      console.log(`[VNGeo Proxy] Request: ${req.url} -> ${path}`);
      
      const makeRequest = (targetPath, useHttps = true, targetHost = currentHost) => {
      console.log(`[VNGeo Proxy] Making request to: https://${targetHost}${targetPath}`);
      const options = {
        host: targetHost,
        port: useHttps ? 443 : 80,
        path: targetPath,
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "WoodToyServer/1.0",
        },
        ...(useHttps && { rejectUnauthorized: false }), // Ignore SSL cert errors for HTTPS
      };

      const requestModule = useHttps ? https : http;
      const proxyReq = requestModule.request(options, (proxyRes) => {
        // Collect response data to validate JSON
        let responseData = "";
        
        proxyRes.on("data", (chunk) => {
          responseData += chunk;
        });

        proxyRes.on("end", () => {
          // Handle redirects (301, 302, 303, 307, 308)
          if (
            (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400) &&
            proxyRes.headers.location &&
            redirectCount < maxRedirects
          ) {
            redirectCount++;
            const location = proxyRes.headers.location;
            let newPath = targetPath;
            let newUseHttps = useHttps;
            let newHost = targetHost;
            
            console.log(`[VNGeo Proxy] Redirect ${proxyRes.statusCode} from ${targetPath} to ${location}`);
            
            // Handle relative and absolute URLs
            if (location.startsWith("http://") || location.startsWith("https://")) {
              try {
                const url = new URL(location);
                newHost = url.hostname;
                newPath = url.pathname + url.search;
                newUseHttps = url.protocol === "https:";
              } catch (urlErr) {
                console.error(`[VNGeo Proxy] Error parsing redirect URL: ${location}`, urlErr);
                if (!res.headersSent) {
                  res.status(500).json({ error: "Invalid redirect URL", message: urlErr.message });
                }
                return;
              }
            } else {
              // Relative redirect
              if (targetPath.includes("/")) {
                const basePath = targetPath.substring(0, targetPath.lastIndexOf("/"));
                newPath = location.startsWith("/") ? location : `${basePath}/${location}`;
              } else {
                newPath = location.startsWith("/") ? location : `/${location}`;
              }
            }
            makeRequest(newPath, newUseHttps, newHost);
            return;
          }

          // Validate response is JSON
          const contentType = proxyRes.headers["content-type"] || "";
          if (responseData.trim().startsWith("<!DOCTYPE") || responseData.trim().startsWith("<html")) {
            console.error(`/api/vngeo proxy: Received HTML instead of JSON for path: ${targetPath}`);
            if (!res.headersSent) {
              res.status(500).json({ 
                error: "Invalid response format", 
                message: "API returned HTML instead of JSON",
                path: targetPath
              });
            }
            return;
          }

          // Try to parse JSON to validate
          try {
            JSON.parse(responseData);
          } catch (parseErr) {
            console.error(`/api/vngeo proxy: Invalid JSON response for path: ${targetPath}`, responseData.substring(0, 200));
            if (!res.headersSent) {
              res.status(500).json({ 
                error: "Invalid JSON response", 
                message: "Response is not valid JSON",
                path: targetPath
              });
            }
            return;
          }

          // Send valid JSON response
          if (!res.headersSent) {
            res.status(proxyRes.statusCode || 200);
            res.set("content-type", "application/json");
            res.set("Access-Control-Allow-Origin", "*");
            res.send(responseData);
          }
        });
      });

      proxyReq.on("error", (err) => {
        console.error("/api/vngeo proxy error:", err?.message || err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Proxy request failed", message: err.message });
        }
      });

      proxyReq.end();
    };

    makeRequest(path, true);
    } catch (err) {
      console.error("/api/vngeo route error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Proxy route error", message: err.message });
      }
    }
  });
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
// Mount API routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/stories", storyRoutes);

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
