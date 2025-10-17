export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <img
              src="/wooden-animal-puzzle.jpg"
              alt="Câu chuyện WoodToys"
              className="rounded-2xl shadow-xl w-full"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-brand-primary mb-4">
              Câu chuyện của chúng tôi
            </h2>
            <p className="text-brand-text mb-6">
              WoodToys ra đời từ tình yêu dành cho trẻ em và niềm tin vào sức
              mạnh của những món đồ chơi đơn giản, mộc mạc. Chúng tôi tin rằng
              mỗi mảnh gỗ không chỉ là vật liệu, mà còn là cầu nối giúp trẻ em
              kết nối với thiên nhiên và khơi dậy trí tưởng tượng vô tận.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-4">🌳</span>
                <p>
                  <strong>100% Gỗ tự nhiên:</strong> An toàn tuyệt đối cho bé,
                  thân thiện với môi trường.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🎨</span>
                <p>
                  <strong>Thiết kế độc đáo:</strong> Kích thích sự sáng tạo và
                  phát triển đa giác quan.
                </p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-4">🏆</span>
                <p>
                  <strong>Chất lượng hàng đầu:</strong> Mỗi sản phẩm đều được
                  chế tác tỉ mỉ, bền đẹp theo thời gian.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
