import React, { useState } from "react";
import api from "../service/api";

export default function BlogLike({ blogId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/blogs/${blogId}/like`);
      setLiked(res.data.data.liked);
      setCount(res.data.data.likesCount);
    } catch (err) {
      // Xử lý lỗi nếu cần
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`px-4 py-2 rounded font-bold ${
        liked ? "bg-rose-500 text-white" : "bg-gray-200 text-gray-700"
      }`}
    >
      {liked ? "Đã thích" : "Thích"} ({count})
    </button>
  );
}
