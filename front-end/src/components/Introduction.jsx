import { useState, useEffect, useRef } from "react";

// Custom hook để theo dõi khi component xuất hiện trong viewport
const useOnScreen = (options) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isVisible];
};

export default function Introduction() {
  const [ref, isVisible] = useOnScreen({ threshold: 0.2 });

  return (
    <section
      ref={ref}
      className={`py-24 bg-white transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 ${
            isVisible ? "animate-fade-in-up" : ""
          }`}
        >
          <h2 className="text-4xl font-extrabold text-brand-secondary">
            Lời Giới Thiệu
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Cột bên trái */}
          <div
            className={`space-y-6 ${
              isVisible ? "animate-fade-in-up animate-float" : ""
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            <p className="text-brand-text leading-relaxed">
              <strong>WoodToys</strong> là bộ sưu tập đồ chơi giáo dục bằng gỗ
              dành cho trẻ từ 3-10 tuổi, được thiết kế để mang đến trải nghiệm
              học mà chơi đầy sáng tạo. Mỗi món đồ chơi không chỉ là những mảnh
              gỗ được chế tác tỉ mỉ, mà còn là một công cụ giúp trẻ chủ động
              khám phá thế giới thông qua trải nghiệm tương tác trực quan, dễ
              hiểu và giàu cảm xúc.
            </p>
            <img
              src="/wooden-house-puzzle.jpg"
              alt="Đồ chơi nhà gỗ"
              className="rounded-xl w-3/4 max-w-xs mx-auto"
            />
          </div>

          {/* Cột bên phải */}
          <div
            className={`space-y-6 ${
              isVisible ? "animate-fade-in-up animate-float" : ""
            }`}
            style={{ animationDelay: "0.4s" }}
          >
            <img
              src="/wooden-animal-puzzle.jpg"
              alt="Đồ chơi thú gỗ"
              className="rounded-xl w-3/4 max-w-xs mx-auto shadow-lg mb-6"
            />
            <p className="text-brand-text leading-relaxed">
              Với nội dung được kiểm duyệt kỹ lưỡng và thiết kế thẩm mỹ cao, bộ
              đồ chơi không chỉ là công cụ học tập hiệu quả mà còn góp phần đổi
              mới phương pháp tiếp cận giáo dục sớm. Các nhân vật, hình khối
              "sống động" giúp trẻ chủ động khám phá kiến thức, phát triển tư
              duy, ngôn ngữ và tình yêu với sự khám phá. Đây là giải pháp giáo
              dục sáng tạo, góp phần lan tỏa giá trị "chơi để học" một cách thú
              vị và hiệu quả.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
