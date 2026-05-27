"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { EXCEL_GIFTS, OCCASIONS } from "@/lib/data/mock";
import { useDataStore } from "@/lib/providers/data-store-provider";

interface GiftSuggestion {
  title: string;
  reason?: string | undefined;
  desc?: string | undefined;
  image?: string | null | undefined;
}

function GiftPageContentInner() {
  const searchParams = useSearchParams();
  const { get } = searchParams;
  const { push } = useRouter();
  const pathname = usePathname();
  const loadData = useDataStore((s) => s.loadData);
  const items = useDataStore((s) => s.items);

  useEffect(() => {
    document.title = "Gift Planner - Uscornie";
    loadData();
  }, [loadData]);

  const giftMode = (get ? get.call(searchParams, "mode") : null) || "random";
  const [selOcc, setSelOcc] = useState<string | null>(null);
  const [selGender, setSelGender] = useState<string | null>(null);
  const [giftRes, setGiftRes] = useState<GiftSuggestion | null>(null);

  const genders = [
    { id: "female", label: "👧 Nữ" },
    { id: "male", label: "👦 Nam" },
    { id: "unisex", label: "🌈 Unisex" },
  ];

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
        <div>
          <p className="text-center text-ink-light font-medium mb-4">
            Chọn dịp và đối tượng để nhận gợi ý nha 🎁
          </p>

          <p className="text-center text-ink font-bold text-[0.85rem] tracking-wider uppercase mb-2.5">
            🎉 Dịp đặc biệt
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
                onClick={() => selO(o.id)}
              >
                <div className="font-pangolin text-[1.15rem] text-ink mt-1">
                  {o.name}
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-ink font-bold text-[0.85rem] tracking-wider uppercase my-5 mb-2.5">
            🎁 Tặng cho ai?
          </p>

          <div className="flex gap-2.5 justify-center flex-wrap mb-6">
            {genders.map((g) => (
              <button
                key={g.id}
                onClick={() => selGnd(g.id)}
                type="button"
                className={`font-quicksand font-bold text-[0.95rem] py-2.5 px-[22px] rounded-[24px] border-2 cursor-pointer transition-all duration-200 ${
                  selGender === g.id
                    ? "border-sunset bg-sunset text-white shadow-[0_4px_14px_rgba(244,164,96,0.35)]"
                    : "border-earth bg-card text-ink"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {selOcc && selGender && (
            <div className="text-center my-1 mb-6">
              <button
                className="btn btn-primary !py-3.5 !px-10 text-[1rem] cursor-pointer"
                onClick={doRG}
                type="button"
              >
                ✨ Gợi ý giúp mình
              </button>
            </div>
          )}

          {/* Suggestion Result */}
          {giftRes && (
            <div className="mt-6 p-8 bg-gradient-to-br from-cream to-petal rounded-[20px] border-2 border-earth animate-[popIn_0.5s_ease] text-center">
              <div className="text-[0.85rem] text-ink-light font-semibold mb-2">
                Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""} ·{" "}
                {genders.find((g) => g.id === selGender)?.label || ""}:
              </div>
              <div className="font-pangolin text-2xl text-ink my-3">
                {giftRes.title}
              </div>
              {giftRes.reason && (
                <div className="text-[0.9rem] text-ink-light mt-2 italic">
                  💬 {giftRes.reason}
                </div>
              )}
              <div className="mt-5">
                <button
                  className="btn btn-secondary cursor-pointer"
                  onClick={doRG}
                  type="button"
                >
                  🔄 Gợi ý khác
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Wishlist Mode View */}
      {giftMode === "wishlist" && (
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
                onClick={() => selO(o.id)}
              >
                <div className="font-pangolin text-[1.15rem] text-ink mt-1">
                  {o.name}
                </div>
              </button>
            ))}
          </div>

          {selOcc && wishlistItems.length > 0 && (
            <div className="text-center my-5">
              <button
                className="btn btn-primary !py-3.5 !px-9 text-[1rem] cursor-pointer"
                onClick={doWG}
                type="button"
              >
                Bốc quà từ Wishlist
              </button>
            </div>
          )}

          {/* Wishlist Result */}
          {giftRes && wishlistItems.length > 0 && (
            <div className="mt-6 p-8 bg-gradient-to-br from-cream to-petal rounded-[20px] border-2 border-earth animate-[popIn_0.5s_ease] text-center">
              <div className="text-[0.85rem] text-ink-light font-semibold mb-2">
                Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""}:
              </div>
              <div className="font-pangolin text-3xl text-ink">
                {giftRes.title}
              </div>
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
                <button
                  className="btn btn-secondary cursor-pointer"
                  onClick={doWG}
                  type="button"
                >
                  Bốc lại
                </button>
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
                Wishlist đang trống. Hãy thêm vào mục &quot;Wishlist quà
                tặng&quot; trước nhé!
              </p>
            </div>
          )}
        </div>
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
