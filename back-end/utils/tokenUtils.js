import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";

// Generate Access Token (short-lived)
export const generateAccessToken = (userId, role) => {
  const payload = {
    userId,
    role,
    type: "access",
  };

  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m", // 15 minutes
  });
};

// Generate Refresh Token (long-lived)
export const generateRefreshToken = async (userId, ipAddress) => {
  // Create a random refresh token
  const token = crypto.randomBytes(64).toString("hex");

  // Calculate expiry date
  const expiresAt = new Date();
  const refreshExpireDays = parseInt(process.env.JWT_REFRESH_EXPIRE_DAYS || "7");
  expiresAt.setDate(expiresAt.getDate() + refreshExpireDays);

  // Save refresh token to database
  const refreshToken = await RefreshToken.create({
    token,
    user: userId,
    expiresAt,
    createdByIp: ipAddress,
  });

  return refreshToken.token;
};

// Generate both tokens
export const generateTokens = async (userId, role, ipAddress) => {
  const accessToken = generateAccessToken(userId, role);
  const refreshToken = await generateRefreshToken(userId, ipAddress);

  return {
    accessToken,
    refreshToken,
  };
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Verify Refresh Token
export const verifyRefreshToken = async (token) => {
  try {
    const refreshToken = await RefreshToken.findOne({ token }).populate(
      "user",
      "-password"
    );

    if (!refreshToken) {
      return { valid: false, error: "Invalid refresh token" };
    }

    if (!refreshToken.isActive) {
      return { valid: false, error: "Refresh token is no longer active" };
    }

    return { valid: true, refreshToken };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Revoke Refresh Token
export const revokeRefreshToken = async (token, ipAddress, replacedByToken = null) => {
  try {
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken) {
      return { success: false, error: "Token not found" };
    }

    // Mark as revoked
    refreshToken.revokedAt = Date.now();
    refreshToken.revokedByIp = ipAddress;
    if (replacedByToken) {
      refreshToken.replacedByToken = replacedByToken;
    }

    await refreshToken.save();

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Revoke all refresh tokens for a user
export const revokeAllUserTokens = async (userId, ipAddress) => {
  try {
    await RefreshToken.updateMany(
      { user: userId, revokedAt: null },
      {
        $set: {
          revokedAt: Date.now(),
          revokedByIp: ipAddress,
        },
      }
    );

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Clean up expired/revoked tokens (can be run as a cron job)
export const cleanupTokens = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await RefreshToken.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { revokedAt: { $lt: thirtyDaysAgo } },
      ],
    });

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

