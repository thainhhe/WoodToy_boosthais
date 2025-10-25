import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBlogById,
  updateBlog,
  getBlogCategories,
  getPopularBlogTags,
  deleteCommentFromBlog,
} from "../../service/api";

export default function BlogEdit() {
  // Danh sách category enum cứng
  const CATEGORY_ENUM = [
    "News",
    "Tutorial",
    "Review",
    "Story",
    "Tips",
    "Crafts",
    "Other",
  ];
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: [],
    status: "draft",
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories and tags
    getBlogCategories()
      .then((res) => {
        // Đảm bảo luôn là mảng
        const cats = res?.data?.data?.categories;
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setCategories([]));
    getPopularBlogTags()
      .then((res) => {
        const tgs = res?.data?.data;
        setTags(Array.isArray(tgs) ? tgs : []);
      })
      .catch(() => setTags([]));
    // Fetch blog detail
    getBlogById(id)
      .then((res) => {
        const blog = res.data.data.blog;
        setForm({
          title: blog.title,
          content: blog.content,
          category: blog.category || "",
          tags: blog.tags || [],
          status: blog.status,
        });
        if (blog.featuredImage) setFeaturedImage(blog.featuredImage);
        if (blog.images && blog.images.length > 0)
          setImages(blog.images.map((img) => img.url));
        setComments(blog.comments || []);
      })
      .catch(() => setError("Không tìm thấy blog"));
    // eslint-disable-next-line
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCategoryChange = (e) => {
    setForm({ ...form, category: e.target.value });
  };

  const handleTagsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setForm({ ...form, tags: selected });
  };

  const handleFeaturedImageChange = (e) => {
    setFeaturedImage(e.target.files[0] || null);
  };

  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files).slice(0, 20)); // max 20 images
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("category", form.category);
      formData.append("status", form.status);
      formData.append("tags", JSON.stringify(form.tags));
      // Đúng chuẩn backend: tất cả ảnh đều dùng trường 'images'
      let allImages = [];
      // Chỉ thêm ảnh mới (File), không gửi URL string
      if (featuredImage && typeof featuredImage !== "string") {
        allImages.push(featuredImage);
      }
      if (images.length > 0) {
        images.forEach((img) => {
          if (typeof img !== "string") allImages.push(img);
        });
      }
      if (allImages.length > 0) {
        allImages.forEach((img) => formData.append("images", img));
      }
      await updateBlog(id, formData);
      navigate("/admin/blogs");
    } catch (err) {
      setError("Không thể cập nhật blog");
    }
    setLoading(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    setDeletingCommentId(commentId);
    try {
      await deleteCommentFromBlog(id, commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch {
      alert("Xóa bình luận thất bại!");
    }
    setDeletingCommentId(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Chỉnh sửa Blog</h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        encType="multipart/form-data"
      >
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Tiêu đề"
          className="w-full border rounded px-3 py-2"
          required
        />
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Nội dung"
          className="w-full border rounded px-3 py-2"
          rows={8}
          required
        />
        {/* Category select */}
        <select
          name="category"
          value={form.category}
          onChange={handleCategoryChange}
          className="w-full border rounded px-3 py-2"
          required
        >
          <option value="">Chọn danh mục</option>
          {CATEGORY_ENUM.map((cat) => {
            const found = categories.find((c) => c._id === cat);
            return (
              <option key={cat} value={cat}>
                {cat}
                {found ? ` (${found.count})` : ""}
              </option>
            );
          })}
        </select>
        {/* Tags multi-select */}
        <label className="block font-bold mb-1">Tags</label>
        <select
          name="tags"
          multiple
          value={form.tags}
          onChange={handleTagsChange}
          className="w-full border rounded px-3 py-2"
        >
          {tags.map((tag) => (
            <option key={tag._id || tag} value={tag.name || tag}>
              {tag.name || tag}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="draft">Nháp</option>
          <option value="published">Công khai</option>
        </select>
        {/* Featured Image */}
        <div>
          <label className="block font-bold mb-1">
            Ảnh đại diện (featured image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFeaturedImageChange}
          />
          {featuredImage && typeof featuredImage === "string" ? (
            <img
              src={featuredImage}
              alt="Preview"
              className="mt-2 h-24 rounded"
            />
          ) : featuredImage ? (
            <img
              src={URL.createObjectURL(featuredImage)}
              alt="Preview"
              className="mt-2 h-24 rounded"
            />
          ) : null}
        </div>
        {/* Gallery Images */}
        <div>
          <label className="block font-bold mb-1">
            Ảnh gallery (tối đa 20)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
          />
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((img, idx) =>
                typeof img === "string" ? (
                  <img
                    key={idx}
                    src={img}
                    alt={`Gallery ${idx + 1}`}
                    className="h-16 rounded"
                  />
                ) : (
                  <img
                    key={idx}
                    src={URL.createObjectURL(img)}
                    alt={`Gallery ${idx + 1}`}
                    className="h-16 rounded"
                  />
                )
              )}
            </div>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-primary text-white px-4 py-2 rounded font-bold"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
      {/* Comment management */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Bình luận</h2>
        {comments.length === 0 ? (
          <div>Chưa có bình luận nào.</div>
        ) : (
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li
                key={comment._id}
                className="border rounded p-2 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {comment.user?.name || "Ẩn danh"}
                  </div>
                  <div className="text-gray-700 text-sm">{comment.content}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  disabled={deletingCommentId === comment._id}
                  className="text-red-500 hover:underline ml-4"
                >
                  {deletingCommentId === comment._id ? "Đang xóa..." : "Xóa"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
