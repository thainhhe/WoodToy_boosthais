export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h3 className="text-3xl font-bold mb-4">VietMyth Luminarts</h3>
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
            <h4 className="font-bold mb-4 text-lg">Thông tin liên hệ</h4>
            <ul className="space-y-2 text-gray-300 text-base">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📧</span>
                <span>
                  Email:{" "}
                  <a
                    href="mailto:contact@vietmythluminarts@gmail.com"
                    className="hover:text-white underline transition"
                  >
                    contact@vietmythluminarts@gmail.com
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">📞</span>
                <span>
                  Hotline:{" "}
                  <a
                    href="tel:0936618365"
                    className="hover:text-white underline transition"
                  >
                    0936618365
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">🏠</span>
                <span>
                  Địa chỉ: 629 Nguyễn Khoái, phường Thanh Trì, quận Hoàng Mai,
                  Hà Nội, Việt Nam
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2025 VietMyth Luminarts. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
