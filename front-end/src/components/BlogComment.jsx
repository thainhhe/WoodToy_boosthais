import React, { useState } from "react";
import api from "../service/api";

export default function BlogComment({ blogId, onCommentAdded }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post(`/api/blogs/${blogId}/comments`, { content });
      setContent("");
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError("Không thể gửi bình luận");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết bình luận..."
        className="w-full border rounded px-3 py-2 mb-2"
        rows={3}
        required
      />
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="bg-brand-primary text-white px-4 py-2 rounded"
      >
        {loading ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
}
