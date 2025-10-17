export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">🧩 WoodToys</h3>
            <p className="text-gray-400">
              Đồ chơi gỗ chất lượng cao cho trẻ em
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Tất cả sản phẩm
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Bộ sưu tập mới
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Khuyến mãi
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white transition">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Chính sách
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Liên hệ</h4>
            <p className="text-gray-400 mb-2">📧 info@woodtoys.com</p>
            <p className="text-gray-400 mb-2">📱 0123 456 789</p>
            <p className="text-gray-400">📍 Hà Nội, Việt Nam</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 WoodToys. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
