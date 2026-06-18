"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { GiftSuggestion } from "@/components/gift/GiftRandomMode";
import { GiftRandomMode } from "@/components/gift/GiftRandomMode";
import { GiftWishlistMode } from "@/components/gift/GiftWishlistMode";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { EXCEL_GIFTS } from "@/lib/data/mock";
import { useSaveItems } from "@/lib/hooks/useSaveItems";

const genders = [
  { id: "female", label: "👧 Nữ" },
  { id: "male", label: "👦 Nam" },
  { id: "unisex", label: "🌈 Unisex" },
];

function GiftPageContentInner() {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const { allItems: items } = useSaveItems();

  useEffect(() => {
    document.title = "Gift Planner - Uscornie";
  }, []);

  const giftMode = searchParams.get("mode") || "random";
  const [selOcc, setSelOcc] = useState<string | null>(null);
  const [selGender, setSelGender] = useState<string | null>(null);
  const [giftRes, setGiftRes] = useState<GiftSuggestion | null>(null);

  const swGM = (m: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", m);
    push(`${pathname}?${params.toString()}`);
    setGiftRes(null);
    setSelOcc(null);
    setSelGender(null);
  };

  const selO = (id: string) => {
    setSelOcc(id);
    setGiftRes(null);
  };

  const selGnd = (id: string) => {
    setSelGender(id);
    setGiftRes(null);
  };

  const doRG = () => {
    if (!selOcc || !selGender) return;
    const occData = EXCEL_GIFTS[selOcc as keyof typeof EXCEL_GIFTS] as Record<
      string,
      string[]
    >;
    const pool = occData ? occData[selGender] || [] : [];
    if (!pool.length) {
      setGiftRes({ title: "Chưa có gợi ý cho lựa chọn này 🙈", reason: "" });
    } else {
      const item = pool[Math.floor(Math.random() * pool.length)];
      if (item !== undefined) {
        setGiftRes({ title: item, reason: "" });
      }
    }
  };

  const wishlistItems = useMemo(
    () => items.filter((i) => i.category === "wishlist"),
    [items],
  );

  const doWG = () => {
    if (!wishlistItems.length) return;
    const item =
      wishlistItems[Math.floor(Math.random() * wishlistItems.length)];
    if (item !== undefined) {
      setGiftRes({
        title: item.title,
        desc: item.desc,
        image: item.image,
      });
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <h2 className="font-pangolin text-[1.9rem] text-ink mb-5 pb-2.5 border-b-2 border-dashed border-earth inline-flex items-center gap-2.5">
        <span className="size-8">
          <GhibliIcon type="calcifer" size={32} />
        </span>
        Gợi ý quà tặng
      </h2>

      {/* Mode Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 justify-center items-center sm:items-stretch mb-6">
        <button
          className={`font-quicksand font-bold text-[0.88rem] py-2.5 px-6 rounded-[24px] border-2 cursor-pointer transition-all duration-250 hover:border-grass hover:text-ink hover:-translate-y-0.5 ${
            giftMode === "random"
              ? "bg-sunset text-white border-sunset shadow-[0_4px_16px_rgba(244,164,96,0.3)]"
              : "bg-card text-ink-light border-earth"
          }`}
          onClick={() => swGM("random")}
          type="button"
        >
          Gợi ý ngẫu nhiên
        </button>
        <button
          className={`font-quicksand font-bold text-[0.88rem] py-2.5 px-6 rounded-[24px] border-2 cursor-pointer transition-all duration-250 hover:border-grass hover:text-ink hover:-translate-y-0.5 ${
            giftMode === "wishlist"
              ? "bg-sunset text-white border-sunset shadow-[0_4px_16px_rgba(244,164,96,0.3)]"
              : "bg-card text-ink-light border-earth"
          }`}
          onClick={() => swGM("wishlist")}
          type="button"
        >
          Gợi ý từ Wishlist
        </button>
      </div>

      {/* Random Mode View */}
      {giftMode === "random" && (
        <GiftRandomMode
          selOcc={selOcc}
          selGender={selGender}
          genders={genders}
          onSelectOccasion={selO}
          onSelectGender={selGnd}
          onGenerate={doRG}
          giftRes={giftRes}
        />
      )}

      {/* Wishlist Mode View */}
      {giftMode === "wishlist" && (
        <GiftWishlistMode
          selOcc={selOcc}
          onSelectOccasion={selO}
          wishlistItems={wishlistItems}
          giftRes={giftRes}
          onGenerate={doWG}
        />
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="font-quicksand font-bold text-center text-[#7a7060] p-10">
          Đang tải…
        </div>
      }
    >
      <GiftPageContentInner />
    </Suspense>
  );
}
