import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      match: [
        /^[a-zA-ZÀ-ỹ\s]+$/,
        "Name can only contain letters and spaces"
      ],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address"
      ],
    },
    password: {
      type: String,
      required: function () {
        // Password is required only for local auth (not OAuth)
        return this.provider === "local";
      },
      select: false, // Don't return password by default
      // Note: Password validation is done at controller level before hashing
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true, // Allows multiple null values
      unique: true,
    },
    avatar: {
      type: String, // Store user profile picture URL
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [
        /^(\+84|0)[3|5|7|8|9][0-9]{8}$/,
        "Please provide a valid Vietnamese phone number"
      ],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    address: {
      street: {
        type: String,
        trim: true,
        maxlength: [200, "Street address cannot exceed 200 characters"],
      },
      city: {
        type: String,
        trim: true,
        maxlength: [100, "City name cannot exceed 100 characters"],
      },
      district: {
        type: String,
        trim: true,
        maxlength: [100, "District name cannot exceed 100 characters"],
      },
      ward: {
        type: String,
        trim: true,
        maxlength: [100, "Ward name cannot exceed 100 characters"],
      },
      country: {
        type: String,
        trim: true,
        default: "Vietnam",
        maxlength: [100, "Country name cannot exceed 100 characters"],
      },
      postalCode: {
        type: String,
        trim: true,
        maxlength: [20, "Postal code cannot exceed 20 characters"],
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      select: false, // Don't return by default
    },
    resetPasswordExpire: {
      type: Date,
      select: false, // Don't return by default
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified or new
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Method to get public profile (without sensitive data)
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Method to generate reset password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token using crypto
  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire time (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("User", userSchema);

