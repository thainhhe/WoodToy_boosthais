const logos = [
  { name: "VTV", src: "https://placehold.co/150x60/FFFFFF/CCCCCC?text=VTV" },
  {
    name: "Afamily",
    src: "https://placehold.co/150x60/FFFFFF/CCCCCC?text=Afamily",
  },
  {
    name: "WeChoice",
    src: "https://placehold.co/150x60/FFFFFF/CCCCCC?text=WeChoice",
  },
  {
    name: "Dân trí",
    src: "https://placehold.co/150x60/FFFFFF/CCCCCC?text=Dân+trí",
  },
  {
    name: "Kênh 14",
    src: "https://placehold.co/150x60/FFFFFF/CCCCCC?text=Kênh+14",
  },
];

export default function Press() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold text-gray-400 mb-8">
          Được tin tưởng bởi các bậc cha mẹ và chuyên gia
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
          {logos.map((logo) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.name}
              className="h-10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
