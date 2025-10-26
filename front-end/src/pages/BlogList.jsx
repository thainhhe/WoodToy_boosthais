import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs } from "../service/api";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    getBlogs({ page, search })
      .then((res) => {
        setBlogs(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải blog");
        setLoading(false);
      });
  }, [page, search]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Tìm kiếm blog..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        />
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blogs/${blog._id}`}
              className="block bg-white rounded-xl shadow p-4 hover:shadow-lg transition"
            >
              <img
                src={
                  blog.featuredImage || blog.primaryImage || "/default-blog.jpg"
                }
                alt={blog.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
              <p className="text-gray-700 mb-2">{blog.excerpt}</p>
              <div className="flex gap-2 text-sm text-gray-500">
                <span>{blog.category}</span>
                <span>{blog.readingTime} phút đọc</span>
                <span>{blog.likesCount} lượt thích</span>
                <span>{blog.commentsCount} bình luận</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
