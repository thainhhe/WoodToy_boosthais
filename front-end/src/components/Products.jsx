"use client";

import { useState } from "react";

const productStories = [
  {
    id: 1,
    name: "Bộ lắp ghép nhà gỗ",
    image: "/wooden-house-puzzle.jpg",
    story:
      "Khám phá cách xây dựng ngôi nhà mơ ước từ những mảnh gỗ tự nhiên, phát triển tư duy không gian và sự sáng tạo cho trẻ.",
  },
  {
    id: 2,
    name: "Bộ lắp ghép động vật",
    image: "/wooden-animal-puzzle.jpg",
    story:
      "Những chú thú gỗ sinh động giúp trẻ nhận biết thế giới động vật, rèn luyện khả năng quan sát và trí tưởng tượng.",
  },
  {
    id: 3,
    name: "Bộ lắp ghép phương tiện",
    image: "/wooden-vehicle-puzzle.jpg",
    story:
      "Tìm hiểu về các loại phương tiện giao thông qua trò chơi lắp ghép, kích thích sự tò mò và khám phá khoa học.",
  },
  {
    id: 4,
    name: "Bộ lắp ghép hình học",
    image: "/wooden-geometric-puzzle.jpg",
    story:
      "Các khối hình học đa dạng giúp trẻ nhận biết màu sắc, hình dạng và phát triển tư duy logic ngay từ nhỏ.",
  },
  {
    id: 5,
    name: "Bộ xếp hình ngôi sao",
    image: "/wooden-house-puzzle.jpg",
    story:
      "Lắp ghép ngôi sao lung linh, rèn luyện sự khéo léo và khả năng phối hợp tay mắt cho bé.",
  },
  {
    id: 6,
    name: "Bộ xếp hình xe lửa",
    image: "/wooden-vehicle-puzzle.jpg",
    story:
      "Tạo nên đoàn tàu gỗ vui nhộn, giúp trẻ hiểu về chuyển động và kỹ năng lắp ráp cơ bản.",
  },
  {
    id: 7,
    name: "Bộ xếp hình ngôi nhà cổ",
    image: "/wooden-house-puzzle.jpg",
    story:
      "Khám phá kiến trúc truyền thống qua bộ lắp ghép nhà cổ, nuôi dưỡng tình yêu văn hóa dân tộc.",
  },
  {
    id: 8,
    name: "Bộ xếp hình động vật biển",
    image: "/wooden-animal-puzzle.jpg",
    story:
      "Những sinh vật biển đáng yêu giúp trẻ mở rộng hiểu biết về đại dương và bảo vệ môi trường.",
  },
  {
    id: 9,
    name: "Bộ xếp hình xe cứu hỏa",
    image: "/wooden-vehicle-puzzle.jpg",
    story:
      "Trở thành người hùng nhí với xe cứu hỏa gỗ, học cách bảo vệ cộng đồng và kỹ năng xử lý tình huống.",
  },
  {
    id: 10,
    name: "Bộ xếp hình khối sáng tạo",
    image: "/wooden-geometric-puzzle.jpg",
    story:
      "Tự do sáng tạo với các khối gỗ đa dạng, phát triển trí tưởng tượng và khả năng giải quyết vấn đề.",
  },
];

export default function Products() {
  const [current, setCurrent] = useState(0);
  const total = productStories.length;

  const goTo = (idx) => {
    setCurrent(idx);
  };
  const prev = () => {
    setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  };
  const next = () => {
    setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  // Hiển thị 5 sản phẩm, sản phẩm được chọn ở giữa nổi bật, có hiệu ứng slide ngang
  const getVisibleProducts = () => {
    const arr = [];
    for (let i = -2; i <= 2; i++) {
      arr.push((current + i + total) % total);
    }
    return arr;
  };
  const visible = getVisibleProducts();

  return (
    <section id="products" className="py-20 bg-[#FFF8F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center mb-16 text-brand-secondary drop-shadow-lg tracking-tight">
          10 Câu chuyện sản phẩm
        </h2>
        <div className="relative flex items-center justify-center">
          {/* Nút trái */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-amber-100 hover:bg-amber-300 text-brand-secondary rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
            aria-label="Trước"
          >
            <span className="text-3xl font-bold">&#8592;</span>
          </button>

          {/* Dãy sản phẩm dạng slide với hiệu ứng chuyển động ngang */}
          <div className="w-full flex justify-center gap-4 md:gap-8 lg:gap-12 overflow-x-hidden relative h-[420px]">
            {visible.map((idx, i) => {
              const product = productStories[idx];
              const isActive = idx === current;
              // Vị trí so với sản phẩm đang chọn: -2, -1, 0, 1, 2
              const pos = i - 2;
              return (
                <div
                  key={product.id}
                  className={`absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out flex flex-col items-center rounded-2xl border-2 shadow-xl group
                    ${
                      isActive
                        ? "bg-white border-amber-400 scale-110 z-20 opacity-100"
                        : "bg-white border-amber-100 opacity-40 scale-95 z-10"
                    }
                    p-4 md:p-6 lg:p-8 max-w-xs w-full cursor-pointer`}
                  style={{
                    minHeight: 380,
                    boxShadow: isActive
                      ? "0 8px 32px 0 rgba(244,106,94,0.15)"
                      : undefined,
                    transform: `translate(-50%, -50%) translateX(${
                      pos * 260
                    }px) scale(${isActive ? 1.1 : 0.95})`,
                    transition:
                      "transform 0.7s cubic-bezier(.4,0,.2,1), opacity 0.7s cubic-bezier(.4,0,.2,1)",
                  }}
                  onClick={() => goTo(idx)}
                >
                  <div
                    className={`text-brand-secondary font-extrabold mb-2 drop-shadow-lg transition-all ${
                      isActive ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl"
                    }`}
                  >
                    {String(product.id).padStart(2, "0")}
                  </div>
                  <div className="w-full flex justify-center mb-4">
                    <div
                      className={`border-4 rounded-xl overflow-hidden flex items-center justify-center bg-[#FFF8F2] transition-all ${
                        isActive
                          ? "border-brand-secondary w-40 h-40"
                          : "border-amber-200 w-28 h-28"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`object-contain ${
                          isActive ? "w-36 h-36" : "w-20 h-20"
                        }`}
                      />
                    </div>
                  </div>
                  <div
                    className={`font-bold text-center mb-2 transition-all ${
                      isActive
                        ? "text-lg md:text-xl text-brand-primary"
                        : "text-base text-gray-500"
                    }`}
                  >
                    {product.name}
                  </div>
                  <div
                    className={`text-center leading-relaxed transition-all ${
                      isActive
                        ? "text-brand-text text-base"
                        : "text-gray-400 text-sm line-clamp-3"
                    }`}
                  >
                    {product.story}
                  </div>
                  {isActive && (
                    <div
                      className="absolute inset-0 ring-2 ring-brand-secondary rounded-2xl pointer-events-none animate-pulse"
                      style={{ zIndex: 1 }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Nút phải */}
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-amber-100 hover:bg-amber-300 text-brand-secondary rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
            aria-label="Sau"
          >
            <span className="text-3xl font-bold">&#8594;</span>
          </button>
        </div>
        {/* Chấm tròn điều hướng */}
        <div className="flex justify-center mt-8 gap-3">
          {productStories.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`w-4 h-4 rounded-full border-2 border-brand-secondary transition-all ${
                idx === current ? "bg-brand-secondary" : "bg-white"
              }`}
              aria-label={`Chuyển đến sản phẩm ${idx + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
