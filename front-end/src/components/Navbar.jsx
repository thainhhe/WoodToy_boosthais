import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Về chúng tôi", href: "#about" },
    { name: "Sản phẩm", href: "#products" },
    { name: "Đội ngũ", href: "#team" },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold text-brand-primary">
              WoodToys
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="font-medium text-brand-text hover:text-brand-secondary transition duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center">
            <button className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition duration-300">
              Khám Phá
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
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 px-4 text-sm text-brand-text hover:bg-brand-light rounded"
              >
                {item.name}
              </a>
            ))}
            <button className="w-full mt-2 bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition duration-300">
              Khám Phá
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
