export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: "#4B0F0F",
        marginTop: "-80px",
        paddingTop: "80px",
        // Increase height so the background image stretches longer vertically
        minHeight: "130vh",
      }}
    >
      <img
        src="/3.png"
        alt="Background"
        className="absolute inset-0 z-0 w-full h-full object-cover"
        style={{ objectPosition: "50% 28%" }}
      />
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <img
          src="/ani2.png"
          alt="Trống đồng Đông Sơn"
          className="w-full h-full max-w-4xl max-h-[90vh] object-contain animate-spin-slow opacity-60"
          style={{
            mixBlendMode: "multiply",
            filter: "contrast(1.1) brightness(0.95)",
          }}
        />
      </div>

      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-auto max-w-2xl flex items-center justify-center">
          <img
            src="/logo.png"
            alt="WOODTOYS Logo Text"
            className="w-full h-auto object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.7)]"
            style={{
              filter: "drop-shadow(0 2px 16px #0008)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
