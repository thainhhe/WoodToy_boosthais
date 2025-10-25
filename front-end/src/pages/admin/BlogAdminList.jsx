import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBlogs,
  deleteBlog,
  getBlogById,
  deleteCommentFromBlog,
} from "../../service/api";

export default function BlogAdminList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [modalComments, setModalComments] = useState([]);
  const [modalBlogId, setModalBlogId] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  const fetchBlogs = () => {
    setLoading(true);
    getBlogs({ page, status: "all" })
      .then((res) => {
        setBlogs(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không thể tải blog");
        setLoading(false);
      });
  };

  const handleShowComments = async (blogId) => {
    setModalBlogId(blogId);
    setShowCommentsModal(true);
    try {
      const res = await getBlogById(blogId);
      setModalComments(res.data.data.blog.comments || []);
    } catch {
      setModalComments([]);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    setDeletingCommentId(commentId);
    try {
      await deleteCommentFromBlog(modalBlogId, commentId);
      setModalComments(modalComments.filter((c) => c._id !== commentId));
      fetchBlogs();
    } catch {
      alert("Xóa bình luận thất bại!");
    }
    setDeletingCommentId(null);
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa blog này?")) return;
    setDeletingId(id);
    try {
      await deleteBlog(id);
      fetchBlogs();
    } catch (err) {
      alert("Xóa blog thất bại!");
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Blog</h1>
        <Link
          to="/admin/blogs/create"
          className="bg-brand-primary text-white px-4 py-2 rounded font-bold"
        >
          Tạo mới
        </Link>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="w-full border rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Ngày đăng</th>
              <th>Lượt thích</th>
              <th>Bình luận</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr key={blog._id} className="border-b">
                <td className="p-2">
                  <Link
                    to={`/admin/blogs/${blog._id}/edit`}
                    className="font-bold text-brand-primary hover:underline"
                  >
                    {blog.title}
                  </Link>
                </td>
                <td>{blog.status}</td>
                <td>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleDateString()
                    : "-"}
                </td>
                <td>{blog.likesCount}</td>
                <td>
                  <button
                    className="text-blue-500 underline"
                    onClick={() => handleShowComments(blog._id)}
                  >
                    {blog.commentsCount}
                  </button>
                </td>
                <td>
                  <Link
                    to={`/blogs/${blog.slug || blog._id}`}
                    className="text-blue-500 hover:underline mr-2"
                  >
                    Xem
                  </Link>
                  <Link
                    to={`/admin/blogs/${blog._id}/edit`}
                    className="text-green-500 hover:underline mr-2"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    disabled={deletingId === blog._id}
                    className="text-red-500 hover:underline mr-2"
                  >
                    {deletingId === blog._id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Comments Modal */}
      {showCommentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 text-xl"
              onClick={() => setShowCommentsModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Bình luận</h2>
            {modalComments.length === 0 ? (
              <div>Chưa có bình luận nào.</div>
            ) : (
              <ul className="space-y-2">
                {modalComments.map((comment) => (
                  <li
                    key={comment._id}
                    className="border rounded p-2 flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">
                        {comment.user?.name || "Ẩn danh"}
                      </div>
                      <div className="text-gray-700 text-sm">
                        {comment.content}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deletingCommentId === comment._id}
                      className="text-red-500 hover:underline ml-4"
                    >
                      {deletingCommentId === comment._id
                        ? "Đang xóa..."
                        : "Xóa"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
