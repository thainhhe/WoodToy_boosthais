import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getStories,
  deleteStory,
} from "../../service/api";

export default function StoryAdminList() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await getStories({ page });
      setStories(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (e) {
      setError("Không thể tải stories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa story này?")) return;
    try {
      setDeletingId(id);
      await deleteStory(id);
      fetchStories();
    } catch (e) {
      alert("Xóa story thất bại!");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Stories</h1>
        <Link to="/admin/stories/create" className="bg-brand-primary text-white px-4 py-2 rounded font-bold">
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
              <th>Thứ tự</th>
              <th>Ngày đăng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((s) => (
              <tr key={s._id} className="border-b">
                <td className="p-2">
                  <Link to={`/admin/stories/${s._id}/edit`} className="font-bold text-brand-primary hover:underline">
                    {s.title}
                  </Link>
                </td>
                <td>{s.status}</td>
                <td className="text-center">{s.sortOrder ?? 0}</td>
                <td>{s.publishedAt ? new Date(s.publishedAt).toLocaleDateString() : "-"}</td>
                <td>
                  <Link to={`/admin/stories/${s._id}/edit`} className="text-green-600 hover:underline mr-3">
                    Sửa
                  </Link>
                  <button onClick={() => handleDelete(s._id)} disabled={deletingId === s._id} className="text-red-600 hover:underline">
                    {deletingId === s._id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="mt-6 flex justify-center gap-2">
        <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1 border rounded disabled:opacity-50">
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 border rounded disabled:opacity-50">
          Sau
        </button>
      </div>
    </div>
  );
}


