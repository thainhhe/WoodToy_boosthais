import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createStory, getPopularStoryTags } from "../../service/api";

export default function StoryCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    status: "draft",
    blocks: [],
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    getPopularStoryTags()
      .then((res) => setSuggestedTags(res?.data?.data?.tags || []))
      .catch(() => setSuggestedTags([]));
  }, []);

  const handleAddTextBlock = () => {
    setForm((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { type: "text", order: prev.blocks.length, content: "" }],
    }));
  };

  const handleAddImageBlock = () => {
    setForm((prev) => ({
      ...prev,
      blocks: [...prev.blocks, { type: "image", order: prev.blocks.length, image: {}, caption: "", alt: "" }],
    }));
  };

  const handleBlockChange = (index, field, value) => {
    const updated = [...form.blocks];
    if (updated[index].type === "text" && field === "content") {
      updated[index].content = value;
    } else if (updated[index].type === "image") {
      if (field === "caption" || field === "alt") updated[index][field] = value;
      if (field === "file") updated[index].file = value; // temp file for upload
    }
    setForm({ ...form, blocks: updated });
  };

  const handleRemoveBlock = (index) => {
    const updated = form.blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }));
    setForm({ ...form, blocks: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.description) fd.append("description", form.description);
      if (form.status) fd.append("status", form.status);
      if (form.tags?.length) fd.append("tags", form.tags.join(","));

      // prepare blocks without local File object
      const cleanBlocks = form.blocks.map((b, idx) => {
        if (b.type === "text") return { type: "text", order: idx, content: b.content || "" };
        return { type: "image", order: idx, image: { caption: b.caption || "", alt: b.alt || "" } };
      });
      if (cleanBlocks.length) fd.append("blocks", JSON.stringify(cleanBlocks));

      if (featuredImage) fd.append("featuredImage", featuredImage);

      // attach block images with field pattern blockImage_{index}
      form.blocks.forEach((b, idx) => {
        if (b.type === "image" && b.file) {
          fd.append(`blockImage_${idx}`, b.file);
        }
      });

      await createStory(fd);
      navigate("/admin/stories");
    } catch (err) {
      alert("Không thể tạo story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Tạo Story mới</h1>
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <input className="w-full border rounded px-3 py-2" placeholder="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea className="w-full border rounded px-3 py-2" rows={5} placeholder="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 font-semibold">Trạng thái</label>
            <select className="w-full border rounded px-3 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Nháp</option>
              <option value="published">Công khai</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Ảnh đại diện</label>
            <input type="file" accept="image/*" onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)} />
          </div>
        </div>
        <div>
          <label className="block font-semibold mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.tags.map((t) => (
              <span key={t} className="bg-gray-200 px-2 py-1 rounded">
                {t}
                <button type="button" className="ml-1 text-red-500" onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}>
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Nhập tag mới..." value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newTag.trim()) { setForm({ ...form, tags: [...form.tags, newTag.trim()] }); setNewTag(""); } } }} />
            <button type="button" className="bg-brand-primary text-white px-3 py-1 rounded" disabled={!newTag.trim()} onClick={() => { if (!newTag.trim()) return; setForm({ ...form, tags: [...form.tags, newTag.trim()] }); setNewTag(""); }}>
              Thêm
            </button>
          </div>
          <select multiple className="w-full border rounded px-3 py-2 mt-2" value={[]} onChange={(e) => { const selected = Array.from(e.target.selectedOptions).map((o) => o.value); setForm({ ...form, tags: Array.from(new Set([...form.tags, ...selected])) }); }}>
            {suggestedTags.map((t) => (
              <option key={t.tag} value={t.tag}>
                {t.tag} ({t.count})
              </option>
            ))}
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold">Story Blocks</h3>
            <div className="flex gap-2">
              <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handleAddTextBlock}>
                + Text
              </button>
              <button type="button" className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleAddImageBlock}>
                + Ảnh
              </button>
            </div>
          </div>
          {form.blocks.length === 0 ? (
            <div className="text-gray-500">Chưa có block nào</div>
          ) : (
            <div className="space-y-3">
              {form.blocks.map((b, idx) => (
                <div key={idx} className="border rounded p-3">
                  <div className="flex justify-between mb-2">
                    <div className="font-semibold">#{idx + 1} - {b.type === "text" ? "Text" : "Ảnh"}</div>
                    <button type="button" className="text-red-600" onClick={() => handleRemoveBlock(idx)}>Xóa</button>
                  </div>
                  {b.type === "text" ? (
                    <textarea className="w-full border rounded px-3 py-2" rows={3} value={b.content || ""} onChange={(e) => handleBlockChange(idx, "content", e.target.value)} placeholder="Nhập nội dung..." />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm mb-1">Ảnh</label>
                        <input type="file" accept="image/*" onChange={(e) => handleBlockChange(idx, "file", e.target.files?.[0])} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Caption</label>
                        <input className="w-full border rounded px-2 py-1" value={b.caption || ""} onChange={(e) => handleBlockChange(idx, "caption", e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Alt</label>
                        <input className="w-full border rounded px-2 py-1" value={b.alt || ""} onChange={(e) => handleBlockChange(idx, "alt", e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="bg-brand-primary text-white px-4 py-2 rounded font-bold">
          {loading ? "Đang tạo..." : "Tạo Story"}
        </button>
      </form>
    </div>
  );
}


