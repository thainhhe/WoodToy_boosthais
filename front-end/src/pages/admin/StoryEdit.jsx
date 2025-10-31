import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPopularStoryTags, getStoryById, updateStory } from "../../service/api";

function BlockEditor({ blocks, setBlocks }) {
  const addText = () => setBlocks((b) => [...b, { type: "text", content: "", order: b.length }]);
  const addImage = () => setBlocks((b) => [...b, { type: "image", image: { url: "", caption: "", alt: "" }, file: null, order: b.length }]);
  const updateBlock = (idx, patch) => setBlocks((b) => b.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const move = (idx, dir) => {
    setBlocks((prev) => {
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((b, i) => ({ ...b, order: i }));
    });
  };
  const remove = (idx) => setBlocks((b) => b.filter((_, i) => i !== idx).map((bb, i) => ({ ...bb, order: i })));

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={addText} className="px-3 py-1 bg-amber-100 rounded">+ Text</button>
        <button type="button" onClick={addImage} className="px-3 py-1 bg-amber-100 rounded">+ Image</button>
      </div>
      {blocks.map((b, idx) => (
        <div key={idx} className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold">Block #{idx + 1} ({b.type})</div>
            <div className="flex gap-2">
              <button type="button" onClick={() => move(idx, "up")} className="text-xs px-2 py-1 border rounded">Up</button>
              <button type="button" onClick={() => move(idx, "down")} className="text-xs px-2 py-1 border rounded">Down</button>
              <button type="button" onClick={() => remove(idx)} className="text-xs px-2 py-1 border rounded text-red-600">Remove</button>
            </div>
          </div>

          {b.type === "text" ? (
            <textarea
              value={b.content || ""}
              onChange={(e) => updateBlock(idx, { content: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Nhập nội dung..."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateBlock(idx, { file: e.target.files?.[0] || null })}
                />
                {b.image?.url ? (
                  <img src={b.image.url} alt={b.image.alt || ""} className="mt-2 w-40 h-40 object-cover rounded" />
                ) : null}
              </div>
              <div className="md:col-span-2 space-y-2">
                <input
                  value={b.image?.caption || ""}
                  onChange={(e) => updateBlock(idx, { image: { ...(b.image || {}), caption: e.target.value } })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Caption (tuỳ chọn)"
                />
                <input
                  value={b.image?.alt || ""}
                  onChange={(e) => updateBlock(idx, { image: { ...(b.image || {}), alt: e.target.value } })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Alt (tuỳ chọn)"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function StoryEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "draft",
    tags: [],
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [existingFeatured, setExistingFeatured] = useState("");
  const [removeFeatured, setRemoveFeatured] = useState(false);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const res = await getStoryById(id);
        const s = res.data?.data?.story || {};
        setForm({
          title: s.title || "",
          description: s.description || "",
          status: s.status || "draft",
          tags: Array.isArray(s.tags) ? s.tags : [],
        });
        setExistingFeatured(s.featuredImage || "");
        setRemoveFeatured(false);
        const bs = Array.isArray(s.blocks) ? s.blocks : [];
        setBlocks(bs.map((b, i) => ({
          type: b.type,
          order: typeof b.order === "number" ? b.order : i,
          content: b.type === "text" ? (b.content || "") : undefined,
          image: b.type === "image" ? { url: b.image?.url || "", caption: b.image?.caption || "", alt: b.image?.alt || "" } : undefined,
          file: null,
        })).sort((a, b) => a.order - b.order));
      } catch (e) {
        alert("Không tải được story");
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
    getPopularStoryTags()
      .then((res) => setSuggestedTags(res?.data?.data?.tags || []))
      .catch(() => setSuggestedTags([]));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.description) fd.append("description", form.description);
      if (form.status) fd.append("status", form.status);
      if (form.tags?.length) fd.append("tags", form.tags.join(","));
      const normalized = blocks.map((b, i) => ({
        type: b.type,
        order: i,
        ...(b.type === "text"
          ? { content: b.content || "" }
          : { image: { url: b.image?.url || "", caption: b.image?.caption || "", alt: b.image?.alt || "" } }),
      }));
      fd.append("blocks", JSON.stringify(normalized));
      normalized.forEach((b, i) => {
        if (b.type === "image") {
          const file = blocks[i]?.file;
          if (file) fd.append(`blockImage_${i}`, file);
        }
      });
      if (featuredImage) fd.append("featuredImage", featuredImage);
      if (removeFeatured) fd.append("removeFeaturedImage", "true");
      console.log("[StoryEdit] submitting update payload:", {
        title: form.title,
        status: form.status,
        tags: form.tags,
        blocksCount: normalized.length,
        imageFiles: blocks.map((b, i) => ({ i, hasFile: Boolean(b.file) })).filter((x) => x.hasFile),
        removeFeatured,
      });
      await updateStory(id, fd);
      navigate("/admin/stories");
    } catch (err) {
      console.error("[StoryEdit] update error:", err?.response?.data || err);
      alert("Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sửa Story</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm mb-1">Tiêu đề</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Mô tả</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Tags</label>
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
        </div>
        <div>
          <label className="block text-sm mb-1">Featured Image</label>
          {existingFeatured ? (
            <div className="mb-2">
              <img src={existingFeatured} alt="featured" className="w-48 h-48 object-cover rounded" />
              <label className="block mt-2 text-sm">
                <input type="checkbox" className="mr-2" checked={removeFeatured} onChange={(e) => setRemoveFeatured(e.target.checked)} />
                Xoá ảnh hiện tại khi lưu
              </label>
            </div>
          ) : null}
          <input type="file" accept="image/*" onChange={(e) => { setFeaturedImage(e.target.files?.[0] || null); if (e.target.files?.[0]) setRemoveFeatured(false); }} />
        </div>
        <div>
          <label className="block text-sm mb-2 font-semibold">Blocks</label>
          <BlockEditor blocks={blocks} setBlocks={setBlocks} />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : "Lưu"}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={() => navigate("/admin/stories")}
          >
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}


