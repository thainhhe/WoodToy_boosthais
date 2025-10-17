export default function Hero() {
  return (
    <section className="relative h-screen bg-gradient-to-r from-amber-900 to-amber-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="/wooden-toys-background.jpg"
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Khám phá thế giới đồ chơi gỗ
            </h1>
            <p className="text-xl text-amber-100">
              Những bộ lắp ghép gỗ tự nhiên, an toàn cho trẻ em. Phát triển sáng
              tạo và trí tưởng tượng.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-white text-amber-700 font-bold rounded-lg hover:bg-amber-50 transition">
                Khám phá ngay
              </button>
              <button className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-amber-700 transition">
                Xem video
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <img
              src="/wooden-puzzle-toys-collection.jpg"
              alt="Wooden toys"
              className="w-full rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
