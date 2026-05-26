"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import GhibliIcon from "@/components/icons/GhibliIcon";
import QuickAddCard from "@/components/save/QuickAddCard";
import SaveItemCard from "@/components/save/SaveItemCard";
import {
  HINTS,
  SAVE_CATEGORIES,
  SUGGESTIONS,
  TAGS_BY_CATEGORY,
} from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";
import type { SaveItem } from "@/types";
import { cn } from "@/utils/cn";

interface SaveCategoryContentProps {
  category: string;
}

const saveItemSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề!"),
  desc: z.string().optional(),
  tag: z.string().optional(),
});

type SaveItemFormValues = z.infer<typeof saveItemSchema>;

const tagPickStyles = [
  {
    bg: "bg-[#fde2e2]",
    text: "text-[#b85c5c]",
    border: "border-[#f5c6c6]",
    active: "border-[#b85c5c]",
  },
  {
    bg: "bg-[#ead7f0]",
    text: "text-[#7a4a8c]",
    border: "border-[#d9bce0]",
    active: "border-[#7a4a8c]",
  },
  {
    bg: "bg-[#e8e8e8]",
    text: "text-[#5a5a5a]",
    border: "border-[#cfcfcf]",
    active: "border-[#5a5a5a]",
  },
  {
    bg: "bg-[#d8ecd8]",
    text: "text-[#4a7a4a]",
    border: "border-[#b8d8b8]",
    active: "border-[#4a7a4a]",
  },
  {
    bg: "bg-[#fde6c8]",
    text: "text-[#a06a2a]",
    border: "border-[#f5d09a]",
    active: "border-[#a06a2a]",
  },
  {
    bg: "bg-[#cfe5ec]",
    text: "text-[#3a6a7a]",
    border: "border-[#a8d0db]",
    active: "border-[#3a6a7a]",
  },
];

export default function SaveCategoryContent({
  category,
}: SaveCategoryContentProps) {
  // Fine-grained Zustand selectors — component only re-renders when these specific slices change
  const loadData = useDataStore((s) => s.loadData);
  const items = useDataStore((s) => s.items);
  const addItem = useDataStore((s) => s.addItem);
  const addItems = useDataStore((s) => s.addItems);
  const updateItem = useDataStore((s) => s.updateItem);
  const deleteItem = useDataStore((s) => s.deleteItem);

  // Form setup using React Hook Form + Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaveItemFormValues>({
    resolver: zodResolver(saveItemSchema),
    defaultValues: {
      title: "",
      desc: "",
      tag: "",
    },
  });

  const formTag = watch("tag");

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Suggestion state
  const [currentSuggestion, setCurrentSuggestion] = useState<{
    n: string;
    d: string;
  } | null>(null);

  // Filter state
  const [activeFilterTag, setActiveFilterTag] = useState("__all__");

  const clearForm = useCallback(() => {
    reset({
      title: "",
      desc: "",
      tag: "",
    });
    setImagePreview(null);
    setEditingItemId(null);
    const fileEl = document.getElementById("if") as HTMLInputElement | null;
    if (fileEl) fileEl.value = "";
  }, [reset]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset tag selection filter when category changes
  useEffect(() => {
    if (category) {
      setActiveFilterTag("__all__");
      clearForm();
      setCurrentSuggestion(null);
    }
  }, [category, clearForm]);

  const currentCategory = useMemo(
    () => SAVE_CATEGORIES.find((c) => c.id === category),
    [category],
  );
  const hints = useMemo(
    () => HINTS[category as keyof typeof HINTS] || { t: "Tiêu đề", d: "Mô tả" },
    [category],
  );
  const presetTags = useMemo(
    () => TAGS_BY_CATEGORY[category as keyof typeof TAGS_BY_CATEGORY] || [],
    [category],
  );
  const hasFile = useMemo(
    () => ["food", "cafe", "places"].includes(category),
    [category],
  );

  const allItems = useMemo(
    () => items.filter((i) => i.category === category),
    [items, category],
  );

  const filteredItems = useMemo(() => {
    if (activeFilterTag === "__all__") return allItems;
    return allItems.filter((i) => (i.tag || "") === activeFilterTag);
  }, [allItems, activeFilterTag]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tag of presetTags) {
      counts[tag] = allItems.filter((i) => (i.tag || "") === tag).length;
    }
    return counts;
  }, [allItems, presetTags]);

  // Derived state — automatically true after addItem updates items slice
  const isSuggestionAlreadyInList = useMemo(() => {
    if (!currentSuggestion) return false;
    return items.some(
      (i) =>
        i.category === category &&
        i.title.trim().toLowerCase() ===
          currentSuggestion.n.trim().toLowerCase(),
    );
  }, [currentSuggestion, items, category]);

  const selectPresetTag = (tag: string) => {
    setValue("tag", formTag === tag ? "" : tag);
  };

  const handleImgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: SaveItemFormValues) => {
    if (editingItemId) {
      updateItem({
        id: editingItemId,
        title: values.title.trim(),
        desc: values.desc?.trim() || "",
        tag: values.tag || "",
        image: imagePreview,
      });
    } else {
      addItem({
        category,
        title: values.title.trim(),
        desc: values.desc?.trim() || "",
        tag: values.tag || "",
        image: imagePreview,
      });
    }
    clearForm();
  };

  const startEdit = (idVal: string) => {
    setEditingItemId(idVal);
    const item = items.find((x) => x.id === idVal);
    if (item) {
      reset({
        title: item.title,
        desc: item.desc || "",
        tag: item.tag || "",
      });
      setImagePreview(item.image || null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteItem = (idVal: string) => {
    if (confirm("Bạn có chắc chắn muốn xoá mục này?")) {
      deleteItem(idVal);
      if (editingItemId === idVal) {
        clearForm();
      }
    }
  };

  // Suggestions
  const pickRandomSuggestion = () => {
    const pool = SUGGESTIONS[category as keyof typeof SUGGESTIONS];
    if (!pool || !pool.length) return;

    const existingNames = items.reduce((acc, i) => {
      if (i.category === category) {
        acc.add(i.title.trim().toLowerCase());
      }
      return acc;
    }, new Set<string>());

    const fresh = pool.filter(
      (p) => !existingNames.has(p.n.trim().toLowerCase()),
    );
    const candidates = fresh.length > 0 ? fresh : pool;

    let next = null;
    for (let k = 0; k < 8; k++) {
      const candidate =
        candidates[Math.floor(Math.random() * candidates.length)];
      if (candidate !== undefined) {
        next = candidate;
        if (
          !currentSuggestion ||
          next.n !== currentSuggestion.n ||
          candidates.length === 1
        ) {
          break;
        }
      }
    }

    if (next) {
      setCurrentSuggestion(next);
    }
  };

  const addSuggestionToList = () => {
    if (!currentSuggestion) return;
    addItem({
      category,
      title: currentSuggestion.n,
      desc: currentSuggestion.d,
      tag: "",
      image: null,
    });
    // isSuggestionAlreadyInList updates automatically via derived useMemo
    alert(`Đã thêm "${currentSuggestion.n}" vào list!`);
  };

  const handleBulkImport = (
    newItems: Omit<SaveItem, "id" | "createdAt" | "category">[],
  ) => {
    const itemsWithCat = newItems.map((item) => ({
      ...item,
      category,
    }));
    addItems(itemsWithCat);
  };

  return (
    <div>
      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="font-pangolin text-[1.2rem] text-earth mb-3.5 flex items-center gap-2">
          {currentCategory && (
            <GhibliIcon type={currentCategory.ico} size={24} />
          )}
          {editingItemId ? "Sửa mục:" : "Thêm vào:"} {currentCategory?.label}
        </div>

        <div className="form-group">
          <label htmlFor="title-input">Tiêu đề</label>
          <input
            id="title-input"
            {...register("title")}
            className="form-input"
            placeholder={hints.t}
          />
          {errors.title && (
            <p className="text-[#c97070] text-[0.8rem] mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="desc-input">Mô tả</label>
          <textarea
            id="desc-input"
            {...register("desc")}
            className="form-textarea"
            placeholder={hints.d}
          />
        </div>

        <div className="form-group">
          <span className="form-label">Gắn thẻ</span>
          <div className="flex gap-2 flex-wrap mt-1">
            {presetTags.map((t, idx) => {
              const tagStyle = tagPickStyles[idx % tagPickStyles.length] ||
                tagPickStyles[0] || {
                  bg: "",
                  text: "",
                  border: "",
                  active: "",
                };
              const isActive = formTag === t;
              return (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "font-quicksand font-semibold text-[0.82rem] py-1.5 px-4 border-2 rounded-[18px] cursor-pointer transition-all duration-200 opacity-70 hover:opacity-100 hover:-translate-y-0.5",
                    isActive
                      ? cn(
                          "opacity-100 -translate-y-0.5 shadow-md",
                          tagStyle.active,
                        )
                      : "border-transparent",
                    tagStyle.bg,
                    tagStyle.text,
                  )}
                  onClick={() => selectPresetTag(t)}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="file-upload-label" htmlFor="if">
            Chọn hình ảnh
          </label>
          <input
            type="file"
            id="if"
            accept="image/*"
            className="hidden"
            onChange={handleImgUpload}
            aria-label="Chọn hình ảnh"
          />
          {imagePreview && (
            <Image
              src={imagePreview}
              className="img-preview"
              alt="Preview"
              width={100}
              height={100}
            />
          )}
        </div>

        <div className="flex gap-2.5 mt-2">
          <button type="submit" className="btn btn-primary">
            Lưu lại
          </button>
          {editingItemId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearForm}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {/* Suggestions (if available) */}
      {SUGGESTIONS[category as keyof typeof SUGGESTIONS] && (
        <div className="card bg-gradient-to-br from-[#fef7ec] to-[#fdf0e0] border-2 border-dashed border-[#f4a460]/35">
          <div className="flex justify-between items-center gap-3 flex-wrap mb-3">
            <div className="font-pangolin text-[1.2rem] text-earth flex items-center gap-2">
              <GhibliIcon type="calcifer" size={22} />
              Gợi ý {currentCategory?.label.toLowerCase()}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={pickRandomSuggestion}
            >
              {currentSuggestion ? "Gợi ý khác" : "Bốc thử một quán"}
            </button>
          </div>

          {currentSuggestion ? (
            <div className="bg-card rounded-[14px] p-4 shadow-sm">
              <div className="font-pangolin text-[1.25rem] text-ink flex items-center gap-2 mb-2">
                {currentCategory && (
                  <GhibliIcon type={currentCategory.ico} size={20} />
                )}
                {currentSuggestion.n}
              </div>
              <div className="font-quicksand text-[0.9rem] text-ink-light leading-[1.55] mb-3.5">
                {currentSuggestion.d}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-primary btn-small"
                  onClick={addSuggestionToList}
                >
                  <span className="inline-flex items-center gap-1">
                    <GhibliIcon type="heart" size={16} />
                    Thêm vào list
                  </span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-small"
                  onClick={pickRandomSuggestion}
                >
                  🔄 Gợi ý khác
                </button>
              </div>
              {isSuggestionAlreadyInList && (
                <div className="mt-2.5 text-[0.8rem] text-sunset italic text-center">
                  Quán này đã có trong list của bạn rồi nhé ✿
                </div>
              )}
            </div>
          ) : (
            <div className="font-quicksand text-[0.88rem] text-ink-light text-center py-[14px] px-2 italic">
              Bấm nút để nhận gợi ý ngẫu nhiên từ{" "}
              {SUGGESTIONS[category as keyof typeof SUGGESTIONS]?.length || 0}{" "}
              {currentCategory?.label.toLowerCase()} ở Sài Gòn ✿
            </div>
          )}
        </div>
      )}

      {/* Quick Add */}
      <QuickAddCard
        presetTags={presetTags}
        hasFile={hasFile}
        onImported={handleBulkImport}
      />

      {/* Tag Filter */}
      {allItems.length > 0 && presetTags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap my-1.5 mb-4.5 items-center">
          <span className="font-quicksand text-[0.78rem] font-semibold text-ink-light mr-1">
            Lọc theo thẻ:
          </span>
          <button
            type="button"
            className={cn(
              "font-quicksand font-semibold text-xs py-1 px-3 border-2 rounded-full cursor-pointer transition-all duration-200 hover:border-grass hover:text-ink",
              activeFilterTag === "__all__"
                ? "bg-grass text-white border-grass"
                : "border-earth/25 bg-card text-ink-light",
            )}
            onClick={() => setActiveFilterTag("__all__")}
          >
            Tất cả{" "}
            <span className="opacity-75 font-medium ml-0.5">
              ({allItems.length})
            </span>
          </button>
          {presetTags.map((t) => (
            <button
              key={t}
              type="button"
              className={cn(
                "font-quicksand font-semibold text-xs py-1 px-3 border-2 rounded-full cursor-pointer transition-all duration-200 hover:border-grass hover:text-ink",
                activeFilterTag === t
                  ? "bg-grass text-white border-grass"
                  : "border-earth/25 bg-card text-ink-light",
              )}
              onClick={() => setActiveFilterTag(t)}
            >
              {t}{" "}
              <span className="opacity-75 font-medium ml-0.5">
                ({tagCounts[t] || 0})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      {allItems.length === 0 ? (
        <div className="text-center p-12 text-ink-light">
          {currentCategory && (
            <GhibliIcon
              type={currentCategory.ico}
              size={60}
              className="!mx-auto !mb-3 !opacity-25"
            />
          )}
          <p className="mt-3 text-[0.95rem] font-medium">
            Chưa có gì ở đây cả... Hãy thêm kỷ niệm đầu tiên nhé!
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center p-12 text-ink-light">
          {currentCategory && (
            <GhibliIcon
              type={currentCategory.ico}
              size={60}
              className="!mx-auto !mb-3 !opacity-25"
            />
          )}
          <p className="mt-3 text-[0.95rem] font-medium">
            Không có mục nào với thẻ &quot;<strong>{activeFilterTag}</strong>
            &quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          {filteredItems.map((item) => (
            <SaveItemCard
              key={item.id}
              item={item}
              categoryIcon={currentCategory?.ico || ""}
              onEdit={startEdit}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
