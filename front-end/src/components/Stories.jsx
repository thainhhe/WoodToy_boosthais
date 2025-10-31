import { useEffect, useState } from "react";
import { getStories } from "../service/api";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStories({ page: 1, limit: 10 });
        const items = res?.data?.data || [];
        console.log("[Stories] GET /stories response count:", items.length, res?.data?.pagination);
        setStories(items.filter((s) => s.status === "published"));
      } catch (e) {
        console.error("[Stories] fetch error:", e?.response?.data || e);
        setError("Không thể tải câu chuyện.");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  if (loading) {
    return (
      <section id="stories" className="py-20 bg-[#FFF8F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-secondary">Đang tải câu chuyện...</h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="stories" className="py-20 bg-[#FFF8F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-red-500">{error}</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="stories" className="py-20 bg-[#FFF8F2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center mb-12 text-brand-secondary drop-shadow-lg tracking-tight">
          {stories.length > 0 ? `Câu chuyện mới` : "Chưa có câu chuyện nào"}
        </h2>
        {stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((s) => (
              <div key={s._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-amber-100">
                {s.featuredImage ? (
                  <img src={s.featuredImage} alt={s.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-amber-50" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{s.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


