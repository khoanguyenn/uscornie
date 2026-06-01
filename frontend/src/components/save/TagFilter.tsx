import type { SaveItem } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface TagFilterProps {
  presetTags: string[];
  activeFilterTag: string;
  allItems: SaveItem[];
  onSelectTag: (tag: string) => void;
}

export default function TagFilter({
  presetTags,
  activeFilterTag,
  allItems,
  onSelectTag,
}: TagFilterProps) {
  // Return early if there are no items or preset tags to filter by
  if (allItems.length === 0 || presetTags.length === 0) {
    return null;
  }

  // Count occurrences of each preset tag in all items
  const tagCounts: Record<string, number> = {};
  for (const tag of presetTags) {
    tagCounts[tag] = allItems.filter((i) => (i.tag || "") === tag).length;
  }

  return (
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
        onClick={() => onSelectTag("__all__")}
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
          onClick={() => onSelectTag(t)}
        >
          {t}{" "}
          <span className="opacity-75 font-medium ml-0.5">
            ({tagCounts[t] || 0})
          </span>
        </button>
      ))}
    </div>
  );
}
