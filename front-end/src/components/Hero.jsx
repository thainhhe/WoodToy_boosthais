export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/wooden-toys-background.jpg"
          alt="Wooden toys background"
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h2
          className="text-2xl md:text-4xl font-bold tracking-widest uppercase animate-fade-in-up animate-float bg-gradient-to-r from-amber-400 via-amber-700 to-amber-400 text-transparent bg-clip-text drop-shadow-lg hover:drop-shadow-glow active:drop-shadow-glow font-sans"
          style={{ animationDelay: "0.2s" }}
        >
          CHƠI ĐỂ LỚN KHÔN
        </h2>
        <h1
          className="text-7xl md:text-9xl font-extrabold mt-4 tracking-widest uppercase animate-fade-in-up animate-float bg-gradient-to-r from-amber-700 via-amber-400 to-amber-700 text-transparent bg-clip-text drop-shadow-2xl hover:drop-shadow-glow active:drop-shadow-glow font-sans"
          style={{ animationDelay: "0.5s" }}
        >
          WOODTOYS
        </h1>
        <p
          className="mt-6 text-xl md:text-2xl max-w-2xl mx-auto text-transparent bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text animate-fade-in-up animate-float drop-shadow-lg hover:drop-shadow-glow active:drop-shadow-glow font-sans"
          style={{ animationDelay: "0.8s" }}
        >
          Khơi nguồn sáng tạo từ những mảnh gỗ tự nhiên.
        </p>
      </div>
    </section>
  );
}
