import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBlogById } from "../service/api";

export default function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getBlogById(id)
      .then((res) => {
        setBlog(res.data.data.blog);
        setLoading(false);
      })
      .catch((err) => {
        setError("Không tìm thấy bài viết");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="py-10 text-center">Đang tải...</div>;
  if (error)
    return <div className="py-10 text-center text-red-500">{error}</div>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      <div className="mb-4 text-gray-500 flex gap-4">
        <span>{blog.category}</span>
        <span>{blog.readingTime} phút đọc</span>
        <span>
          {blog.publishedAt && new Date(blog.publishedAt).toLocaleDateString()}
        </span>
      </div>
      <img
        src={blog.featuredImage || blog.primaryImage || "/default-blog.jpg"}
        alt={blog.title}
        className="w-full h-64 object-cover rounded mb-6"
      />
      <div
        className="prose max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
      <div className="flex gap-4 text-sm text-gray-600 mb-6">
        <span>{blog.likesCount} lượt thích</span>
        <span>{blog.commentsCount} bình luận</span>
      </div>
      {/* TODO: Like/Unlike, Comment, Tag, Author, Related Blogs */}
    </div>
  );
}
