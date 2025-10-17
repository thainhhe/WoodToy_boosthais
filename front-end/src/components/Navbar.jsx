"use client";

import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-amber-700">
              🧩 WoodToys
            </span>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-amber-700 transition"
            >
              Trang chủ
            </Link>
            <a
              href="#products"
              className="text-gray-700 hover:text-amber-700 transition"
            >
              Sản phẩm
            </a>
            <a
              href="#about"
              className="text-gray-700 hover:text-amber-700 transition"
            >
              Về chúng tôi
            </a>
            <a
              href="#contact"
              className="text-gray-700 hover:text-amber-700 transition"
            >
              Liên hệ
            </a>
          </div>

          <div className="hidden md:flex space-x-4">
            <button className="px-4 py-2 text-amber-700 border border-amber-700 rounded hover:bg-amber-50 transition">
              Đăng nhập
            </button>
            <button className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 transition">
              Giỏ hàng
            </button>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block text-gray-700 hover:text-amber-700">
              Trang chủ
            </Link>
            <a
              href="#products"
              className="block text-gray-700 hover:text-amber-700"
            >
              Sản phẩm
            </a>
            <a
              href="#about"
              className="block text-gray-700 hover:text-amber-700"
            >
              Về chúng tôi
            </a>
            <a
              href="#contact"
              className="block text-gray-700 hover:text-amber-700"
            >
              Liên hệ
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
