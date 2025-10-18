import { verifyAccessToken } from "../utils/tokenUtils.js";
import User from "../models/User.js";

// Protect routes - Check if user is authenticated
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token is required.",
      });
    }

    // Verify token
    const { valid, decoded, error } = verifyAccessToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid or expired token.",
        details: error,
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User account not found.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Your account has been deactivated.",
        details: "Please contact support for assistance.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      details: error.message,
    });
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
        details: `This action requires one of the following roles: ${roles.join(", ")}.`,
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const { valid, decoded } = verifyAccessToken(token);

      if (valid) {
        const user = await User.findById(decoded.userId).select("-password");
        if (user && user.isActive) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

