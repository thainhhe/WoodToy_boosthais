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

// Story block schema for rich story content (text + images)
const storyBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    required: true,
  },
  order: {
    type: Number,
    required: true,
    min: 0,
  },
  // For text blocks
  content: {
    type: String,
    trim: true,
    maxlength: [5000, "Text block cannot exceed 5000 characters"],
    // Required only if type is "text"
    required: function() {
      return this.type === "text";
    },
  },
  // For image blocks
  image: {
    url: {
      type: String,
      required: function() {
        return this.parent().type === "image";
      },
    },
    publicId: {
      type: String,
      required: function() {
        return this.parent().type === "image";
      },
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, "Image caption cannot exceed 200 characters"],
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
  },
}, { _id: true });

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
  // Rich story content with text and images (replaces simple story field)
  storyBlocks: {
    type: [storyBlockSchema],
    validate: {
      validator: function(blocks) {
        return blocks.length <= 50; // Maximum 50 blocks (text + images combined)
      },
      message: "Maximum 50 story blocks allowed per product",
    },
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
