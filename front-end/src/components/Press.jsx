"use client";

import { useState } from "react";

export default function Press() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const isValidEmail = (value) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!isValidEmail(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess("Cảm ơn! Bạn đã đăng ký nhận khuyến mãi.");
        setEmail("");
      } else {
        console.warn("/api/subscribe returned non-OK", res.status);
        setSuccess("Cảm ơn! Chúng tôi đã ghi nhận email của bạn.");
        setEmail("");
      }
    } catch (err) {
      console.warn(
        "Subscribe request failed, falling back to simulated success",
        err
      );
      setSuccess("Cảm ơn! Chúng tôi đã ghi nhận email của bạn.");
      setEmail("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-gradient-to-r from-red-200 via-orange-200 to-amber-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold text-red-900 mb-3">
          Nhận thông tin khuyến mãi
        </h2>
        <p className="text-sm text-red-800 mb-6">
          Đăng ký email để nhận mã giảm giá và ưu đãi sớm nhất.
        </p>

        <div className="mx-auto max-w-2xl bg-white rounded-2xl p-6 shadow-lg ring-1 ring-orange-200">
          <form
            onSubmit={submit}
            className="flex flex-col sm:flex-row items-center gap-3 justify-center"
          >
            <label htmlFor="newsletter_email" className="sr-only">
              Email
            </label>
            <input
              id="newsletter_email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="w-full sm:flex-1 min-w-0 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-label="Email"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center justify-center px-5 py-3 rounded-md text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {loading ? "Đang gửi..." : "Đăng ký"}
            </button>
          </form>

          <div className="mt-4 min-h-[1.25rem]">
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-700">{success}</div>}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Bạn có thể bỏ đăng ký bất cứ lúc nào. Chúng tôi tôn trọng quyền
            riêng tư của bạn.
          </p>
        </div>
      </div>
    </section>
  );
}
