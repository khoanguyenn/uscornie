import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import type React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { HINTS, SAVE_CATEGORIES, TAGS_BY_CATEGORY } from "@/lib/data/mock";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import type { SaveItem } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const saveItemSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề!"),
  desc: z.string().optional(),
  tag: z.string().optional(),
});

export type SaveItemFormValues = z.infer<typeof saveItemSchema>;

interface SaveItemFormProps {
  category: string;
  editingItem: SaveItem | null;
  onSubmit: (values: SaveItemFormValues, image: string | null) => void;
  onCancel: () => void;
}

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

export default function SaveItemForm({
  category,
  editingItem,
  onSubmit,
  onCancel,
}: SaveItemFormProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [imagePreview, setImagePreview] = useState<string | null>(
    editingItem?.image || null,
  );

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
      title: editingItem?.title || "",
      desc: editingItem?.desc || "",
      tag: editingItem?.tag || "",
    },
  });

  const formTag = watch("tag");

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

  const handleFormSubmit = (values: SaveItemFormValues) => {
    onSubmit(values, imagePreview);
    reset({
      title: "",
      desc: "",
      tag: "",
    });
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="card">
      <div className="font-pangolin text-[1.2rem] text-earth mb-3.5 flex items-center gap-2">
        {currentCategory && <GhibliIcon type={currentCategory.ico} size={24} />}
        {editingItem ? "Sửa mục:" : "Thêm vào:"} {currentCategory?.label}
      </div>

      <Input
        id="title-input"
        label="Tiêu đề"
        {...register("title")}
        placeholder={hints.t}
        error={errors.title?.message}
      />

      <Textarea
        id="desc-input"
        label="Mô tả"
        {...register("desc")}
        placeholder={hints.d}
      />

      <div className="mb-4">
        <span className="block font-semibold text-[0.9rem] text-ink mb-1.5">
          Gắn thẻ
        </span>
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

      {!isAuthenticated && (
        <div className="mb-4">
          <label
            className="inline-flex items-center gap-2 font-quicksand font-semibold text-[0.85rem] py-2.5 px-5 border-2 border-dashed border-earth rounded-xl bg-cream text-ink-light cursor-pointer transition-all duration-300 hover:border-grass hover:text-grass-dark"
            htmlFor="if"
          >
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
      )}

      <div className="flex gap-2.5 mt-2">
        <Button type="submit">Lưu lại</Button>
        {editingItem && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Huỷ
          </Button>
        )}
      </div>
    </form>
  );
}
