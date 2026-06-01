"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { SUGGESTIONS } from "@/lib/data/mock";
import type { SaveItem } from "@/lib/types";

interface SuggestionsCardProps {
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  items: SaveItem[];
  onAddSuggestion: (title: string, desc: string) => void;
}

export default function SuggestionsCard({
  category,
  categoryLabel,
  categoryIcon,
  items,
  onAddSuggestion,
}: SuggestionsCardProps) {
  const [currentSuggestion, setCurrentSuggestion] = useState<{
    n: string;
    d: string;
  } | null>(null);

  const pool = useMemo(() => {
    return SUGGESTIONS[category as keyof typeof SUGGESTIONS] || null;
  }, [category]);

  const isSuggestionAlreadyInList = useMemo(() => {
    if (!currentSuggestion) return false;
    return items.some(
      (i) =>
        i.category === category &&
        i.title.trim().toLowerCase() ===
          currentSuggestion.n.trim().toLowerCase(),
    );
  }, [currentSuggestion, items, category]);

  const pickRandomSuggestion = () => {
    if (!pool?.length) return;

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

  const handleAddSuggestion = () => {
    if (!currentSuggestion) return;
    onAddSuggestion(currentSuggestion.n, currentSuggestion.d);
    alert(`Đã thêm "${currentSuggestion.n}" vào list!`);
  };

  if (!pool) return null;

  return (
    <div className="card bg-gradient-to-br from-[#fef7ec] to-[#fdf0e0] border-2 border-dashed border-[#f4a460]/35">
      <div className="flex justify-between items-center gap-3 flex-wrap mb-3">
        <div className="font-pangolin text-[1.2rem] text-earth flex items-center gap-2">
          <GhibliIcon type="calcifer" size={22} />
          Gợi ý {categoryLabel.toLowerCase()}
        </div>
        <Button size="small" onClick={pickRandomSuggestion}>
          {currentSuggestion ? "Gợi ý khác" : "Bốc thử một quán"}
        </Button>
      </div>

      {currentSuggestion ? (
        <div className="bg-card rounded-[14px] p-4 shadow-sm">
          <div className="font-pangolin text-[1.25rem] text-ink flex items-center gap-2 mb-2">
            <GhibliIcon type={categoryIcon} size={20} />
            {currentSuggestion.n}
          </div>
          <div className="font-quicksand text-[0.9rem] text-ink-light leading-[1.55] mb-3.5">
            {currentSuggestion.d}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button size="small" onClick={handleAddSuggestion}>
              <span className="inline-flex items-center gap-1">
                <GhibliIcon type="heart" size={16} />
                Thêm vào list
              </span>
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={pickRandomSuggestion}
            >
              🔄 Gợi ý khác
            </Button>
          </div>
          {isSuggestionAlreadyInList && (
            <div className="mt-2.5 text-[0.8rem] text-sunset italic text-center">
              Quán này đã có trong list của bạn rồi nhé ✿
            </div>
          )}
        </div>
      ) : (
        <div className="font-quicksand text-[0.88rem] text-ink-light text-center py-[14px] px-2 italic">
          Bấm nút để nhận gợi ý ngẫu nhiên từ {pool.length}{" "}
          {categoryLabel.toLowerCase()} ở Sài Gòn ✿
        </div>
      )}
    </div>
  );
}
