"use client";

import { useSearchParams } from "next/navigation";
import { memo } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { SAVE_CATEGORIES } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

interface SaveDropdownProps {
  isOpen: boolean;
  pathname: string;
  goSave: (catId: string) => void;
  ddItemBase: string;
  ddItemActive: string;
}

export const SaveDropdown = memo(
  ({
    isOpen,
    pathname,
    goSave,
    ddItemBase,
    ddItemActive,
  }: SaveDropdownProps) => {
    const searchParams = useSearchParams();
    const { get } = searchParams;
    const currentCat = get ? get.call(searchParams, "cat") : null;

    return (
      <div
        className={cn(
          "absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#fffdf7] border border-[#c9a96e]/20 rounded-2xl p-2 min-w-[210px] shadow-[0_10px_36px_rgba(74,64,51,0.12)] transition-all duration-120 ease-out z-[200] opacity-0 pointer-events-none translate-y-1.5",
          isOpen && "opacity-100 pointer-events-auto translate-y-0",
        )}
      >
        {SAVE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={cn(
              ddItemBase,
              pathname === "/save" && currentCat === c.id && ddItemActive,
            )}
            onClick={() => goSave(c.id)}
            type="button"
          >
            <GhibliIcon
              type={c.ico}
              size={18}
              className="size-[18px] shrink-0"
            />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    );
  },
);

SaveDropdown.displayName = "SaveDropdown";
