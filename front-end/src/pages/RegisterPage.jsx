import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../service/api";
import useAuthStore from "../store/authStore";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await register(name, email, password);
      const { user, accessToken, refreshToken } = res.data.data; // Lấy cả token

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user); // ✅ Lưu user vào store

      // Kiểm tra role và điều hướng
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setError(err.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <div className="mb-4">
          <label className="block mb-2 font-medium">Tên</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-medium">Mật khẩu</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded font-bold hover:bg-amber-800 transition mb-2"
        >
          Đăng ký
        </button>
        {/* Đã bỏ nút đăng ký bằng Google */}
        <div className="mt-4 text-center">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-amber-700 font-bold">
            Đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
