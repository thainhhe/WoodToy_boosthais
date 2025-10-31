import express from "express";
import {
  getStories,
  getStoryByIdentifier,
  createStory,
  updateStory,
  deleteStory,
  getPopularTags,
} from "../controllers/storyController.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";
import { uploadProductMedia, handleMulterError } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/stories:
 *   get:
 *     summary: Get all stories
 *     tags: [Stories]
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
 *       
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
 *         description: Search in title, description, tags
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *     responses:
 *       200:
 *         description: Stories retrieved successfully
 */
router.get("/", optionalAuth, getStories);

// category endpoints removed

/**
 * @swagger
 * /api/stories/tags/popular:
 *   get:
 *     summary: Get popular story tags
 *     tags: [Stories]
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
 */
router.get("/tags/popular", getPopularTags);

/**
 * @swagger
 * /api/stories/{identifier}:
 *   get:
 *     summary: Get story by ID or slug
 *     tags: [Stories]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         required: true
 *         schema:
 *           type: string
 *         description: Story ID or slug
 *     responses:
 *       200:
 *         description: Story retrieved successfully
 *       404:
 *         description: Story not found
 */
router.get("/:identifier", optionalAuth, getStoryByIdentifier);

/**
 * @swagger
 * /api/stories:
 *   post:
 *     summary: Create new story
 *     tags: [Stories]
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               blocks:
 *                 type: string
 *                 description: JSON array of story blocks
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *               blockImage_0:
 *                 type: string
 *                 format: binary
 *               blockImage_1:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Story created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  protect,
  authorize("admin"),
  uploadProductMedia,
  handleMulterError,
  createStory
);

/**
 * @swagger
 * /api/stories/{id}:
 *   put:
 *     summary: Update story
 *     tags: [Stories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Story ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               
 *               tags:
 *                 type: string
 *               status:
 *                 type: string
 *               blocks:
 *                 type: string
 *                 description: JSON array of story blocks
 *               deletedBlockImages:
 *                 type: string
 *                 description: JSON array of publicIds to delete
 *               removeFeaturedImage:
 *                 type: string
 *                 enum: ["true", "false"]
 *               featuredImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Story updated successfully
 *       404:
 *         description: Story not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  protect,
  authorize("admin"),
  uploadProductMedia,
  handleMulterError,
  updateStory
);

/**
 * @swagger
 * /api/stories/{id}:
 *   delete:
 *     summary: Delete story
 *     tags: [Stories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Story ID
 *     responses:
 *       200:
 *         description: Story deleted successfully
 *       404:
 *         description: Story not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", protect, authorize("admin"), deleteStory);

export default router;

