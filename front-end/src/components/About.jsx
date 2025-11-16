import FloatingSocial from "../components/FloatingSocial";

export default function About() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-amber-50 to-rose-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="/home1.png"
                alt="Câu chuyện WoodToys"
                className="rounded-2xl shadow-2xl w-full border-4 border-amber-200"
              />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold text-brand-primary mb-6 leading-tight">
                Câu chuyện về{" "}
                <span className="text-rose-500">VietMyth Luminarts</span>
              </h1>
              <p className="text-lg text-brand-text mb-6">
                Chào mừng bạn đến với VietMyth Luminarts – thương hiệu tiên
                phong trong việc kiến tạo trải nghiệm văn hóa dân gian Việt Nam
                thông qua nghệ thuật, sáng tạo và giáo dục. Chúng tôi tin rằng
                mỗi câu chuyện cổ tích Việt không chỉ là di sản tinh thần, mà
                còn là những bài học nhân văn, những giá trị sống đáng được
                truyền lại bằng cách gần gũi và sinh động hơn với thế hệ trẻ hôm
                nay.
              </p>
              <p className="text-lg text-brand-text">
                VietMyth Luminarts ra đời với sứ mệnh hồi sinh kho tàng truyện
                dân gian Việt trong một diện mạo mới – kết hợp giữa nghệ thuật
                thị giác, mô hình thủ công và phương pháp học qua trải nghiệm.
                Thông qua sản phẩm Hộp Mô hình Đồ chơi Gỗ, chúng tôi mang đến
                cho trẻ em cơ hội vừa chơi vừa học, tự tay lắp ráp, tô màu và kể
                lại những câu chuyện dân gian quen thuộc như Lang Liêu, Chú
                Cuội, Cây tre trăm đốt, Cây Khế… theo cách sáng tạo của riêng
                mình.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-16 bg-white border-b">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="bg-amber-100 rounded-xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-amber-700 mb-4">
                  Sứ mệnh
                </h2>
                <p className="text-brand-text text-lg">
                  Sứ mệnh của VietMyth Luminarts là truyền cảm hứng về niềm tự
                  hào dân tộc và sự sáng tạo cho thế hệ trẻ Việt Nam thông qua
                  các sản phẩm nghệ thuật và sáng tạo, tái hiện lại những câu
                  chuyện dân gian truyền thống.
                </p>
              </div>
              <div className="bg-rose-100 rounded-xl p-8 shadow-md">
                <h2 className="text-3xl font-bold text-rose-700 mb-4">
                  Tầm nhìn
                </h2>
                <p className="text-brand-text text-lg">
                  Trở thành thương hiệu hàng đầu trong việc hồi sinh văn hóa dân
                  gian Việt Nam trong thập kỷ tới.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-brand-primary mb-10">
              Giá trị cốt lõi
            </h2>
            <p className="text-center text-lg text-brand-text mb-12 max-w-3xl mx-auto">
              VietMyth Luminarts luôn gìn giữ và phát triển sáu giá trị cốt lõi
              trong mọi hoạt động của mình:{" "}
              <span className="font-semibold">
                Gắn kết gia đình, Sáng tạo, An toàn, Văn hóa, Tận tâm
              </span>{" "}
              và <span className="font-semibold">Thấu cảm</span>. Chúng tôi tin
              rằng mỗi sản phẩm không chỉ là đồ chơi, mà còn là cầu nối yêu
              thương giữa cha mẹ và con cái, giúp họ cùng nhau khám phá, học hỏi
              và sẻ chia.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Family Connection */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-amber-400">
                <h3 className="text-2xl font-bold text-amber-600 mb-2">
                  Gắn kết gia đình
                </h3>
                <p className="text-brand-text">
                  Mỗi sản phẩm của VietMyth Luminarts không chỉ là đồ chơi học
                  tập, mà còn là cầu nối yêu thương giữa cha mẹ và con cái.
                  Chúng tôi mong muốn tạo nên những khoảnh khắc chơi – học đầy ý
                  nghĩa, nơi cả gia đình cùng khám phá và sẻ chia cảm xúc.
                </p>
              </div>
              {/* Creativity */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-rose-400">
                <h3 className="text-2xl font-bold text-rose-600 mb-2">
                  Sáng tạo
                </h3>
                <p className="text-brand-text">
                  Sáng tạo là trung tâm trong mọi thiết kế của VietMyth
                  Luminarts. Mỗi mô hình được phát triển với ý tưởng độc đáo,
                  giúp trẻ phát huy trí tưởng tượng, tư duy nghệ thuật và khả
                  năng khéo léo thông qua trải nghiệm thực hành.
                </p>
              </div>
              {/* Safety */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-400">
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  An toàn
                </h3>
                <p className="text-brand-text">
                  Tất cả sản phẩm đều được làm từ vật liệu tự nhiên, thân thiện
                  và kiểm định nghiêm ngặt để đảm bảo an toàn tuyệt đối cho trẻ
                  nhỏ.
                </p>
              </div>
              {/* Culture */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-400">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">
                  Văn hóa
                </h3>
                <p className="text-brand-text">
                  VietMyth Luminarts tôn vinh giá trị văn hóa Việt Nam qua từng
                  chi tiết sản phẩm. Mỗi mô hình đều mang trong mình câu chuyện
                  dân gian, giúp trẻ thêm yêu, hiểu và tự hào về bản sắc dân
                  tộc.
                </p>
              </div>
              {/* Dedication */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-400">
                <h3 className="text-2xl font-bold text-purple-600 mb-2">
                  Tận tâm
                </h3>
                <p className="text-brand-text">
                  Chúng tôi luôn lắng nghe và thấu hiểu để mang đến sản phẩm tốt
                  nhất cho trẻ em và phụ huynh. Sự tận tâm thể hiện trong từng
                  thiết kế, từng trải nghiệm và dịch vụ mà VietMyth Luminarts
                  cung cấp.
                </p>
              </div>
              {/* Empathy */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-pink-400">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">
                  Thấu cảm
                </h3>
                <p className="text-brand-text">
                  VietMyth Luminarts luôn đặt mình vào vị trí của cha mẹ và trẻ
                  nhỏ, tạo ra sản phẩm phù hợp với từng giai đoạn phát triển và
                  nhu cầu học hỏi, đồng thời mang lại sự an tâm và tin tưởng cho
                  người sử dụng.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <FloatingSocial />
    </div>
  );
}
