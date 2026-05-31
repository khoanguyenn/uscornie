"use client";

import { useMemo, useState } from "react";
import QuickAddCard from "@/components/save/QuickAddCard";
import SaveItemCard from "@/components/save/SaveItemCard";
import SaveItemForm, {
  type SaveItemFormValues,
} from "@/components/save/SaveItemForm";

import SuggestionsCard from "@/components/save/SuggestionsCard";
import TagFilter from "@/components/save/TagFilter";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { SAVE_CATEGORIES, TAGS_BY_CATEGORY } from "@/lib/data/mock";
import { useSaveItems } from "@/lib/hooks/useSaveItems";
import type { SaveItem } from "@/lib/types";

interface SaveCategoryContentProps {
  category: string;
}

export default function SaveCategoryContent({
  category,
}: SaveCategoryContentProps) {
  // Leverage custom hooks to handle sync, auth state, and fallback stores
  const {
    allItems,
    categoryItems,
    addItem,
    updateItem,
    deleteItem,
    bulkImport,
    isLoading,
  } = useSaveItems(category);

  const [editingItem, setEditingItem] = useState<SaveItem | null>(null);
  const [activeFilterTag, setActiveFilterTag] = useState("__all__");

  const currentCategory = useMemo(
    () => SAVE_CATEGORIES.find((c) => c.id === category),
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

  // Filter items by selected tag
  const filteredItems = useMemo(() => {
    if (activeFilterTag === "__all__") return categoryItems;
    return categoryItems.filter((i) => (i.tag || "") === activeFilterTag);
  }, [categoryItems, activeFilterTag]);

  // Handle form submission (new or updated items)
  const handleFormSubmit = async (
    values: SaveItemFormValues,
    image: string | null,
  ) => {
    const itemData = {
      title: values.title.trim(),
      desc: values.desc?.trim() || "",
      tag: values.tag || "",
      image: image,
    };

    if (editingItem) {
      await updateItem(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      await addItem(itemData);
    }
  };

  const startEdit = (idVal: string) => {
    const item = categoryItems.find((x) => x.id === idVal);
    if (item) {
      setEditingItem(item);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteItem = async (idVal: string) => {
    if (confirm("Bạn có chắc chắn muốn xoá mục này?")) {
      await deleteItem(idVal);
      if (editingItem?.id === idVal) {
        setEditingItem(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="font-quicksand font-bold text-center text-ink-light p-10">
        Đang tải…
      </div>
    );
  }

  return (
    <div>
      {/* 1. Add / Edit form */}
      <SaveItemForm
        key={editingItem?.id || "new"}
        category={category}
        editingItem={editingItem}
        onSubmit={handleFormSubmit}
        onCancel={() => setEditingItem(null)}
      />

      {/* 2. Suggestions list */}
      <SuggestionsCard
        key={category}
        category={category}
        categoryLabel={currentCategory?.label || ""}
        categoryIcon={currentCategory?.ico || ""}
        items={allItems}
        onAddSuggestion={(title, desc) =>
          addItem({ title, desc, tag: "", image: null })
        }
      />

      {/* 3. Bulk import */}
      <QuickAddCard
        presetTags={presetTags}
        hasFile={hasFile}
        onImported={bulkImport}
      />

      {/* 4. Filter by tags */}
      <TagFilter
        presetTags={presetTags}
        activeFilterTag={activeFilterTag}
        allItems={categoryItems}
        onSelectTag={setActiveFilterTag}
      />

      {/* 5. Render list of items */}
      {categoryItems.length === 0 ? (
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
