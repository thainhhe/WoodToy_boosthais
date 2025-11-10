import Story from "../models/Story.js";
import { sendCreated, sendError, sendNotFound, sendPaginated, sendSuccess, sendServerError } from "../utils/responseHandler.js";
import { deleteMultipleImages, deleteMedia, uploadImage } from "../utils/uploadUtils.js";

// Helpers
const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const parseJSON = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
};

const buildFilesMap = (files = []) => {
  const map = new Map();
  for (const f of files) {
    map.set(f.fieldname, f);
  }
  return map;
};

const ensureBlockOrders = (blocks = []) => {
  return blocks
    .map((b, idx) => ({ ...b, order: typeof b.order === "number" ? b.order : idx }))
    .sort((a, b) => a.order - b.order);
};

/**
 * GET /api/stories
 * Public (status=published) | Admin can pass status filter
 */
export const getStories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      tags, // comma-separated
    } = req.query;

    const numericPage = Math.max(1, parseInt(page, 10) || 1);
    const numericLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const filter = {};
    // Non-admins only see published
    if (status) {
      filter.status = status;
    } else if (!req.user || req.user.role !== "admin") {
      filter.status = "published";
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (tags) {
      const tagArr = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagArr.length) filter.tags = { $in: tagArr };
    }

    console.log("[getStories] query:", req.query);
    const [items, total] = await Promise.all([
      Story.find(filter)
        .sort({ sortOrder: 1, publishedAt: -1, createdAt: -1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Story.countDocuments(filter),
    ]);
    console.log("[getStories] filter:", filter, "page:", numericPage, "limit:", numericLimit, "total:", total);
    return sendPaginated(res, items, numericPage, numericLimit, total, "Stories retrieved successfully");
  } catch (error) {
    return sendServerError(res, "Failed to fetch stories", error);
  }
};

/**
 * GET /api/stories/:identifier (id or slug)
 */
export const getStoryByIdentifier = async (req, res) => {
  try {
    const { identifier } = req.params;
    const query = isValidObjectId(identifier) ? { _id: identifier } : { slug: identifier };

    const story = await Story.findOne(query);
    if (!story) return sendNotFound(res, "Story not found");

    // Non-admin cannot access drafts
    if ((!req.user || req.user.role !== "admin") && story.status !== "published") {
      return sendNotFound(res, "Story not found");
    }

    return sendSuccess(res, { story }, "Story retrieved successfully");
  } catch (error) {
    return sendServerError(res, "Failed to fetch story", error);
  }
};

/**
 * POST /api/stories
 * multipart/form-data
 * - featuredImage: file
 * - blocks: JSON string
 * - blockImage_{index} or storyImage_{index}: file(s) for image blocks
 */
export const createStory = async (req, res) => {
  try {
    console.log("[createStory] body keys:", Object.keys(req.body || {}));
    console.log(
      "[createStory] files:",
      (req.files || []).map((f) => ({ field: f.fieldname, size: f.size, mimetype: f.mimetype }))
    );
    const filesMap = buildFilesMap(req.files || []);
    const {
      title,
      description,
      status = "draft",
      tags = "",
      sortOrder,
      youtubeUrl,
    } = req.body;

    if (!title) return sendError(res, "Title is required", 400);

    // Parse blocks JSON
    let blocks = parseJSON(req.body.blocks, []);
    console.log("[createStory] raw blocks length:", Array.isArray(blocks) ? blocks.length : 0);
    if (!Array.isArray(blocks)) blocks = [];
    blocks = ensureBlockOrders(blocks);

    // Featured image upload if provided
    const featured = filesMap.get("featuredImage");
    let featuredImageUrl = undefined;
    if (featured) {
      const uploaded = await uploadImage(featured.buffer, "stories/featured");
      featuredImageUrl = uploaded.url;
    }

    // Handle image blocks: if block.type === 'image' and no image.url, try upload corresponding file
    const processedBlocks = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i] || {};
      if (b.type === "image") {
        const fieldA = `blockImage_${i}`;
        const fieldB = `storyImage_${i}`; // alternative naming supported
        const file = filesMap.get(fieldA) || filesMap.get(fieldB);

        let imageData = b.image || {};
        if (!imageData.url && file) {
          const uploaded = await uploadImage(file.buffer, "stories/blocks");
          imageData = {
            ...(b.image || {}),
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        }

        processedBlocks.push({
          type: "image",
          order: b.order,
          image: {
            url: imageData.url,
            publicId: imageData.publicId,
            caption: imageData.caption || b.image?.caption || "",
            alt: imageData.alt || b.image?.alt || "",
          },
        });
      } else {
        // Text block
        processedBlocks.push({
          type: "text",
          order: b.order,
          content: String(b.content || "").trim(),
        });
      }
    }

    const tagArr = String(tags)
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const story = await Story.create({
      title,
      description,
      status,
      tags: tagArr,
      blocks: processedBlocks,
      author: req.user?._id,
      featuredImage: featuredImageUrl,
      sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      youtubeUrl: youtubeUrl || undefined,
    });

    console.log("[createStory] created story id:", story._id);
    return sendCreated(res, { story }, "Story created successfully");
  } catch (error) {
    console.error("[createStory] error:", error?.message, error?.stack);
    return sendServerError(res, "Failed to create story", error);
  }
};

/**
 * PUT /api/stories/:id
 */
export const updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid story id", 400);

    const story = await Story.findById(id);
    if (!story) return sendNotFound(res, "Story not found");

    console.log("[updateStory] id:", id);
    console.log("[updateStory] body keys:", Object.keys(req.body || {}));
    console.log(
      "[updateStory] files:",
      (req.files || []).map((f) => ({ field: f.fieldname, size: f.size, mimetype: f.mimetype }))
    );
    const filesMap = buildFilesMap(req.files || []);
    const {
      title,
      description,
      status,
      tags,
      removeFeaturedImage,
      sortOrder,
      youtubeUrl,
    } = req.body;

    // Update simple fields
    if (title !== undefined) story.title = title;
    if (description !== undefined) story.description = description;
    if (status !== undefined) story.status = status;
    if (sortOrder !== undefined) story.sortOrder = parseInt(sortOrder, 10);
    if (youtubeUrl !== undefined) story.youtubeUrl = youtubeUrl || undefined;
    if (tags !== undefined) {
      story.tags = String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Featured image replace/remove
    const featured = filesMap.get("featuredImage");
    if (featured) {
      const uploaded = await uploadImage(featured.buffer, "stories/featured");
      story.featuredImage = uploaded.url;
    } else if (removeFeaturedImage === "true") {
      story.featuredImage = undefined;
    }

    // Blocks update
    if (req.body.blocks !== undefined) {
      let incomingBlocks = parseJSON(req.body.blocks, []);
      console.log("[updateStory] incoming blocks length:", Array.isArray(incomingBlocks) ? incomingBlocks.length : 0);
      if (!Array.isArray(incomingBlocks)) incomingBlocks = [];
      incomingBlocks = ensureBlockOrders(incomingBlocks);

      const updatedBlocks = [];
      for (let i = 0; i < incomingBlocks.length; i++) {
        const b = incomingBlocks[i] || {};
        if (b.type === "image") {
          const fieldA = `blockImage_${i}`;
          const fieldB = `storyImage_${i}`;
          const file = filesMap.get(fieldA) || filesMap.get(fieldB);

          let imageData = b.image || {};
          if (!imageData.url && file) {
            const uploaded = await uploadImage(file.buffer, "stories/blocks");
            imageData = {
              ...(b.image || {}),
              url: uploaded.url,
              publicId: uploaded.publicId,
            };
          }

          updatedBlocks.push({
            type: "image",
            order: b.order,
            image: {
              url: imageData.url,
              publicId: imageData.publicId,
              caption: imageData.caption || b.image?.caption || "",
              alt: imageData.alt || b.image?.alt || "",
            },
          });
        } else {
          updatedBlocks.push({
            type: "text",
            order: b.order,
            content: String(b.content || "").trim(),
          });
        }
      }

      story.blocks = updatedBlocks;
    }

    await story.save();
    console.log("[updateStory] updated story id:", story._id);
    return sendSuccess(res, { story }, "Story updated successfully");
  } catch (error) {
    console.error("[updateStory] error:", error?.message, error?.stack);
    return sendServerError(res, "Failed to update story", error);
  }
};

/**
 * DELETE /api/stories/:id
 */
export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) return sendError(res, "Invalid story id", 400);

    const story = await Story.findById(id);
    if (!story) return sendNotFound(res, "Story not found");

    // Try to delete block images from Cloudinary if we stored publicId
    const publicIds = (story.blocks || [])
      .filter((b) => b.type === "image" && b.image?.publicId)
      .map((b) => b.image.publicId);
    if (publicIds.length) {
      await deleteMultipleImages(publicIds);
    }

    // Note: featuredImage might be URL without stored publicId; skip safe deletion
    await story.deleteOne();
    return sendSuccess(res, null, "Story deleted successfully");
  } catch (error) {
    return sendServerError(res, "Failed to delete story", error);
  }
};

/**
 * GET /api/stories/categories/list
 */
// category removed

/**
 * GET /api/stories/tags/popular
 */
export const getPopularTags = async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const tags = await Story.aggregate([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 0, tag: "$_id", count: 1 } },
    ]);
    return sendSuccess(res, { tags }, "Tags retrieved successfully");
  } catch (error) {
    return sendServerError(res, "Failed to fetch tags", error);
  }
};


