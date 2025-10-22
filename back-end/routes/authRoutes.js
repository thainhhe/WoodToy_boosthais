import express from "express";
const router = express.Router();
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getMe,
  updateProfile,
  changePassword,
  googleAuth,
  getAllUsers,
  updateUserStatus,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadAvatar, handleMulterError } from "../middleware/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and authorization endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: 507f1f77bcf86cd799439011
 *         name:
 *           type: string
 *           example: John Doe
 *         email:
 *           type: string
 *           example: john@example.com
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           example: user
 *         isActive:
 *           type: boolean
 *           example: true
 *         lastLogin:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Login successful
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             accessToken:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             refreshToken:
 *               type: string
 *               example: 1a2b3c4d5e6f7g8h9i0j...
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: "^[a-zA-ZÀ-ỹ\\s]+$"
 *                 description: "Name can only contain letters and spaces"
 *                 example: "John Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *                 description: "Password must contain at least 8 characters with 1 letter, 1 number, and 1 special character"
 *                 example: "Password123!"
 *               phoneNumber:
 *                 type: string
 *                 pattern: "^(\\+84|0)[3|5|7|8|9][0-9]{8}$"
 *                 description: "Vietnamese phone number (optional)"
 *                 example: "0912345678"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: "User gender (optional)"
 *                 example: "male"
 *               address:
 *                 type: object
 *                 description: "User address (optional)"
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Nguyen Hue"
 *                   ward:
 *                     type: string
 *                     example: "Ben Nghe"
 *                   district:
 *                     type: string
 *                     example: "District 1"
 *                   city:
 *                     type: string
 *                     example: "Ho Chi Minh City"
 *                   country:
 *                     type: string
 *                     example: "Vietnam"
 *                   postalCode:
 *                     type: string
 *                     example: "700000"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Invalid input or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return access token and refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Missing credentials
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Google OAuth Login
 *     description: Authenticate user with Google ID token and return JWT tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google ID token from frontend
 *                 example: eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU...
 *     responses:
 *       200:
 *         description: Login successful or account created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Token missing or email not verified
 *       401:
 *         description: Unauthorized - Invalid Google token
 *       500:
 *         description: Server error
 */
router.post("/google", googleAuth);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: 1a2b3c4d5e6f7g8h9i0j...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Refresh token required
 *       401:
 *         description: Unauthorized - Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Revoke the refresh token to logout user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: 1a2b3c4d5e6f7g8h9i0j...
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Bad request - Refresh token required
 *       500:
 *         description: Server error
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Revoke all refresh tokens for the user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.post("/logout-all", protect, logoutAll);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile information
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update user profile with avatar upload
 *     description: Update the authenticated user's profile including avatar image
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 pattern: "^[a-zA-ZÀ-ỹ\\s]+$"
 *                 description: "Name can only contain letters and spaces"
 *                 example: "John Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johnsmith@example.com
 *               phoneNumber:
 *                 type: string
 *                 pattern: "^(\\+84|0)[3|5|7|8|9][0-9]{8}$"
 *                 description: "Vietnamese phone number"
 *                 example: "0912345678"
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 description: "User gender"
 *                 example: "male"
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: "Profile picture (max 5MB, JPEG/PNG/WebP)"
 *               removeAvatar:
 *                 type: string
 *                 enum: ["true", "false"]
 *                 description: "Set to 'true' to remove current avatar"
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: "123 Nguyen Hue"
 *                   ward:
 *                     type: string
 *                     example: "Ben Nghe"
 *                   district:
 *                     type: string
 *                     example: "District 1"
 *                   city:
 *                     type: string
 *                     example: "Ho Chi Minh City"
 *                   country:
 *                     type: string
 *                     example: "Vietnam"
 *                   postalCode:
 *                     type: string
 *                     example: "700000"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Bad request - Email already in use or invalid avatar
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.route("/me")
  .get(protect, getMe)
  .put(protect, uploadAvatar, handleMulterError, updateProfile);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: oldpassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *                 description: "Password must contain at least 8 characters with 1 letter, 1 number, and 1 special character"
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request - Invalid input
 *       401:
 *         description: Unauthorized - Current password is incorrect
 *       500:
 *         description: Server error
 */
router.put("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/auth/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a paginated list of all users with optional filtering
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *         example: user
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by active status
 *         example: "true"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Users retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 5
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         hasNextPage:
 *                           type: boolean
 *                           example: true
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       500:
 *         description: Server error
 */
router.get("/users", protect, authorize("admin"), getAllUsers);

/**
 * @swagger
 * /api/auth/users/{userId}/status:
 *   put:
 *     summary: Update user account status (Admin only)
 *     description: Activate or deactivate a user account. Only admins can perform this action.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 description: "Set to true to activate, false to deactivate"
 *                 example: false
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User account has been deactivated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                         role:
 *                           type: string
 *       400:
 *         description: Bad request - Missing or invalid input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/users/:userId/status", protect, authorize("admin"), updateUserStatus);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset token
 *     description: Request a password reset token by providing your email address
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Reset token generated (or message sent if user exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset token generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     resetToken:
 *                       type: string
 *                       description: "Reset token (in production, this would be sent via email)"
 *                       example: "a1b2c3d4e5f6..."
 *                     expiresIn:
 *                       type: string
 *                       example: "10 minutes"
 *       400:
 *         description: Bad request - Invalid email or OAuth account
 *       401:
 *         description: Account deactivated
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password/{resetToken}:
 *   post:
 *     summary: Reset password using token
 *     description: Reset your password using the token received from forgot-password endpoint
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *         description: The reset token from forgot-password
 *         example: "a1b2c3d4e5f6..."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 pattern: "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
 *                 description: "New password (8+ chars, 1 letter, 1 number, 1 special char)"
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully. Please login with your new password."
 *       400:
 *         description: Bad request - Invalid/expired token or weak password
 *       500:
 *         description: Server error
 */
router.post("/reset-password/:resetToken", resetPassword);

export default router;

