import mongoose from "mongoose";

const storyBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["text", "image"],
    required: [true, "Block type is required"],
  },
  order: {
    type: Number,
    required: [true, "Block order is required"],
    min: [0, "Order cannot be negative"],
  },
  // For text blocks
  content: {
    type: String,
    maxlength: [5000, "Text content cannot exceed 5000 characters"],
    trim: true,
  },
  // For image blocks
  image: {
    url: String,
    publicId: String,
    caption: {
      type: String,
      maxlength: [200, "Caption cannot exceed 200 characters"],
    },
    alt: {
      type: String,
      maxlength: [100, "Alt text cannot exceed 100 characters"],
    },
  },
}, { _id: false });

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Story title is required"],
    trim: true,
    minlength: [3, "Title must be at least 3 characters"],
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
  },
  blocks: {
    type: [storyBlockSchema],
    validate: {
      validator: function(blocks) {
        return blocks.length <= 50; // Maximum 50 blocks
      },
      message: "Maximum 50 blocks allowed per story",
    },
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        return tags.length <= 10; // Maximum 10 tags
      },
      message: "Maximum 10 tags allowed",
    },
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft",
  },
  featuredImage: {
    type: String,
    trim: true,
  },
  views: {
    type: Number,
    default: 0,
    min: [0, "Views cannot be negative"],
  },
  publishedAt: Date,
  sortOrder: {
    type: Number,
    default: 0,
    index: true,
  },
  youtubeUrl: {
    type: String,
    trim: true,
    maxlength: [500, "YouTube URL cannot exceed 500 characters"],
  },
}, {
  timestamps: true,
});

// Generate slug from title before saving
storySchema.pre("save", function(next) {
  if (this.isModified("title") && !this.slug) {
    // Generate slug from title
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/--+/g, "-") // Replace multiple - with single -
      .trim();
    
    // Add timestamp to ensure uniqueness
    this.slug = `${this.slug}-${Date.now()}`;
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Validate blocks based on type
storyBlockSchema.pre("validate", function(next) {
  if (this.type === "text" && !this.content) {
    next(new Error("Text blocks must have content"));
  }
  if (this.type === "image" && !this.image?.url) {
    next(new Error("Image blocks must have an image URL"));
  }
  next();
});

// Indexes for performance
storySchema.index({ slug: 1 });
storySchema.index({ author: 1 });
storySchema.index({ status: 1 });
storySchema.index({ publishedAt: -1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ title: "text", description: "text", tags: "text" }); // Text search

export default mongoose.model("Story", storySchema);

