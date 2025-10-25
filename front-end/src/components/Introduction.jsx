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
              <strong>Hộp Mô hình Đồ chơi Gỗ VietMyth Luminarts</strong> là sự
              kết hợp độc đáo giữa giáo dục, nghệ thuật và văn hóa dân gian Việt
              Nam. Lấy cảm hứng từ những câu chuyện cổ như Lang Liêu, Chú Cuội
              hay Cây Khế, sản phẩm mang đến cho trẻ em một cách tiếp cận mới mẻ
              với văn hóa truyền thống — học qua chơi, chơi để khám phá. Mỗi hộp
              mô hình là một thế giới thu nhỏ được tạo nên từ gỗ tự nhiên an
              toàn, đi kèm truyện tranh minh họa và bộ công cụ sáng tạo giúp trẻ
              tự tay lắp ráp, tô màu, sắp đặt và kể lại câu chuyện dân gian theo
              trí tưởng tượng của riêng mình. Đây không chỉ là một món đồ chơi,
              mà còn là một hành trình nuôi dưỡng cảm xúc, khơi dậy sáng tạo và
              khuyến khích tư duy nghệ thuật ở trẻ nhỏ.
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
              Là cầu nối giữa quá khứ và hiện tại, giúp trẻ em ngày nay hiểu và
              yêu hơn bản sắc dân tộc. Mỗi sản phẩm là một “mảnh ghép văn hóa”,
              góp phần bảo tồn và lan tỏa kho tàng truyện dân gian Việt Nam
              trong thời đại công nghệ. Thông qua việc vừa học vừa chơi, trẻ
              lĩnh hội được những bài học nhân văn về lòng hiếu thảo, trung
              thực, đoàn kết và dũng cảm – những giá trị sống được gửi gắm trong
              từng câu chuyện cổ. Sản phẩm còn mang ý nghĩa gắn kết gia đình,
              khi cha mẹ và con cái cùng lắp ráp, kể chuyện và chia sẻ khoảnh
              khắc sáng tạo bên nhau. Hộp Mô hình Đồ chơi Gỗ VietMyth Luminarts
              vì thế không chỉ là món quà cho trẻ nhỏ, mà là món quà tinh thần
              cho cả gia đình Việt, góp phần gìn giữ ngọn lửa văn hóa dân tộc
              bằng cách để trẻ em tự mình viết tiếp những huyền thoại xưa bằng
              trí tưởng tượng của thời nay.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
