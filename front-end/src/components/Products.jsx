// front-end/src/components/Products.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../service/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        setProducts(res.data.data.products.slice(0, 10));
      } catch (err) {
        setError("Không thể tải danh sách sản phẩm.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const total = products.length;

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  const handleCardClick = (idx, productId) => {
    if (idx === current) {
      navigate(`/products/${productId}`);
    } else {
      goTo(idx);
    }
  };

  const getVisibleProducts = () => {
    if (total === 0) return [];
    const arr = [];
    for (let i = -2; i <= 2; i++) {
      arr.push((current + i + total) % total);
    }
    return arr;
  };
  const visible = getVisibleProducts();

  if (loading) {
    return (
      <section id="products" className="py-20 bg-[#FFF8F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-secondary">
            Đang tải sản phẩm...
          </h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="products" className="py-20 bg-[#FFF8F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-red-500">{error}</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-[#FFF8F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center mb-16 text-brand-secondary drop-shadow-lg tracking-tight">
          {total > 0 ? `${total} Câu chuyện sản phẩm` : "Chưa có sản phẩm nào"}
        </h2>
        {total > 0 && (
          <>
            <div className="relative flex items-center justify-center">
              <button
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-amber-100 hover:bg-amber-300 text-brand-secondary rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
                aria-label="Trước"
              >
                <span className="text-3xl font-bold">&#8592;</span>
              </button>

              <div className="w-full flex justify-center gap-4 md:gap-8 lg:gap-12 overflow-x-hidden relative h-[420px]">
                {visible.map((idx, i) => {
                  const product = products[idx];
                  if (!product) return null;
                  const isActive = idx === current;
                  const pos = i - 2;

                  const primaryImage = product.images?.find(
                    (img) => img.isPrimary
                  ) ||
                    product.images?.[0] || {
                      url: product.image || "/placeholder.jpg",
                    };

                  return (
                    <div
                      // **SỬA LỖI: Key đã được làm duy nhất**
                      key={`${product._id}-${i}`}
                      className={`absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out flex flex-col items-center rounded-2xl border-2 shadow-xl group ${
                        isActive
                          ? "bg-white border-amber-400 scale-110 z-20 opacity-100"
                          : "bg-white border-amber-100 opacity-40 scale-95 z-10"
                      } p-4 md:p-6 lg:p-8 max-w-xs w-full cursor-pointer`}
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
                      onClick={() => handleCardClick(idx, product._id)}
                    >
                      <div
                        className={`text-brand-secondary font-extrabold mb-2 drop-shadow-lg transition-all ${
                          isActive
                            ? "text-5xl md:text-6xl"
                            : "text-3xl md:text-4xl"
                        }`}
                      >
                        {String(idx + 1).padStart(2, "0")}
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
                            src={primaryImage.url}
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
                        {product.story || product.description}
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

              <button
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-amber-100 hover:bg-amber-300 text-brand-secondary rounded-full w-12 h-12 flex items-center justify-center shadow-lg z-10"
                aria-label="Sau"
              >
                <span className="text-3xl font-bold">&#8594;</span>
              </button>
            </div>

            <div className="flex justify-center mt-8 gap-3">
              {products.map((_, idx) => (
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
          </>
        )}
      </div>
    </section>
  );
}
