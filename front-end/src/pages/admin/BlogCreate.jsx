import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createBlog,
  getBlogCategories,
  getPopularBlogTags,
} from "../../service/api";

export default function BlogCreate() {
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
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getBlogCategories()
      .then((res) => {
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
  }, []);

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

  // Thêm tag tự do
  const [newTag, setNewTag] = useState("");
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setNewTag("");
    }
  };
  const handleRemoveTag = (tag) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
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
      let allImages = [...images];
      if (featuredImage) {
        allImages = [featuredImage, ...allImages];
      }
      if (allImages.length > 0) {
        allImages.forEach((img) => formData.append("images", img));
      }
      await createBlog(formData);
      navigate("/admin/blogs");
    } catch (err) {
      setError("Không thể tạo blog");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Tạo Blog Mới</h1>
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
        {/* Hiển thị tag đã chọn */}
        <div className="flex flex-wrap gap-2 mb-2">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-200 px-2 py-1 rounded flex items-center"
            >
              {tag}
              <button
                type="button"
                className="ml-1 text-red-500 font-bold"
                onClick={() => handleRemoveTag(tag)}
                title="Xóa tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {/* Input nhập tag tự do */}
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nhập tag mới..."
            className="border rounded px-2 py-1 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(e);
              }
            }}
          />
          <button
            type="button"
            className="bg-brand-primary text-white px-3 py-1 rounded"
            disabled={!newTag.trim()}
            onClick={handleAddTag}
          >
            Thêm
          </button>
        </div>
        {/* Multi-select tag phổ biến */}
        <select
          name="tags"
          multiple
          value={form.tags.length ? form.tags : []}
          onChange={handleTagsChange}
          className="w-full border rounded px-3 py-2"
        >
          {Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tag) => (
              <option key={tag._id || tag} value={tag.name || tag}>
                {tag.name || tag}
              </option>
            ))
          ) : (
            <option value="" disabled>
              Không có tag nào
            </option>
          )}
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
          {featuredImage && (
            <img
              src={URL.createObjectURL(featuredImage)}
              alt="Preview"
              className="mt-2 h-24 rounded"
            />
          )}
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
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`Gallery ${idx + 1}`}
                  className="h-16 rounded"
                />
              ))}
            </div>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-primary text-white px-4 py-2 rounded font-bold"
        >
          {loading ? "Đang tạo..." : "Tạo Blog"}
        </button>
      </form>
    </div>
  );
}
