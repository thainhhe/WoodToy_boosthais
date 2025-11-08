// front-end/src/components/Products.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "../service/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts();
        const items = res?.data?.data?.products || [];
        setProducts(items);
      } catch (err) {
        console.error("[Products] fetch error:", err);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        <h2 className="text-5xl font-extrabold text-center mb-12 text-brand-secondary drop-shadow-lg tracking-tight">
          {products.length > 0 ? "Danh sách sản phẩm" : "Chưa có sản phẩm nào"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const primaryImage = product.images?.find((img) => img.isPrimary) ||
              product.images?.[0] || {
                url: product.image || "/placeholder.jpg",
              };

            return (
              <article
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-amber-100 cursor-pointer hover:shadow-xl transition"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="h-56 md:h-64 lg:h-72 bg-amber-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={primaryImage.url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-amber-600 font-bold">
                      {product.price?.toLocaleString("vi-VN")}₫
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/${product._id}`);
                      }}
                      className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full"
                    >
                      Xem
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
