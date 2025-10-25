import express from "express";
const router = express.Router();
import {
  getBlogs,
  getBlogByIdentifier,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  deleteComment,
  getCategories,
  getPopularTags,
} from "../controllers/blogController.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";
import { uploadProductMedia, handleMulterError } from "../middleware/uploadMiddleware.js";

/**
 * @swagger
 * tags:
 *   name: Blog
 *   description: Blog management and interaction
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Blog:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           example: "10 Tips for Choosing Wooden Toys"
 *         slug:
 *           type: string
 *           example: "10-tips-for-choosing-wooden-toys-1234567890"
 *         excerpt:
 *           type: string
 *           example: "Discover the best ways to choose safe and fun wooden toys..."
 *         content:
 *           type: string
 *           example: "Full blog content here..."
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatar:
 *               type: string
 *         featuredImage:
 *           type: string
 *           example: "https://res.cloudinary.com/.../featured.jpg"
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               publicId:
 *                 type: string
 *               alt:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *         category:
 *           type: string
 *           enum: [News, Tutorial, Review, Story, Tips, Crafts, Other]
 *           example: "Tips"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["wooden toys", "safety", "kids"]
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           example: "published"
 *         views:
 *           type: number
 *           example: 1234
 *         likesCount:
 *           type: number
 *           example: 56
 *         commentsCount:
 *           type: number
 *           example: 12
 *         readingTime:
 *           type: number
 *           description: "Estimated reading time in minutes"
 *           example: 5
 *         metaTitle:
 *           type: string
 *         metaDescription:
 *           type: string
 *         publishedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             avatar:
 *               type: string
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/blogs/categories/list:
 *   get:
 *     summary: Get all blog categories with post count
 *     description: Retrieve list of categories used in published blogs
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "Tips"
 *                           count:
 *                             type: number
 *                             example: 15
 *       500:
 *         description: Server error
 */
router.get("/categories/list", getCategories);

/**
 * @swagger
 * /api/blogs/tags/popular:
 *   get:
 *     summary: Get popular tags
 *     description: Retrieve most used tags from published blogs
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tags to return
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/tags/popular", getPopularTags);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs with pagination and filtering
 *     description: Retrieve paginated list of blogs with optional filters
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [News, Tutorial, Review, Story, Tips, Crafts, Other]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter by status (admin only)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and tags
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags to filter by
 *         example: "wooden toys,safety"
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *                 pagination:
 *                   type: object
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create new blog post
 *     description: Create a new blog post with images (Admin only)
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 200
 *                 example: "10 Tips for Choosing Wooden Toys"
 *               content:
 *                 type: string
 *                 minLength: 100
 *                 example: "Full blog content here..."
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Short excerpt..."
 *               category:
 *                 type: string
 *                 enum: [News, Tutorial, Review, Story, Tips, Crafts, Other]
 *                 example: "Tips"
 *               tags:
 *                 type: string
 *                 description: "Comma-separated tags"
 *                 example: "wooden toys,safety,kids"
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               metaTitle:
 *                 type: string
 *                 maxLength: 70
 *               metaDescription:
 *                 type: string
 *                 maxLength: 160
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *                 description: "Featured image (max 10MB)"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: "Additional images (max 20)"
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error
 */
router.route("/")
  .get(optionalAuth, getBlogs)
  .post(protect, authorize("admin"), uploadProductMedia, handleMulterError, createBlog);

/**
 * @swagger
 * /api/blogs/{identifier}:
 *   get:
 *     summary: Get blog by ID or slug
 *     description: Retrieve a single blog post by ID or slug
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID or slug
 *         example: "10-tips-for-choosing-wooden-toys-1234567890"
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     blog:
 *                       $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update blog post
 *     description: Update an existing blog post (Admin or author only)
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: string
 *               status:
 *                 type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               removeFeaturedImage:
 *                 type: string
 *                 enum: ["true", "false"]
 *               deletedImages:
 *                 type: string
 *                 description: "JSON array of publicIds to delete"
 *                 example: '["woodtoy/blogs/img1", "woodtoy/blogs/img2"]'
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete blog post
 *     description: Delete a blog post (Admin or author only)
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.route("/:id")
  .get(optionalAuth, getBlogByIdentifier)
  .put(protect, authorize("admin"), uploadProductMedia, handleMulterError, updateBlog)
  .delete(protect, authorize("admin"), deleteBlog);

/**
 * @swagger
 * /api/blogs/{id}/like:
 *   post:
 *     summary: Like or unlike a blog post
 *     description: Toggle like status for a blog post
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Like status toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                     likesCount:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.post("/:id/like", protect, likeBlog);

/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Add comment to blog
 *     description: Add a comment to a published blog post
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Great article! Very helpful tips."
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       $ref: '#/components/schemas/Comment'
 *                     commentsCount:
 *                       type: number
 *       400:
 *         description: Validation error or unpublished blog
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.post("/:id/comments", protect, addComment);

/**
 * @swagger
 * /api/blogs/{id}/comments/{commentId}:
 *   delete:
 *     summary: Delete comment from blog
 *     description: Delete a comment (comment owner or admin only)
 *     tags: [Blog]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Blog or comment not found
 *       500:
 *         description: Server error
 */
router.delete("/:id/comments/:commentId", protect, deleteComment);

export default router;

