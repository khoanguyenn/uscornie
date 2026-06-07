"use client";

import { useSearchParams } from "next/navigation";
import { memo } from "react";
import { GIFT_MODES } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

interface GiftDropdownProps {
  isOpen: boolean;
  pathname: string;
  goGift: (modeId: string) => void;
  ddItemBase: string;
  ddItemActive: string;
}

export const GiftDropdown = memo(
  ({
    isOpen,
    pathname,
    goGift,
    ddItemBase,
    ddItemActive,
  }: GiftDropdownProps) => {
    const searchParams = useSearchParams();
    const currentMode = searchParams.get("mode");

    return (
      <div
        className={cn(
          "absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#fffdf7] border border-[#c9a96e]/20 rounded-2xl p-2 min-w-[210px] shadow-[0_10px_36px_rgba(74,64,51,0.12)] transition-all duration-120 ease-out z-[200] opacity-0 pointer-events-none translate-y-1.5",
          isOpen && "opacity-100 pointer-events-auto translate-y-0",
        )}
      >
        {GIFT_MODES.map((m) => (
          <button
            key={m.id}
            className={cn(
              ddItemBase,
              pathname === "/gift" && currentMode === m.id && ddItemActive,
            )}
            onClick={() => goGift(m.id)}
            type="button"
          >
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    );
  },
);

GiftDropdown.displayName = "GiftDropdown";
