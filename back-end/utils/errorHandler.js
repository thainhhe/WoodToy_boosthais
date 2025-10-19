/**
 * Centralized Error Handler Utility
 * Intelligently handles errors and returns user-friendly messages
 */

// Error message templates for better UX
const ERROR_MESSAGES = {
  validation: {
    failed: "Please check your input and try again",
    required: "Missing required fields",
    format: "Invalid data format",
  },
  database: {
    duplicate: "This record already exists",
    notFound: "The requested resource was not found",
    connection: "Unable to connect to database",
  },
  auth: {
    unauthorized: "Authentication required",
    forbidden: "You don't have permission to access this resource",
    expired: "Your session has expired. Please login again",
    invalid: "Invalid credentials",
  },
  server: {
    internal: "Something went wrong. Please try again later",
    timeout: "Request timed out. Please try again",
  },
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((err) => err.message);
  
  return {
    status: 400,
    response: {
      success: false,
      message: errors.length === 1 ? errors[0] : ERROR_MESSAGES.validation.failed,
      errors: errors.length > 1 ? errors : undefined,
    },
  };
};

/**
 * Handle MongoDB Duplicate Key Error (11000)
 */
const handleDuplicateKeyError = (error, customMessage = null) => {
  // Extract field name from error
  const field = Object.keys(error.keyPattern || {})[0] || "field";
  
  // Create user-friendly field name
  const fieldName = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
  
  const message = customMessage || `${fieldName} already exists`;

  return {
    status: 400,
    response: {
      success: false,
      message: message,
      field: field,
    },
  };
};

/**
 * Handle MongoDB CastError (Invalid ObjectId)
 */
const handleCastError = (error, customMessage = null) => {
  const field = error.path || "ID";
  const message = customMessage || `Invalid ${field} format`;

  return {
    status: 400,
    response: {
      success: false,
      message: message,
    },
  };
};

/**
 * Handle JWT Errors
 */
const handleJWTError = (error) => {
  const messages = {
    TokenExpiredError: ERROR_MESSAGES.auth.expired,
    JsonWebTokenError: ERROR_MESSAGES.auth.invalid,
  };

  return {
    status: 401,
    response: {
      success: false,
      message: messages[error.name] || ERROR_MESSAGES.auth.unauthorized,
    },
  };
};

/**
 * Smart Error Response Handler
 * Automatically determines error type and returns appropriate response
 */
export const handleError = (error, defaultMessage = null, context = {}) => {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === "development") {
    console.error(`[${error.name}]`, error.message);
    console.error(error.stack);
  } else {
    console.error(`Error: ${error.name} - ${error.message}`);
  }

  // Mongoose Validation Error
  if (error.name === "ValidationError") {
    return handleValidationError(error);
  }

  // MongoDB Duplicate Key Error
  if (error.code === 11000) {
    return handleDuplicateKeyError(error, context.duplicateMessage);
  }

  // MongoDB CastError (Invalid ObjectId)
  if (error.name === "CastError") {
    return handleCastError(error, context.castMessage);
  }

  // JWT Errors
  if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
    return handleJWTError(error);
  }

  // Default Internal Server Error
  const message = defaultMessage || ERROR_MESSAGES.server.internal;
  
  return {
    status: 500,
    response: {
      success: false,
      message: message,
      // Only include error details in development
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    },
  };
};

/**
 * Success Response Helper
 * Creates standardized success responses
 */
export const successResponse = (data, message, status = 200) => {
  return {
    status,
    response: {
      success: true,
      message: message,
      ...(data && { data }),
    },
  };
};

/**
 * Async Handler Wrapper
 * Wraps async functions to automatically catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      const { status, response } = handleError(error);
      res.status(status).json(response);
    });
  };
};

/**
 * Express Error Handler Middleware
 * Global error handler for Express
 */
export const errorMiddleware = (err, req, res, next) => {
  const { status, response } = handleError(err);
  res.status(status).json(response);
};

// Export error messages for use in controllers
export { ERROR_MESSAGES };

