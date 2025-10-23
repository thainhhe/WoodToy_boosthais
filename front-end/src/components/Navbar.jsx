import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

// Icon giỏ hàng (giữ nguyên)
const CartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>
);

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: "Trang chủ", to: "/", hash: "" },
    { name: "Về chúng tôi", to: "/", hash: "about" },
    { name: "Sản phẩm", to: "/", hash: "products" },
    { name: "Đội ngũ", to: "/", hash: "team" },
  ];
  
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItemCount = useAuthStore((state) => state.cartItemCount);
  const fetchCartCount = useAuthStore((state) => state.fetchCartCount);

  // Xử lý đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Fetch số lượng giỏ hàng
  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user, fetchCartCount]);

  // Hàm xử lý smooth scroll đến section
  const scrollToSection = (hash, delay = 100) => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    setTimeout(() => {
      const element = document.getElementById(hash);
      if (element) {
        const navbarHeight = 80; // Height của navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, delay);
  };

  // Xử lý click menu item
  const handleMenuClick = (e, item) => {
    e.preventDefault();
    setIsOpen(false); // Đóng mobile menu
    
    if (location.pathname !== item.to) {
      // Nếu không ở trang home, navigate về home trước
      if (item.hash) {
        navigate(`${item.to}#${item.hash}`);
      } else {
        navigate(item.to);
        scrollToSection(""); // Scroll to top
      }
    } else {
      // Nếu đã ở trang home, scroll trực tiếp
      scrollToSection(item.hash);
    }
  };

  // Xử lý scroll khi URL hash thay đổi hoặc navigate
  useEffect(() => {
    if (location.pathname === '/') {
      const hash = location.hash.replace('#', '');
      if (hash) {
        // Delay lớn hơn khi navigate từ trang khác
        scrollToSection(hash, 300);
      }
    }
  }, [location]);

  // Hàm xử lý logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold text-brand-primary">
              WoodToys
            </span>
          </Link>

          {/* Menu chính (Desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.hash ? `${item.to}#${item.hash}` : item.to}
                onClick={(e) => handleMenuClick(e, item)}
                className="font-medium text-brand-text hover:text-brand-secondary transition duration-300 cursor-pointer"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Phần bên phải Navbar (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Nút Khám Phá */}
            <button 
              onClick={(e) => handleMenuClick(e, { to: "/", hash: "products" })}
              className="bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Khám Phá
            </button>

            {/* Link Giỏ hàng */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-brand-secondary"
            >
              <CartIcon />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Dropdown hoặc Login/Register */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="font-bold text-brand-secondary px-4 py-2 hover:underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="font-bold text-brand-secondary px-4 py-2 hover:underline"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              // User Dropdown Menu
              <div className="relative" ref={userMenuRef}>
                {" "}
                {/* Thêm ref */}
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition duration-150"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover" // Thêm object-cover
                    />
                  ) : (
                    // Placeholder avatar
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200">
                      <span className="text-sm font-medium leading-none text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </span>
                  )}
                  {/* Tên user (ẩn trên màn hình nhỏ hơn lg) */}
                  <span className="font-medium text-sm text-gray-700 hidden lg:block">
                    {user.name}
                  </span>
                  {/* Icon mũi tên */}
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {/* Nội dung Dropdown */}
                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <Link
                      to="/profile" // Cần tạo trang Profile sau
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      My Order
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút menu mobile */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
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

        {/* Menu mobile */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {/* Các link menu mobile */}
            {menuItems.map((item) => (
              <a
                key={item.name}
                href={item.hash ? `${item.to}#${item.hash}` : item.to}
                onClick={(e) => handleMenuClick(e, item)}
                className="block py-2 px-4 text-sm text-brand-text hover:bg-brand-light rounded cursor-pointer"
              >
                {item.name}
              </a>
            ))}

            {/* Link giỏ hàng mobile */}
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="relative flex justify-between items-center py-2 px-4 text-sm text-brand-text hover:bg-brand-light rounded"
            >
              <span>Giỏ hàng</span>
              {cartItemCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* Nút khám phá mobile */}
            <button 
              onClick={(e) => handleMenuClick(e, { to: "/", hash: "products" })}
              className="w-full mt-2 bg-brand-secondary text-white font-bold py-2 px-6 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Khám Phá
            </button>

            {/* User actions / Login/Register cho Mobile */}
            {!user ? (
              <div className="border-t pt-4 mt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center font-bold text-brand-secondary py-2 hover:underline"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center font-bold text-brand-secondary py-2 hover:underline"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex items-center px-4 mb-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-200">
                      <span className="text-sm font-medium leading-none text-gray-600">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </span>
                  )}
                  <span className="font-medium text-brand-primary">
                    {user.name}
                  </span>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  My Order
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded focus:outline-none"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
