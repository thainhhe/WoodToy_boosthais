import Blog from "../models/Blog.js";
import { handleError } from "../utils/errorHandler.js";
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendValidationError,
  sendPaginated,
} from "../utils/responseHandler.js";
import {
  uploadImage,
  uploadMultipleImages,
  deleteMedia,
  deleteMultipleImages,
  extractPublicId,
} from "../utils/uploadUtils.js";

// @desc    Get all blogs with pagination, filtering, and search
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const status = req.query.status || "published"; // Default to published for public
    const search = req.query.search;
    const tags = req.query.tags; // Comma-separated tags

    // Build query
    const query = {};

    // Only admins can see drafts
    if (req.user?.role === "admin") {
      if (status) query.status = status;
    } else {
      query.status = "published";
    }

    if (category) {
      query.category = category;
    }

    if (tags) {
      const tagArray = tags.split(",").map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const total = await Blog.countDocuments(query);

    let blogsQuery = Blog.find(query)
      .populate("author", "name email avatar")
      .populate("comments.user", "name avatar")
      .select("-content") // Exclude full content in list view
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // If text search, sort by relevance
    if (search) {
      blogsQuery = blogsQuery.sort({ score: { $meta: "textScore" } });
    }

    const blogs = await blogsQuery;

    return sendPaginated(
      res,
      blogs,
      page,
      limit,
      total,
      "Blogs retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching blogs");
    return res.status(status).json(response);
  }
};

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:id (can be ID or slug)
// @access  Public
export const getBlogByIdentifier = async (req, res) => {
  try {
    const { id } = req.params;
    let blog = null;

    // Check if id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

    if (isValidObjectId) {
      // Try to find by ID first
      blog = await Blog.findById(id)
        .populate("author", "name email avatar role")
        .populate("comments.user", "name avatar");
    }

    // If not found by ID, try to find by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: id })
        .populate("author", "name email avatar role")
        .populate("comments.user", "name avatar");
    }

    if (!blog) {
      return sendNotFound(res, "Blog post not found");
    }

    // Check if user can view draft posts
    if (blog.status === "draft") {
      if (!req.user || (req.user.role !== "admin" && req.user._id.toString() !== blog.author._id.toString())) {
        return sendNotFound(res, "Blog post not found");
      }
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return sendSuccess(res, { blog }, "Blog retrieved successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching blog");
    return res.status(status).json(response);
  }
};

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private/Admin
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return sendValidationError(res, [
        "Title, content, and category are required",
      ]);
    }

    // Prepare blog data
    const blogData = {
      title,
      content,
      excerpt,
      category,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [],
      status: status || "draft",
      author: req.user._id,
      metaTitle,
      metaDescription,
      images: [],
    };

    // Organize uploaded files by field name (since we use .any() in middleware)
    const filesByField = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      });
    }

    // Upload featured image if provided
    if (filesByField.featuredImage && filesByField.featuredImage[0]) {
      try {
        const uploadedImage = await uploadImage(
          filesByField.featuredImage[0].buffer,
          "blogs"
        );
        blogData.featuredImage = uploadedImage.url;
      } catch (uploadError) {
        return sendValidationError(res, [
          `Failed to upload featured image: ${uploadError.message}`,
        ]);
      }
    }

    // Upload additional images if provided
    if (filesByField.images) {
      const imageFiles = filesByField.images;

      try {
        const uploadedImages = await uploadMultipleImages(
          imageFiles.map((file) => file.buffer),
          "blogs"
        );

        blogData.images = uploadedImages.map((img, index) => ({
          url: img.url,
          publicId: img.publicId,
          alt: `${title} - Image ${index + 1}`,
          isPrimary: index === 0,
        }));
      } catch (uploadError) {
        // Clean up featured image if it was uploaded
        if (blogData.featuredImage) {
          const publicId = extractPublicId(blogData.featuredImage);
          if (publicId) await deleteMedia(publicId, "image");
        }
        return sendValidationError(res, [
          `Failed to upload images: ${uploadError.message}`,
        ]);
      }
    }

    // Create blog
    const blog = await Blog.create(blogData);
    await blog.populate("author", "name email avatar");

    return sendCreated(res, { blog }, "Blog created successfully");
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files && blogData) {
      // Clean up featured image if it was uploaded
      if (blogData.featuredImage) {
        const publicId = extractPublicId(blogData.featuredImage);
        if (publicId) {
          await deleteMedia(publicId, "image");
        }
      }
      // Clean up images if they were uploaded
      if (blogData.images && blogData.images.length > 0) {
        await deleteMultipleImages(blogData.images.map(img => img.publicId));
      }
    }

    const { status, response } = handleError(error, "Error creating blog", {
      duplicateMessage: "Blog with this title already exists",
    });
    return res.status(status).json(response);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
export const updateBlog = async (req, res) => {
  try {
    // Debug logging
    console.log("=== UPDATE BLOG DEBUG ===");
    console.log("Blog ID from params:", req.params.id);
    console.log("Full URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("User role:", req.user?.role);
    console.log("========================");

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      status,
      metaTitle,
      metaDescription,
      deletedImages,
      removeFeaturedImage,
    } = req.body;

    const blog = await Blog.findById(req.params.id);

    console.log("Blog found:", blog ? `Yes (${blog._id})` : "No");

    if (!blog) {
      return sendNotFound(res, "Blog not found");
    }

    // Check ownership (admin or author can update)
    if (req.user.role !== "admin" && blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this blog",
      });
    }

    // Update basic fields
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category !== undefined) blog.category = category;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());
    }
    if (status !== undefined) blog.status = status;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;

    // Organize uploaded files by field name (since we use .any() in middleware)
    const filesByField = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      });
    }

    // Handle featured image removal
    if (removeFeaturedImage === "true" && blog.featuredImage) {
      const publicId = extractPublicId(blog.featuredImage);
      if (publicId) {
        await deleteMedia(publicId, "image");
      }
      blog.featuredImage = undefined;
    }

    // Handle new featured image upload
    if (filesByField.featuredImage && filesByField.featuredImage[0]) {
      // Delete old featured image if exists
      if (blog.featuredImage) {
        const oldPublicId = extractPublicId(blog.featuredImage);
        if (oldPublicId) {
          await deleteMedia(oldPublicId, "image");
        }
      }

      try {
        const uploadedImage = await uploadImage(
          filesByField.featuredImage[0].buffer,
          "blogs"
        );
        blog.featuredImage = uploadedImage.url;
      } catch (uploadError) {
        return sendValidationError(res, [
          `Failed to upload featured image: ${uploadError.message}`,
        ]);
      }
    }

    // Handle image deletion
    if (deletedImages) {
      const imagesToDelete = JSON.parse(deletedImages);

      // Delete from Cloudinary
      for (const publicId of imagesToDelete) {
        await deleteMedia(publicId, "image");
      }

      // Remove from blog
      blog.images = blog.images.filter(
        (img) => !imagesToDelete.includes(img.publicId)
      );
    }

    // Handle new image uploads
    if (filesByField.images) {
      const imageFiles = filesByField.images;

      try {
        const uploadedImages = await uploadMultipleImages(
          imageFiles.map((file) => file.buffer),
          "blogs"
        );

        const newImages = uploadedImages.map((img, index) => ({
          url: img.url,
          publicId: img.publicId,
          alt: `${blog.title} - Image ${blog.images.length + index + 1}`,
          isPrimary: blog.images.length === 0 && index === 0,
        }));

        blog.images.push(...newImages);
      } catch (uploadError) {
        return sendValidationError(res, [
          `Failed to upload images: ${uploadError.message}`,
        ]);
      }
    }

    const updatedBlog = await blog.save();
    await updatedBlog.populate("author", "name email avatar");

    return sendSuccess(res, { blog: updatedBlog }, "Blog updated successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error updating blog");
    return res.status(status).json(response);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
export const deleteBlog = async (req, res) => {
  try {
    // Debug logging
    console.log("=== DELETE BLOG DEBUG ===");
    console.log("Blog ID from params:", req.params.id);
    console.log("Full URL:", req.originalUrl);
    console.log("Method:", req.method);
    console.log("User role:", req.user?.role);
    console.log("========================");

    const blog = await Blog.findById(req.params.id);

    console.log("Blog found:", blog ? `Yes (${blog._id})` : "No");

    if (!blog) {
      return sendNotFound(res, "Blog not found");
    }

    // Check ownership (admin or author can delete)
    if (req.user.role !== "admin" && blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this blog",
      });
    }

    // Delete featured image from Cloudinary
    if (blog.featuredImage) {
      const publicId = extractPublicId(blog.featuredImage);
      if (publicId) {
        await deleteMedia(publicId, "image");
      }
    }

    // Delete all images from Cloudinary
    if (blog.images && blog.images.length > 0) {
      const publicIds = blog.images.map((img) => img.publicId);
      await deleteMultipleImages(publicIds);
    }

    await Blog.deleteOne({ _id: req.params.id });

    return sendSuccess(res, null, "Blog deleted successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error deleting blog");
    return res.status(status).json(response);
  }
};

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return sendNotFound(res, "Blog not found");
    }

    // Check if user already liked
    const likeIndex = blog.likes.findIndex(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
      await blog.save();
      return sendSuccess(
        res,
        { liked: false, likesCount: blog.likes.length },
        "Blog unliked successfully"
      );
    } else {
      // Like
      blog.likes.push(req.user._id);
      await blog.save();
      return sendSuccess(
        res,
        { liked: true, likesCount: blog.likes.length },
        "Blog liked successfully"
      );
    }
  } catch (error) {
    const { status, response } = handleError(error, "Error liking blog");
    return res.status(status).json(response);
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return sendValidationError(res, ["Comment content is required"]);
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return sendNotFound(res, "Blog not found");
    }

    // Only allow comments on published blogs
    if (blog.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Cannot comment on unpublished blogs",
      });
    }

    const newComment = {
      user: req.user._id,
      content: content.trim(),
      createdAt: Date.now(),
    };

    blog.comments.push(newComment);
    await blog.save();

    // Populate the newly added comment
    await blog.populate("comments.user", "name avatar");

    const addedComment = blog.comments[blog.comments.length - 1];

    return sendCreated(
      res,
      { comment: addedComment, commentsCount: blog.comments.length },
      "Comment added successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error adding comment");
    return res.status(status).json(response);
  }
};

// @desc    Delete comment from blog
// @route   DELETE /api/blogs/:id/comments/:commentId
// @access  Private (owner or admin)
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return sendNotFound(res, "Blog not found");
    }

    const comment = blog.comments.id(commentId);

    if (!comment) {
      return sendNotFound(res, "Comment not found");
    }

    // Check if user is comment owner or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this comment",
      });
    }

    comment.deleteOne();
    await blog.save();

    return sendSuccess(
      res,
      { commentsCount: blog.comments.length },
      "Comment deleted successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error deleting comment");
    return res.status(status).json(response);
  }
};

// @desc    Get blog categories with count
// @route   GET /api/blogs/categories/list
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(
      res,
      { categories },
      "Categories retrieved successfully"
    );
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching categories");
    return res.status(status).json(response);
  }
};

// @desc    Get popular tags
// @route   GET /api/blogs/tags/popular
// @access  Public
export const getPopularTags = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const tags = await Blog.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    return sendSuccess(res, { tags }, "Tags retrieved successfully");
  } catch (error) {
    const { status, response } = handleError(error, "Error fetching tags");
    return res.status(status).json(response);
  }
};

