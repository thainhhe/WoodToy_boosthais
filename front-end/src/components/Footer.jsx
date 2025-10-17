export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h3 className="text-3xl font-bold mb-4">WoodToys</h3>
            <p className="text-gray-300 max-w-xs">
              Đồ chơi gỗ chất lượng cao, khơi nguồn sáng tạo và đồng hành cùng
              sự phát triển của trẻ.
            </p>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold mb-4 text-lg">Khám phá</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#about" className="hover:text-white transition">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-white transition">
                  Sản phẩm
                </a>
              </li>
              <li>
                <a href="#team" className="hover:text-white transition">
                  Đội ngũ
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold mb-4 text-lg">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="#" className="hover:text-white transition">
                  FAQs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  Chính sách
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-bold mb-4 text-lg">Đăng ký nhận tin</h4>
            <p className="text-gray-300 mb-4">
              Nhận thông tin về sản phẩm mới và các chương trình khuyến mãi đặc
              biệt!
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Email của bạn"
                className="w-full px-4 py-2 rounded-l-md text-gray-800 focus:outline-none"
              />
              <button className="bg-brand-secondary text-white font-bold px-4 py-2 rounded-r-md hover:bg-opacity-90 transition">
                Đăng ký
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 WoodToys. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
