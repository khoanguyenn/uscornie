"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { OCCASIONS } from "@/lib/data/mock";
import type { GiftSuggestion } from "./GiftRandomMode";

interface GiftWishlistModeProps {
  selOcc: string | null;
  onSelectOccasion: (id: string) => void;
  wishlistItems: Array<{
    id: string;
    title: string;
    desc?: string;
    image?: string | null;
  }>;
  giftRes: GiftSuggestion | null;
  onGenerate: () => void;
}

export function GiftWishlistMode({
  selOcc,
  onSelectOccasion,
  wishlistItems,
  giftRes,
  onGenerate,
}: GiftWishlistModeProps) {
  return (
    <div>
      <p className="text-center text-ink-light font-medium mb-4">
        Chọn dịp đặc biệt để bốc quà từ Wishlist
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 mb-5">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`rounded-[14px] p-[20px_12px] text-center cursor-pointer transition-all duration-300 border-2 hover:border-grass hover:-translate-y-1 hover:shadow-md ${
              selOcc === o.id
                ? "border-sunset bg-petal"
                : "border-earth/20 bg-card"
            }`}
            onClick={() => onSelectOccasion(o.id)}
          >
            <div className="font-pangolin text-[1.15rem] text-ink mt-1">
              {o.name}
            </div>
          </button>
        ))}
      </div>

      {selOcc && wishlistItems.length > 0 && (
        <div className="text-center my-5">
          <Button
            className="!py-3.5 !px-9 text-[1rem]"
            onClick={onGenerate}
            type="button"
          >
            Bốc quà từ Wishlist
          </Button>
        </div>
      )}

      {/* Wishlist Result */}
      {giftRes && wishlistItems.length > 0 && (
        <div className="mt-6 p-8 bg-gradient-to-br from-cream to-petal rounded-[20px] border-2 border-earth animate-[popIn_0.5s_ease] text-center">
          <div className="text-[0.85rem] text-ink-light font-semibold mb-2">
            Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""}:
          </div>
          <div className="font-pangolin text-3xl text-ink">{giftRes.title}</div>
          {giftRes.desc && (
            <div className="text-[0.9rem] text-ink-light mt-2">
              {giftRes.desc}
            </div>
          )}
          {giftRes.image && (
            <Image
              src={giftRes.image}
              alt={giftRes.title}
              width={260}
              height={180}
              className="rounded-[14px] mt-4 shadow-md object-cover mx-auto"
            />
          )}
          <div className="mt-4">
            <Button variant="secondary" onClick={onGenerate} type="button">
              Bốc lại
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {wishlistItems.length === 0 && (
        <div className="text-center p-12 text-ink-light">
          <GhibliIcon
            type="soot"
            size={60}
            className="!opacity-25 !mx-auto !mb-3"
          />
          <p className="text-[0.95rem] font-medium mt-3">
            Wishlist đang trống. Hãy thêm vào mục &quot;Wishlist quà tặng&quot;
            trước nhé!
          </p>
        </div>
      )}
    </div>
  );
}
