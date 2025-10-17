const featuresData = [
  {
    icon: "🧠",
    title: "Phát Triển Tư Duy",
    description:
      "Các khối hình học và câu đố giúp bé rèn luyện logic, khả năng giải quyết vấn đề.",
  },
  {
    icon: "🖐️",
    title: "Kỹ Năng Vận Động Tinh",
    description:
      "Việc cầm, nắm, lắp ghép các chi tiết gỗ giúp đôi tay của bé trở nên khéo léo hơn.",
  },
  {
    icon: "🎨",
    title: "Khơi Nguồn Sáng Tạo",
    description:
      "Không có giới hạn, bé tự do sắp xếp, xây dựng thế giới của riêng mình.",
  },
  {
    icon: "❤️",
    title: "Gắn Kết Gia Đình",
    description: "Thời gian tuyệt vời để cha mẹ cùng chơi, cùng học với con.",
  },
];

export default function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-brand-primary">
            Tại sao WoodToys là lựa chọn tốt nhất?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="text-center p-8 bg-brand-light rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-transform duration-300"
            >
              <div className="text-5xl mb-4 flex justify-center items-center h-16">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-brand-primary">
                {feature.title}
              </h3>
              <p className="text-brand-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
