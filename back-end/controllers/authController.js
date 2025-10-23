import User from "../models/User.js";
import {
  generateTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
} from "../utils/tokenUtils.js";
import { verifyGoogleToken } from "../utils/googleAuth.js";
import {
  uploadImage,
  deleteMedia,
  extractPublicId,
} from "../utils/uploadUtils.js";

// Get client IP address
const getIpAddress = (req) => {
  return req.ip || req.connection.remoteAddress || "unknown";
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, gender, address } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Additional validation
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 50 characters",
      });
    }

    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "Name can only contain letters and spaces",
      });
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 1 letter, 1 number, and 1 special character (@$!%*?&)",
      });
    }

    // Validate phone number if provided
    if (phoneNumber && !/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid Vietnamese phone number (e.g., 0912345678 or +84912345678)",
      });
    }

    // Validate gender if provided
    if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Gender must be either 'male', 'female', or 'other'",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Prepare user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "user", // Always default to 'user' role for security
      lastLogin: Date.now(), // Set on creation
    };

    // Add phone number if provided
    if (phoneNumber) {
      userData.phoneNumber = phoneNumber.trim();
    }

    // Add gender if provided
    if (gender) {
      userData.gender = gender.toLowerCase();
    }

    // Add address if provided
    if (address) {
      userData.address = {
        street: address.street?.trim(),
        ward: address.ward?.trim(),
        district: address.district?.trim(),
        city: address.city?.trim(),
        country: address.country?.trim() || "Vietnam",
        postalCode: address.postalCode?.trim(),
      };
    }

    // Create user (password will be hashed by pre-save hook)
    // All validations will run during create - this is correct behavior
    const user = await User.create(userData);

    // Generate tokens
    const ipAddress = getIpAddress(req);
    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      user.role,
      ipAddress
    );


    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          provider: user.provider,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }
    
    // Handle duplicate key error (MongoDB) - email already exists
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Validate email format (basic check)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate password is not empty or too short
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const ipAddress = getIpAddress(req);
    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      user.role,
      ipAddress
    );

    // Update last login (use findByIdAndUpdate to avoid validation)
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const { valid, refreshToken: tokenDoc, error } = await verifyRefreshToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        error,
      });
    }

    const user = tokenDoc.user;

    // Generate new tokens
    const ipAddress = getIpAddress(req);
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user._id,
      user.role,
      ipAddress
    );

    // Revoke old refresh token and replace with new one
    await revokeRefreshToken(token, ipAddress, newRefreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
        },
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: error.message,
    });
  }
};

// @desc    Logout user (revoke refresh token)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Revoke refresh token
    const ipAddress = getIpAddress(req);
    const result = await revokeRefreshToken(token, ipAddress);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Error revoking token",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

// @desc    Logout from all devices (revoke all refresh tokens)
// @route   POST /api/auth/logout-all
// @access  Private
export const logoutAll = async (req, res) => {
  try {
    const userId = req.user._id;
    const ipAddress = getIpAddress(req);

    // Revoke all user's refresh tokens
    const result = await revokeAllUserTokens(userId, ipAddress);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Error revoking tokens",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out from all devices",
      error: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    
    // Handle invalid ObjectId (CastError)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    let { name, email, phoneNumber, gender, address, removeAvatar } = req.body;

    // Parse address if it's a JSON string (from FormData)
    if (typeof address === 'string') {
      try {
        address = JSON.parse(address);
      } catch (e) {
        console.error('Failed to parse address:', e);
      }
    }

    const user = await User.findById(req.user._id);

    // Update name
    if (name) {
      if (name.length < 2 || name.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Name must be between 2 and 50 characters",
        });
      }
      if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name)) {
        return res.status(400).json({
          success: false,
          message: "Name can only contain letters and spaces",
        });
      }
      user.name = name;
    }

    // Update email
    if (email) {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }

    // Update phone number
    if (phoneNumber !== undefined) {
      if (phoneNumber && !/^(\+84|0)[3|5|7|8|9][0-9]{8}$/.test(phoneNumber)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid Vietnamese phone number (e.g., 0912345678 or +84912345678)",
        });
      }
      user.phoneNumber = phoneNumber || undefined;
    }

    // Update gender
    if (gender !== undefined) {
      if (gender && !["male", "female", "other"].includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: "Gender must be either 'male', 'female', or 'other'",
        });
      }
      user.gender = gender ? gender.toLowerCase() : undefined;
    }

    // Update address
    if (address) {
      if (!user.address) {
        user.address = {};
      }
      if (address.fullName !== undefined) user.address.fullName = address.fullName;
      if (address.phone !== undefined) user.address.phone = address.phone;
      if (address.street !== undefined) user.address.street = address.street;
      if (address.ward !== undefined) user.address.ward = address.ward;
      if (address.district !== undefined) user.address.district = address.district;
      if (address.city !== undefined) user.address.city = address.city;
      if (address.country !== undefined) user.address.country = address.country;
      if (address.postalCode !== undefined) user.address.postalCode = address.postalCode;
    }

    // Handle avatar removal
    if (removeAvatar === "true" && user.avatar) {
      // Delete old avatar from Cloudinary (if not Google avatar)
      if (!user.avatar.includes("googleusercontent.com")) {
        const publicId = extractPublicId(user.avatar);
        if (publicId) {
          await deleteMedia(publicId, "image");
        }
      }
      user.avatar = undefined;
    }

    // Handle avatar upload
    if (req.file) {
      try {
        // Delete old avatar from Cloudinary (if exists and not Google avatar)
        if (user.avatar && !user.avatar.includes("googleusercontent.com")) {
          const oldPublicId = extractPublicId(user.avatar);
          if (oldPublicId) {
            await deleteMedia(oldPublicId, "image");
          }
        }

        // Upload new avatar
        const uploadedAvatar = await uploadImage(req.file.buffer, "avatars", {
          transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" }, // Square crop focused on face
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ],
        });

        user.avatar = uploadedAvatar.url;
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: `Failed to upload avatar: ${uploadError.message}`,
        });
      }
    }

    await user.save({ validateModifiedOnly: true });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    // Clean up uploaded avatar on error
    if (req.file && req.file.cloudinary_id) {
      await deleteMedia(req.file.cloudinary_id, "image");
    }
    
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }
    
    // Handle duplicate key error (MongoDB) - email already exists
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current password and new password",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 1 letter, 1 number, and 1 special character (@$!%*?&)",
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password using save() with validateModifiedOnly option
    user.password = newPassword;
    await user.save({ validateModifiedOnly: true });

    // Revoke all refresh tokens for security
    const ipAddress = getIpAddress(req);
    await revokeAllUserTokens(user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// @desc    Google OAuth Login
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify Google token
    const { valid, payload, error } = await verifyGoogleToken(token);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Google token",
        error,
      });
    }

    // Check if email is verified
    if (!payload.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your Google email first",
      });
    }

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId: payload.googleId });

    // If not found by Google ID, check by email
    if (!user) {
      user = await User.findOne({ email: payload.email });
    }

    if (user) {
      // User exists - update Google info if needed
      if (!user.googleId) {
        user.googleId = payload.googleId;
      }
      if (!user.avatar && payload.avatar) {
        user.avatar = payload.avatar;
      }
      if (!user.name && payload.name) {
        user.name = payload.name;
      }
      if (user.provider === "local") {
        // Link Google account to existing local account
        user.provider = "google";
      }
      // Update user info (use findByIdAndUpdate to avoid validation on existing fields)
      await User.findByIdAndUpdate(user._id, {
        googleId: user.googleId,
        avatar: user.avatar,
        name: user.name,
        provider: user.provider,
        lastLogin: Date.now()
      });
    } else {
      // Create new user with Google account
      // Sanitize name: remove numbers and special characters, or use default
      let userName = payload.name;
      if (!userName) {
        // Extract from email and sanitize
        const emailPrefix = payload.email.split('@')[0];
        // Remove numbers and special characters, keep only letters
        userName = emailPrefix.replace(/[^a-zA-Z]/g, '') || 'User';
      }
      
      user = await User.create({
        name: userName,
        email: payload.email,
        googleId: payload.googleId,
        avatar: payload.avatar,
        provider: "google",
        lastLogin: Date.now(),
        // No password needed for OAuth users
      });
    }

    // Generate JWT tokens
    const ipAddress = getIpAddress(req);
    const { accessToken, refreshToken } = await generateTokens(
      user._id,
      user.role,
      ipAddress
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          address: user.address,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }
    
    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Account with this Google ID already exists",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error authenticating with Google",
      error: error.message,
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role; // Filter by role: 'user' or 'admin'
    const isActive = req.query.isActive; // Filter by active status: 'true' or 'false'
    const search = req.query.search; // Search by name or email

    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count for pagination
    const total = await User.countDocuments(query);
    
    // Get users with pagination
    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire') // Exclude sensitive fields
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .skip((page - 1) * limit);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize: limit,
          totalItems: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// @desc    Update user account status (Admin only)
// @route   PUT /api/auth/users/:userId/status
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // Validate input
    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide isActive status (true or false)",
      });
    }

    // Validate boolean value
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value (true or false)",
      });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Update status directly without triggering validation on other fields
    await User.findByIdAndUpdate(
      userId,
      { isActive },
      { 
        new: false, // Don't need the updated document
        runValidators: false // Skip validation since we're only updating isActive
      }
    );

    // Update local user object for response
    user.isActive = isActive;

    // If deactivating, revoke all user's tokens
    if (!isActive) {
      const ipAddress = getIpAddress(req);
      await revokeAllUserTokens(user._id, ipAddress);
    }

    res.status(200).json({
      success: true,
      message: `User account has been ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isActive: user.isActive,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    
    // Handle invalid ObjectId (CastError)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating user status",
      error: error.message,
    });
  }
};

// @desc    Forgot password - Request reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Validate email format
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset token has been sent.",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    // Check if user is using OAuth (Google)
    if (user.provider !== "local") {
      return res.status(400).json({
        success: false,
        message: `This account uses ${user.provider} authentication. Please login with ${user.provider}.`,
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();

    // Save user with reset token (skip validation)
    await user.save({ validateModifiedOnly: true });

    // In production, you would send this token via email
    // For now, we return it in the response (NOT RECOMMENDED FOR PRODUCTION)
    res.status(200).json({
      success: true,
      message: "Password reset token generated successfully",
      data: {
        resetToken, // In production, send this via email instead
        expiresIn: "10 minutes",
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing forgot password request",
      error: error.message,
    });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { resetToken } = req.params;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 1 letter, 1 number, and 1 special character (@$!%*?&)",
      });
    }

    // Hash the token from URL to compare with database
    const crypto = require("crypto");
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token not expired
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save with validateModifiedOnly to avoid validating other fields
    await user.save({ validateModifiedOnly: true });

    // Revoke all refresh tokens for security
    const ipAddress = getIpAddress(req);
    await revokeAllUserTokens(user._id, ipAddress);

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

