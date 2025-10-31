import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStories } from "../service/api";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();
  const hoverTimerRef = useRef(null);
  const HOVER_DELAY = 120; // ms - small debounce to prevent jitter when moving near edges
  const intervalRef = useRef(null);
  const AUTOPLAY_INTERVAL = 8000; // slower autoplay (8s)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await getStories({ page: 1, limit: 10 });
        // Support different response shapes: res.data.data.stories OR res.data.data (array)
        const data = res?.data?.data;
        const items = Array.isArray(data) ? data : data?.stories || [];
        console.log(
          "[Stories] GET /stories response count:",
          items.length,
          res?.data?.pagination || null
        );
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

  const total = stories.length;

  const goTo = (idx) => setCurrent(idx);
  const prev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const next = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  const handleCardClick = (idx, storyId) => {
    if (idx === current) {
      navigate(`/stories/${storyId}`);
    } else {
      goTo(idx);
    }
  };

  const startAutoplay = () => {
    if (!stories || stories.length <= 1) return;
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % stories.length);
    }, AUTOPLAY_INTERVAL);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const getVisibleItems = () => {
    if (total === 0) return [];
    const arr = [];
    for (let i = -2; i <= 2; i++) {
      arr.push((current + i + total) % total);
    }
    return arr;
  };

  const visible = getVisibleItems();

  useEffect(() => {
    // start autoplay when stories load
    startAutoplay();
    return () => {
      stopAutoplay();
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
        hoverTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories.length]);

  if (loading) {
    return (
      <section id="stories" className="py-20 bg-[#FFF8F2] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-secondary">
            Đang tải câu chuyện...
          </h2>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="stories" className="py-20 bg-[#FFF8F2] overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-red-500">{error}</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="stories" className="py-20 bg-[#FFF8F2] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-extrabold text-center mb-16 text-brand-secondary drop-shadow-lg tracking-tight">
          Câu chuyện mới
        </h2>
        {total > 0 && (
          <>
            <div className="relative flex items-center justify-center">
              <button
                onClick={() => {
                  prev();
                }}
                aria-label="Trước"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              />

              <div
                onMouseEnter={() => stopAutoplay()}
                onMouseLeave={() => startAutoplay()}
                className="w-full flex justify-center gap-4 md:gap-8 lg:gap-12 overflow-hidden relative h-[420px]"
              >
                {visible.map((idx, i) => {
                  const s = stories[idx];
                  if (!s) return null;
                  const isActive = idx === current;
                  const isPreview = preview === idx;
                  const isHighlighted = isActive || isPreview;
                  const pos = i - 2;

                  const primaryImage = s.featuredImage || {
                    url: "/placeholder.jpg",
                  };

                  return (
                    <div
                      key={`${s._id}-${i}`}
                      className={`absolute left-1/2 top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out flex flex-col items-center rounded-2xl border-2 shadow-xl group ${
                        isHighlighted
                          ? "bg-white border-amber-400 scale-110 z-20 opacity-100"
                          : "bg-white border-amber-100 opacity-40 scale-95 z-10"
                      } p-4 md:p-6 lg:p-8 max-w-xs w-full cursor-pointer`}
                      style={{
                        minHeight: 380,
                        boxShadow: isActive
                          ? "0 8px 32px 0 rgba(244,106,94,0.15)"
                          : undefined,
                        transform: `translate(-50%, -50%) translateX(${
                          pos * 260
                        }px) scale(${isHighlighted ? 1.08 : 0.95})`,
                        transition:
                          "transform 1.6s cubic-bezier(.4,0,.2,1), opacity 1.6s cubic-bezier(.4,0,.2,1)",
                      }}
                      onClick={() => handleCardClick(idx, s._id)}
                      onMouseEnter={() => {
                        // show preview on hover (debounced) but do NOT change active slide; pause autoplay
                        if (hoverTimerRef.current)
                          clearTimeout(hoverTimerRef.current);
                        hoverTimerRef.current = setTimeout(
                          () => setPreview(idx),
                          HOVER_DELAY
                        );
                        stopAutoplay();
                      }}
                      onMouseLeave={() => {
                        if (hoverTimerRef.current) {
                          clearTimeout(hoverTimerRef.current);
                          hoverTimerRef.current = null;
                        }
                        setPreview(null);
                        startAutoplay();
                      }}
                      onFocus={() => {
                        // keyboard focus shows preview but not change active
                        setPreview(idx);
                        stopAutoplay();
                      }}
                      onBlur={() => {
                        if (hoverTimerRef.current) {
                          clearTimeout(hoverTimerRef.current);
                          hoverTimerRef.current = null;
                        }
                        setPreview(null);
                        startAutoplay();
                      }}
                    >
                      {/* Number badge removed per design */}
                      <div className="w-full flex justify-center mb-4">
                        <div
                          className={`border-4 rounded-xl overflow-hidden flex items-center justify-center bg-[#FFF8F2] transition-all ${
                            isActive
                              ? "border-brand-secondary w-40 h-40"
                              : "border-amber-200 w-28 h-28"
                          }`}
                        >
                          <img
                            src={primaryImage.url || primaryImage}
                            alt={s.title}
                            className={`object-contain ${
                              isActive ? "w-36 h-36" : "w-20 h-20"
                            }`}
                          />
                        </div>
                      </div>
                      <div
                        className={`font-bold text-center mb-2 transition-all ${
                          isActive
                            ? "text-lg md:text-xl text-brand-primary"
                            : "text-base text-gray-500"
                        }`}
                      >
                        {s.title}
                      </div>
                      <div
                        title={s.description}
                        className={`text-center leading-relaxed transition-all ${
                          isActive
                            ? "text-brand-text text-base line-clamp-4"
                            : "text-gray-400 text-sm line-clamp-3"
                        }`}
                      >
                        {s.description}
                      </div>
                      {isActive && (
                        <div
                          className="absolute inset-0 ring-2 ring-brand-secondary rounded-2xl pointer-events-none animate-pulse"
                          style={{ zIndex: 1 }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  next();
                }}
                aria-label="Sau"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
              />
            </div>

            <div className="flex justify-center mt-8 gap-3">
              {stories.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className={`w-4 h-4 rounded-full border-2 border-brand-secondary transition-all ${
                    idx === current ? "bg-brand-secondary" : "bg-white"
                  }`}
                  aria-label={`Chuyển đến câu chuyện ${idx + 1}`}
                ></button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
