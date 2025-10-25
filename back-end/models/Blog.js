import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required for comment"],
  },
  content: {
    type: String,
    required: [true, "Comment content is required"],
    trim: true,
    maxlength: [1000, "Comment cannot exceed 1000 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

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

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a blog title"],
    trim: true,
    minlength: [10, "Title must be at least 10 characters"],
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, "Excerpt cannot exceed 500 characters"],
  },
  content: {
    type: String,
    required: [true, "Please provide blog content"],
    trim: true,
    minlength: [100, "Content must be at least 100 characters"],
    // No maxlength - allow very long blog posts
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  // Featured image (main image)
  featuredImage: {
    type: String,
    trim: true,
  },
  // Multiple images support (for gallery or content images)
  images: {
    type: [imageSchema],
    validate: {
      validator: function(images) {
        return images.length <= 20; // Maximum 20 images
      },
      message: "Maximum 20 images allowed per blog post",
    },
  },
  category: {
    type: String,
    required: [true, "Please provide a category"],
    trim: true,
    maxlength: [100, "Category cannot exceed 100 characters"],
    enum: {
      values: ["News", "Tutorial", "Review", "Story", "Tips", "Crafts", "Other"],
      message: "Invalid category",
    },
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
  views: {
    type: Number,
    default: 0,
    min: [0, "Views cannot be negative"],
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [commentSchema],
  // SEO fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [70, "Meta title cannot exceed 70 characters"],
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, "Meta description cannot exceed 160 characters"],
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Generate slug from title before saving
blogSchema.pre("save", function(next) {
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
  
  // Auto-generate excerpt if not provided
  if (this.isModified("content") && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200).trim() + "...";
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Virtual for primary image
blogSchema.virtual("primaryImage").get(function() {
  const primary = this.images?.find(img => img.isPrimary);
  return primary?.url || this.images?.[0]?.url || this.featuredImage || null;
});

// Virtual for like count
blogSchema.virtual("likesCount").get(function() {
  return this.likes?.length || 0;
});

// Virtual for comment count
blogSchema.virtual("commentsCount").get(function() {
  return this.comments?.length || 0;
});

// Virtual for reading time (assuming 200 words per minute)
blogSchema.virtual("readingTime").get(function() {
  if (!this.content) return 0;
  const words = this.content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
});

// Indexes for performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ title: "text", content: "text", tags: "text" }); // Text search

// Ensure virtuals are included in JSON
blogSchema.set("toJSON", { virtuals: true });
blogSchema.set("toObject", { virtuals: true });

export default mongoose.model("Blog", blogSchema);

