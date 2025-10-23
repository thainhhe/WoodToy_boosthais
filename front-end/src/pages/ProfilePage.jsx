import { useState, useEffect } from "react";
import useAuthStore from "../store/authStore";
import { getUserProfile, updateUserProfile } from "../service/api";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await getUserProfile();
        setProfile(res.data.data.user);
        setForm({
          name: res.data.data.user.name,
          email: res.data.data.user.email,
        });
      } catch (err) {
        setMessage("Không thể tải thông tin người dùng.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await updateUserProfile(form);
      setMessage("Cập nhật thành công!");
      setEditMode(false);
      setProfile({ ...profile, ...form });
    } catch (err) {
      setMessage("Cập nhật thất bại!");
    }
  };

  if (loading) return <div className="py-20 text-center">Đang tải...</div>;
  if (!profile)
    return (
      <div className="py-20 text-center text-red-500">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  return (
    <div className="max-w-xl mx-auto py-10 px-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>
      {message && <div className="mb-4 text-sm text-green-600">{message}</div>}
      {!editMode ? (
        <>
          <div className="mb-4">
            <span className="font-medium">Tên:</span> {profile.name}
          </div>
          <div className="mb-4">
            <span className="font-medium">Email:</span> {profile.email}
          </div>
          <button
            className="bg-amber-600 text-white px-4 py-2 rounded"
            onClick={() => setEditMode(true)}
          >
            Chỉnh sửa
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Tên</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border rounded"
              required
            />
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
              onClick={() => setEditMode(false)}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-amber-600 text-white px-4 py-2 rounded font-bold hover:bg-amber-700"
            >
              Lưu
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
