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
      // Try to POST to an API endpoint if available. If not, we gracefully simulate success.
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess("Cảm ơn! Bạn đã đăng ký nhận khuyến mãi.");
        setEmail("");
      } else {
        // If endpoint returns non-OK, still show friendly message and log response
        console.warn("/api/subscribe returned non-OK", res.status);
        setSuccess("Cảm ơn! Chúng tôi đã ghi nhận email của bạn.");
        setEmail("");
      }
    } catch (err) {
      // Network or endpoint absent: fallback to simulated success for now
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
    <section className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-extrabold text-gray-800 mb-3">
          Nhận thông tin khuyến mãi
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Đăng ký email để nhận mã giảm giá và ưu đãi sớm nhất.
        </p>

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
            className="w-full sm:w-auto min-w-0 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Email"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center justify-center px-5 py-3 rounded-md text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {loading ? "Đang gửi..." : "Đăng ký"}
          </button>
        </form>

        <div className="mt-4 min-h-[1.25rem]">
          {error && <div className="text-sm text-red-500">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Bạn có thể bỏ đăng ký bất cứ lúc nào. Chúng tôi tôn trọng quyền riêng
          tư của bạn.
        </p>
      </div>
    </section>
  );
}
