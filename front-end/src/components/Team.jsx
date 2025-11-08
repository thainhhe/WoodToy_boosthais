import { useState, useEffect, useRef } from "react";

const feedbacks = [
  {
    name: "Nguyễn Văn Thái",
    role: "Bố của bé Minh",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=NA",
    text: "Sản phẩm gỗ rất an toàn và đẹp — bé chơi cả ngày mà không chán. Chất lượng vượt mong đợi!",
  },
  {
    name: "Trần Thị Thùy Dung",
    role: "Mẹ của bé An",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=TB",
    text: "Giao hàng nhanh, đóng gói cẩn thận. Các chi tiết rất tinh xảo, hợp với phát triển kỹ năng cho trẻ.",
  },
  {
    name: "Lê Minh Cường",
    role: "Giáo viên mầm non",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=LC",
    text: "Đồ chơi có tính giáo dục cao, kích thích tư duy và sáng tạo. Tôi giới thiệu cho phụ huynh trong lớp.",
  },
  {
    name: "Phạm Thị Diệu",
    role: "Khách hàng",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=PD",
    text: "Mua làm quà tặng và ai cũng khen. Sản phẩm đẹp, dễ sử dụng và bền.",
  },
  {
    name: "Hoàng Văn Huy",
    role: "Bố của bé Linh",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=HV",
    text: "Tính năng an toàn rõ ràng, vật liệu tự nhiên. Giá cả hợp lý so với chất lượng.",
  },
  {
    name: "Đặng Huyền Trang",
    role: "Mẹ",
    avatar: "https://placehold.co/80x80/FFF8F2/4F4F4F?text=DH",
    text: "Dịch vụ khách hàng nhiệt tình, tôi rất hài lòng với trải nghiệm mua hàng.",
  },
];

export default function Team() {
  const [current, setCurrent] = useState(0);
  const total = feedbacks.length;
  const intervalRef = useRef(null);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [current]);

  const startAutoplay = () => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 4000);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const prev = () => setCurrent((p) => (p - 1 + total) % total);
  const next = () => setCurrent((p) => (p + 1) % total);

  const getVisible = () => {
    // show center + one on each side for nicer carousel feel
    return [(current - 1 + total) % total, current, (current + 1) % total];
  };

  const visible = getVisible();

  return (
    <section
      id="team"
      className="py-16 bg-gradient-to-tr from-amber-50 via-white to-brand-light"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-brand-primary mb-8">
          Phản hồi khách hàng
        </h2>

        <div className="relative">
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
          >
            ◀
          </button>

          <div
            onMouseEnter={stopAutoplay}
            onMouseLeave={startAutoplay}
            className="w-full flex items-center justify-center gap-6 overflow-hidden py-6"
          >
            {visible.map((idx, i) => {
              const fb = feedbacks[idx];
              const isCenter = idx === current;
              return (
                <div
                  key={fb.name}
                  className={`transition-all duration-700 ease-in-out rounded-2xl p-6 shadow-lg max-w-md ${
                    isCenter
                      ? "scale-100 opacity-100 z-10 bg-amber-50 ring-1 ring-amber-100"
                      : "scale-90 opacity-80 z-0 bg-white"
                  }`}
                  style={{ minWidth: isCenter ? 420 : 320 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={fb.avatar}
                      alt={fb.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="text-left">
                      <div className="font-bold text-sm text-brand-primary">
                        {fb.name}
                      </div>
                      <div className="text-xs text-gray-500">{fb.role}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 text-base leading-relaxed">
                    “{fb.text}”
                  </p>
                </div>
              );
            })}
          </div>

          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
          >
            ▶
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {feedbacks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full ${
                idx === current ? "bg-amber-600" : "bg-gray-300"
              }`}
              aria-label={`Go to feedback ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
