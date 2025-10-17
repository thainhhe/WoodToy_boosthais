export default function Hero() {
  return (
    <section className="bg-brand-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-extrabold text-brand-primary leading-tight">
              Nơi Sáng Tạo Bắt Nguồn Từ Gỗ
            </h1>
            <p className="mt-6 text-lg text-brand-text max-w-lg mx-auto md:mx-0">
              Khám phá bộ sưu tập đồ chơi gỗ an toàn, giúp bé phát triển tư duy
              và kỹ năng qua từng giờ chơi vui vẻ.
            </p>
            <div className="mt-8 flex justify-center md:justify-start gap-4">
              <button className="px-8 py-3 bg-brand-secondary text-white font-bold rounded-full hover:bg-opacity-90 transition duration-300 shadow-lg">
                Mua Ngay
              </button>
              <button className="px-8 py-3 bg-white text-brand-primary font-bold rounded-full hover:bg-gray-100 transition duration-300 shadow-lg">
                Xem Video
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-br from-pink-300 via-purple-300 to-blue-300 rounded-full blur-2xl opacity-50"></div>
            <img
              src="/wooden-puzzle-toys-collection.jpg"
              alt="Bộ sưu tập đồ chơi gỗ"
              className="relative w-full rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
