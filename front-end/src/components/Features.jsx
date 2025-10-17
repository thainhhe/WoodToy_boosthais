export default function Features() {
  const features = [
    {
      icon: "🌱",
      title: "Gỗ tự nhiên",
      description: "Sản phẩm từ gỗ tự nhiên, an toàn và bền vững",
    },
    {
      icon: "🧠",
      title: "Phát triển trí tuệ",
      description: "Giúp trẻ phát triển tư duy logic và sáng tạo",
    },
    {
      icon: "✨",
      title: "Chất lượng cao",
      description: "Kiểm định chất lượng quốc tế, an toàn cho trẻ",
    },
    {
      icon: "🎨",
      title: "Thiết kế đẹp",
      description: "Thiết kế hiện đại, màu sắc bắt mắt",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Tại sao chọn chúng tôi?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
