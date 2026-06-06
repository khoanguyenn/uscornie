"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { cn } from "@/lib/utils/cn";
import { GiftDropdown } from "./navbar/GiftDropdown";
import { SaveDropdown } from "./navbar/SaveDropdown";

function NavBarContent() {
  const pathname = usePathname();
  const { push } = useRouter();

  const [openDD, setOpenDD] = useState<string | null>(null);
  const saveDDRef = useRef<HTMLDivElement>(null);
  const giftDDRef = useRef<HTMLDivElement>(null);

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

  const goSave = useCallback(
    (catId: string) => {
      setOpenDD(null);
      push(`/save?cat=${catId}`);
    },
    [push],
  );

  const goGift = useCallback(
    (modeId: string) => {
      setOpenDD(null);
      push(`/gift?mode=${modeId}`);
    },
    [push],
  );

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
        <SaveDropdown
          isOpen={openDD === "save"}
          pathname={pathname}
          goSave={goSave}
          ddItemBase={ddItemBase}
          ddItemActive={ddItemActive}
        />
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
        <GiftDropdown
          isOpen={openDD === "gift"}
          pathname={pathname}
          goGift={goGift}
          ddItemBase={ddItemBase}
          ddItemActive={ddItemActive}
        />
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
