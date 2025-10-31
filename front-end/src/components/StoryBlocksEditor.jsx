import { useMemo } from "react";

export default function StoryBlocksEditor({ blocks, setBlocks, maxBlocks = 50 }) {
  const canAddMore = useMemo(() => (blocks?.length || 0) < maxBlocks, [blocks, maxBlocks]);

  const addText = () => {
    if (!canAddMore) return;
    const order = blocks.length;
    setBlocks([...blocks, { type: "text", order, content: "" }]);
  };

  const addImage = (file) => {
    if (!canAddMore) return;
    const order = blocks.length;
    setBlocks([
      ...blocks,
      {
        type: "image",
        order,
        image: { file: file || null, url: "", publicId: "", caption: "", alt: "" },
      },
    ]);
  };

  const removeAt = (index) => {
    const updated = blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }));
    setBlocks(updated);
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const updated = [...blocks];
    const tmp = updated[index];
    updated[index] = updated[target];
    updated[target] = tmp;
    // reassign order
    setBlocks(updated.map((b, i) => ({ ...b, order: i })));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button type="button" onClick={addText} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
          + Thêm đoạn Text
        </button>
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = (e) => addImage(e.target.files?.[0] || null);
            input.click();
          }}
          className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          + Thêm ảnh
        </button>
      </div>

      <div className="space-y-4">
        {blocks
          ?.sort((a, b) => a.order - b.order)
          .map((block, index) => (
            <div key={index} className="border rounded p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Block #{index + 1} — {block.type.toUpperCase()}</div>
                <div className="flex gap-2">
                  <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={() => move(index, -1)}>
                    ↑
                  </button>
                  <button type="button" className="px-2 py-1 bg-gray-100 rounded" onClick={() => move(index, 1)}>
                    ↓
                  </button>
                  <button type="button" className="px-2 py-1 bg-red-100 text-red-700 rounded" onClick={() => removeAt(index)}>
                    Xoá
                  </button>
                </div>
              </div>

              {block.type === "text" ? (
                <textarea
                  value={block.content || ""}
                  onChange={(e) => {
                    const updated = [...blocks];
                    updated[index] = { ...updated[index], content: e.target.value };
                    setBlocks(updated);
                  }}
                  rows={4}
                  maxLength={5000}
                  placeholder="Nhập nội dung text..."
                  className="w-full border rounded px-3 py-2"
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        const updated = [...blocks];
                        updated[index] = {
                          ...updated[index],
                          image: { ...(updated[index]?.image || {}), file },
                        };
                        setBlocks(updated);
                      }}
                    />
                    {(block.image?.url || block.image?.file) && (
                      <div className="w-24 h-24 rounded overflow-hidden border">
                        <img
                          src={block.image?.file ? URL.createObjectURL(block.image.file) : block.image?.url}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Caption (tối đa 200 ký tự)"
                    value={block.image?.caption || ""}
                    maxLength={200}
                    onChange={(e) => {
                      const updated = [...blocks];
                      updated[index] = {
                        ...updated[index],
                        image: { ...(updated[index]?.image || {}), caption: e.target.value },
                      };
                      setBlocks(updated);
                    }}
                  />
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Alt text (SEO)"
                    value={block.image?.alt || ""}
                    onChange={(e) => {
                      const updated = [...blocks];
                      updated[index] = {
                        ...updated[index],
                        image: { ...(updated[index]?.image || {}), alt: e.target.value },
                      };
                      setBlocks(updated);
                    }}
                  />
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}


