import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getStoryById } from "../service/api";
import QRCodeGenerator from "../components/QRCodeGenerator";

export default function StoryDetail() {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getStoryById(id);
        // tolerate multiple response shapes
        const payload = res?.data?.data || res?.data;
        const s = payload?.story || payload;
        if (!s) throw new Error("Story not found in response");
        setStory(s);
      } catch (err) {
        console.error("[StoryDetail] fetch error:", err?.response?.data || err);
        setError("Không tìm thấy câu chuyện.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading)
    return (
      <main className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <h2 className="text-xl text-center">Đang tải...</h2>
      </main>
    );

  if (error || !story)
    return (
      <main className="max-w-4xl mx-auto px-6 py-8 pt-24">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error || "Không tìm thấy câu chuyện"}
          </p>
          <Link to="/" className="text-brand-secondary underline">
            Quay về trang chủ
          </Link>
        </div>
      </main>
    );

  const detailUrl = `${window.location.origin}/stories/${
    story._id || story.slug
  }`;

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      let videoId = null;
      
      if (urlObj.hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1);
      }
      
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    } catch {
      return null;
    }
  };

  const youtubeEmbedUrl = getYouTubeEmbedUrl(story.youtubeUrl);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="prose max-w-full lg:col-span-2">
          <h1 className="text-4xl font-extrabold mb-4 text-center">{story.title}</h1>

          {/* Featured image, date and author intentionally hidden per request */}

          {/* Render blocks */}
          <div>
         
            {(story.blocks || []).map((block, i) => {
              if (block.type === "text") {
                return (
                  <div key={i} className="mb-4">
                    <p className="text-lg leading-relaxed whitespace-pre-line">
                      {block.content}
                    </p>
                  </div>
                );
              }

              if (block.type === "image") {
                const url = block.image?.url || (block.image || {}).url;
                return (
                  <figure key={i} className="mb-6">
                    {url && (
                      <img
                        src={url}
                        alt={block.image?.alt || story.title}
                        className="w-full rounded-md object-cover"
                      />
                    )}
                    {block.image?.caption && (
                      <figcaption className="text-sm text-gray-500 mt-2">
                        {block.image.caption}
                      </figcaption>
                    )}
                  </figure>
                );
              }

              return null;
            })}
          </div>

          <div className="mt-8">
            {/* Navigate back to the Stories section on the Home page */}
            <Link to="/#stories" className="text-brand-secondary underline">
              Quay về danh sách câu chuyện
            </Link>
          </div>
        </article>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h4 className="font-semibold mb-3">Chia sẻ câu chuyện</h4>
              <div className="flex items-center justify-center">
                <QRCodeGenerator url={detailUrl} size={160} />
              </div>
              <div className="mt-3 text-sm break-words text-gray-600">
                {detailUrl}
              </div>
            </div>

            {/* Tags removed per request */}
          </div>
        </aside>
      </div>

      {/* Video YouTube - Đáy trang */}
      {youtubeEmbedUrl && (
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white border rounded-lg p-6 shadow-lg">
            <h4 className="text-xl font-bold mb-4 text-center">🎥 Video giới thiệu</h4>
            <div className="aspect-video w-full rounded-lg overflow-hidden">
              <iframe
                src={youtubeEmbedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <a
                href={story.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-blue-600 hover:underline font-medium"
              >
                Xem trên YouTube →
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
