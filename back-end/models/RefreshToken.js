import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    createdByIp: {
      type: String,
    },
    revokedAt: {
      type: Date,
    },
    revokedByIp: {
      type: String,
    },
    replacedByToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic deletion of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual property to check if token is expired
refreshTokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expiresAt;
});

// Virtual property to check if token is active
refreshTokenSchema.virtual("isActive").get(function () {
  return !this.revokedAt && !this.isExpired;
});

export default mongoose.model("RefreshToken", refreshTokenSchema);

