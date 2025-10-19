/**
 * Standardized Response Handler
 * Provides consistent response format across all endpoints
 */

/**
 * Send Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  const response = {
    success: true,
    message: message,
  };

  // Only add data if it exists
  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 400)
 * @param {Array|String} errors - Detailed errors (optional)
 */
export const sendError = (res, message = "An error occurred", statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message: message,
  };

  // Add errors if provided
  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  // Include error details only in development
  if (process.env.NODE_ENV === "development" && errors) {
    response.debug = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send Created Response (201)
 */
export const sendCreated = (res, data, message = "Resource created successfully") => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send No Content Response (204)
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Send Not Found Response (404)
 */
export const sendNotFound = (res, message = "Resource not found") => {
  return sendError(res, message, 404);
};

/**
 * Send Unauthorized Response (401)
 */
export const sendUnauthorized = (res, message = "Authentication required") => {
  return sendError(res, message, 401);
};

/**
 * Send Forbidden Response (403)
 */
export const sendForbidden = (res, message = "You don't have permission to access this resource") => {
  return sendError(res, message, 403);
};

/**
 * Send Validation Error Response (400)
 */
export const sendValidationError = (res, errors, message = "Validation failed") => {
  return sendError(res, message, 400, errors);
};

/**
 * Send Server Error Response (500)
 */
export const sendServerError = (res, message = "Internal server error", error = null) => {
  const response = {
    success: false,
    message: message,
  };

  // Include error details only in development
  if (process.env.NODE_ENV === "development" && error) {
    response.error = error.message || error;
    response.stack = error.stack;
  }

  return res.status(500).json(response);
};

/**
 * Paginated Response Helper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items count
 * @param {String} message - Success message
 */
export const sendPaginated = (
  res,
  data,
  page = 1,
  limit = 10,
  total = 0,
  message = "Success"
) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message: message,
    data: data,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Response Status Messages
 * Pre-defined messages for common operations
 */
export const RESPONSE_MESSAGES = {
  // Product messages
  product: {
    created: "Product created successfully",
    updated: "Product updated successfully",
    deleted: "Product deleted successfully",
    fetched: "Product retrieved successfully",
    listed: "Products retrieved successfully",
    notFound: "Product not found",
  },
  // User/Auth messages
  user: {
    registered: "User registered successfully",
    loginSuccess: "Login successful",
    logoutSuccess: "Logout successful",
    profileUpdated: "Profile updated successfully",
    passwordChanged: "Password changed successfully",
    notFound: "User not found",
    deactivated: "User account has been deactivated successfully",
    activated: "User account has been activated successfully",
  },
  // Auth messages
  auth: {
    tokenRefreshed: "Token refreshed successfully",
    invalidCredentials: "Invalid credentials",
    unauthorized: "Authentication required",
    forbidden: "Access denied",
    sessionExpired: "Your session has expired. Please login again",
  },
  // Validation messages
  validation: {
    required: "Missing required fields",
    invalid: "Invalid data provided",
    failed: "Validation failed. Please check your input",
  },
  // General messages
  general: {
    success: "Operation completed successfully",
    error: "An error occurred",
    notFound: "Resource not found",
    serverError: "Something went wrong. Please try again later",
  },
};

