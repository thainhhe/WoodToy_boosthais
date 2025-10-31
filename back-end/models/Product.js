import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const videoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
  },
  duration: {
    type: Number, // in seconds
  },
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a product name"],
    trim: true,
    maxlength: [200, "Product name cannot exceed 200 characters"],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please provide a product price"],
    min: [0, "Price cannot be negative"],
  },
  // Deprecated: Use images array instead
  image: {
    type: String,
    trim: true,
  },
  // Multiple images support
  images: {
    type: [imageSchema],
    validate: {
      validator: function(images) {
        return images.length <= 10; // Maximum 10 images
      },
      message: "Maximum 10 images allowed per product",
    },
  },
  // Single video support
  video: {
    type: videoSchema,
    default: null,
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, "Category cannot exceed 100 characters"],
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Virtual for primary image
productSchema.virtual("primaryImage").get(function() {
  const primary = this.images?.find(img => img.isPrimary);
  return primary?.url || this.images?.[0]?.url || this.image || null;
});

// Index for performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Ensure virtuals are included in JSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
