import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, googleAuth } from "../service/api";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      const { user, accessToken, refreshToken } = res.data.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      setUser(user); // Lưu thông tin user vào store

      // **MỚI: Kiểm tra role và điều hướng tương ứng**
      if (user.role === "admin") {
        navigate("/admin"); // Chuyển đến trang dashboard của admin
      } else {
        navigate("/"); // Chuyển đến trang chủ cho user thông thường
      }
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  // Google Identity Services SDK
  const googleBtn = useRef(null);

  useEffect(() => {
    // Load Google script
    if (!window.google && !document.getElementById("google-oauth")) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.id = "google-oauth";
      document.body.appendChild(script);
      script.onload = renderGoogleBtn;
    } else {
      renderGoogleBtn();
    }
    // eslint-disable-next-line
  }, []);

  function renderGoogleBtn() {
    if (window.google && googleBtn.current) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: "outline",
        size: "large",
        width: "100%",
        text: "signin_with",
        shape: "rectangular",
      });
    }
  }

  async function handleGoogleResponse(response) {
    setError("");
    try {
      const res = await googleAuth(response.credential);
      const { user, accessToken, refreshToken } = res.data.data;

      // Lưu token trước
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      
      // Lưu user vào store (setUser sẽ tự động lưu vào localStorage)
      setUser(user);

      console.log("Google Auth Success - User:", user);
      console.log("Google Auth Success - Token saved:", accessToken);

      // Đợi một chút để đảm bảo state được cập nhật
      setTimeout(() => {
        // Kiểm tra role và điều hướng
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }, 100);
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setError(err.response?.data?.message || "Đăng nhập bằng Google thất bại");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
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
          Đăng nhập
        </button>
        <div ref={googleBtn} className="w-full flex justify-center mb-2"></div>
        <div className="mt-4 text-center">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-amber-700 font-bold">
            Đăng ký
          </Link>
        </div>
      </form>
    </div>
  );
}
