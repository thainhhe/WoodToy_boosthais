"use client";

import { useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Bộ lắp ghép nhà gỗ",
      price: "299.000đ",
      image: "/wooden-house-puzzle.jpg",
      category: "Nhà",
    },
    {
      id: 2,
      name: "Bộ lắp ghép động vật",
      price: "199.000đ",
      image: "/wooden-animal-puzzle.jpg",
      category: "Động vật",
    },
    {
      id: 3,
      name: "Bộ lắp ghép phương tiện",
      price: "249.000đ",
      image: "/wooden-vehicle-puzzle.jpg",
      category: "Phương tiện",
    },
    {
      id: 4,
      name: "Bộ lắp ghép hình học",
      price: "149.000đ",
      image: "/wooden-geometric-puzzle.jpg",
      category: "Hình học",
    },
  ]);

  return (
    <section id="products" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Sản phẩm nổi bật
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
            >
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-amber-700 font-semibold">
                  {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-900 mt-2">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-amber-700">
                    {product.price}
                  </span>
                  <button className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition">
                    Thêm
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
