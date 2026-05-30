"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { GIFT_MODES, SAVE_CATEGORIES } from "@/lib/data/mock";
import { cn } from "@/lib/utils/cn";

function NavBarContent() {
  const pathname = usePathname();
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const { get } = searchParams;

  const [openDD, setOpenDD] = useState<string | null>(null);
  const saveDDRef = useRef<HTMLDivElement>(null);
  const giftDDRef = useRef<HTMLDivElement>(null);

  const currentCat = get ? get.call(searchParams, "cat") : null;
  const currentMode = get ? get.call(searchParams, "mode") : null;

  const toggleDD = (name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDD((prev) => (prev === name ? null : name));
  };

  const closeDD = useCallback(() => {
    setOpenDD(null);
  }, []);

  const closeRef = useRef(closeDD);
  useEffect(() => {
    closeRef.current = closeDD;
  }, [closeDD]);

  useEffect(() => {
    const handleWindowClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        saveDDRef.current?.contains(target) ||
        giftDDRef.current?.contains(target)
      ) {
        return;
      }
      closeRef.current();
    };
    window.addEventListener("click", handleWindowClick);
    return () => {
      window.removeEventListener("click", handleWindowClick);
    };
  }, []);

  const goSave = (catId: string) => {
    setOpenDD(null);
    push(`/save?cat=${catId}`);
  };

  const goGift = (modeId: string) => {
    setOpenDD(null);
    push(`/gift?mode=${modeId}`);
  };

  const btnBase =
    "font-quicksand font-semibold text-[0.85rem] px-[18px] py-2 border-2 border-transparent rounded-[24px] bg-[#fffdf7]/88 text-[#7a7060] cursor-pointer transition-all duration-300 backdrop-blur-[4px] flex items-center gap-1.5 hover:bg-[#fffdf7] hover:text-[#4a4033] hover:border-[#8cb78c] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(74,64,51,0.08)]";
  const btnActive =
    "bg-[#8cb78c] text-white border-[#8cb78c] shadow-[0_4px_16px_rgba(140,183,140,0.3)] hover:bg-[#8cb78c] hover:text-white hover:border-[#8cb78c]";

  const ddItemBase =
    "font-quicksand font-semibold text-[0.83rem] px-3.5 py-2.25 rounded-xl text-[#7a7060] cursor-pointer transition-all duration-200 flex items-center gap-2 w-full border-none bg-none text-left hover:bg-[#8cb78c]/10 hover:text-[#4a4033]";
  const ddItemActive =
    "bg-[#8cb78c] text-white hover:bg-[#8cb78c] hover:text-white";

  return (
    <nav className="relative z-[100] flex justify-center px-5 pt-2 pb-[18px] gap-1.5 flex-wrap">
      {/* Trang chủ */}
      <div className="relative">
        <Link href="/" className={cn(btnBase, pathname === "/" && btnActive)}>
          <GhibliIcon type="totoro" size={20} className="size-5 shrink-0" />
          <span>Trang chủ</span>
        </Link>
      </div>

      {/* Lưu mọi thứ (Dropdown) */}
      <div className="relative" ref={saveDDRef}>
        <button
          className={cn(btnBase, pathname === "/save" && btnActive)}
          onClick={(e) => toggleDD("save", e)}
          type="button"
        >
          <GhibliIcon type="soot" size={20} className="size-5 shrink-0" />
          <span>Lưu mọi thứ</span>
          <span
            className={cn(
              "text-[0.55rem] transition-transform duration-150 ease-out ml-0.5",
              openDD === "save" && "rotate-180",
            )}
          >
            ▼
          </span>
        </button>
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#fffdf7] border border-[#c9a96e]/20 rounded-2xl p-2 min-w-[210px] shadow-[0_10px_36px_rgba(74,64,51,0.12)] transition-all duration-120 ease-out z-[200] opacity-0 pointer-events-none translate-y-1.5",
            openDD === "save" &&
              "opacity-100 pointer-events-auto translate-y-0",
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
      </div>

      {/* Ngày bên nhau */}
      <div className="relative">
        <Link
          href="/calendar"
          className={cn(btnBase, pathname === "/calendar" && btnActive)}
        >
          <GhibliIcon type="heart" size={20} className="size-5 shrink-0" />
          <span>Ngày bên nhau</span>
        </Link>
      </div>

      {/* Gợi ý quà (Dropdown) */}
      <div className="relative" ref={giftDDRef}>
        <button
          className={cn(btnBase, pathname === "/gift" && btnActive)}
          onClick={(e) => toggleDD("gift", e)}
          type="button"
        >
          <GhibliIcon type="calcifer" size={20} className="size-5 shrink-0" />
          <span>Gợi ý quà</span>
          <span
            className={cn(
              "text-[0.55rem] transition-transform duration-150 ease-out ml-0.5",
              openDD === "gift" && "rotate-180",
            )}
          >
            ▼
          </span>
        </button>
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[#fffdf7] border border-[#c9a96e]/20 rounded-2xl p-2 min-w-[210px] shadow-[0_10px_36px_rgba(74,64,51,0.12)] transition-all duration-120 ease-out z-[200] opacity-0 pointer-events-none translate-y-1.5",
            openDD === "gift" &&
              "opacity-100 pointer-events-auto translate-y-0",
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
      </div>

      {/* Gợi ý hẹn hò */}
      <div className="relative">
        <Link
          href="/date"
          className={cn(btnBase, pathname === "/date" && btnActive)}
        >
          <GhibliIcon type="soot" size={20} className="size-5 shrink-0" />
          <span>Gợi ý hẹn hò</span>
        </Link>
      </div>
    </nav>
  );
}

export default function NavBar() {
  return (
    <Suspense
      fallback={
        <div className="font-quicksand font-bold text-center text-[#7a7060] p-4">
          Loading…
        </div>
      }
    >
      <NavBarContent />
    </Suspense>
  );
}
