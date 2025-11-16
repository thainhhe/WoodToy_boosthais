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
  pricegiamgia: {
    type: Number,
    min: [0, "Discounted price cannot be negative"],
    validate: {
      validator: function(value) {
        // If pricegiamgia is set, it must be less than or equal to price
        return value === undefined || value === null || value <= this.price;
      },
      message: "Discounted price cannot be greater than regular price",
    },
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
  // Multiple videos support
  videos: {
    type: [videoSchema],
    validate: {
      validator: function(videos) {
        return videos.length <= 10; // Maximum 10 videos
      },
      message: "Maximum 10 videos allowed per product",
    },
  },
  // Deprecated: Use videos array instead (backward compatible)
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
  youtubeUrl: {
    type: String,
    trim: true,
    maxlength: [500, "YouTube URL cannot exceed 500 characters"],
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
