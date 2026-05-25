"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { GIFT_MODES, SAVE_CATEGORIES } from "@/data/mock";
import GhibliIcon from "./icons/GhibliIcon";

function NavBarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openDD, setOpenDD] = useState<string | null>(null);

  const currentCat = searchParams ? searchParams.get("cat") : null;
  const currentMode = searchParams ? searchParams.get("mode") : null;

  const toggleDD = (name: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setOpenDD((prev) => (prev === name ? null : name));
  };

  const closeDD = useCallback(() => {
    setOpenDD(null);
  }, []);

  useEffect(() => {
    window.addEventListener("click", closeDD);
    return () => {
      window.removeEventListener("click", closeDD);
    };
  }, [closeDD]);

  const goSave = (catId: string) => {
    setOpenDD(null);
    router.push(`/save?cat=${catId}`);
  };

  const goGift = (modeId: string) => {
    setOpenDD(null);
    router.push(`/gift?mode=${modeId}`);
  };

  return (
    <nav className="nav-bar">
      {/* Trang chủ */}
      <div className="nav-item">
        <Link
          href="/"
          className={`nav-btn ${pathname === "/" ? "active" : ""}`}
        >
          <GhibliIcon type="totoro" size={20} className="nav-ico" />
          <span>Trang chủ</span>
        </Link>
      </div>

      {/* Lưu mọi thứ (Dropdown) */}
      <div
        className={`nav-item ${openDD === "save" ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`nav-btn ${pathname === "/save" ? "active" : ""}`}
          onClick={(e) => toggleDD("save", e)}
          type="button"
        >
          <GhibliIcon type="soot" size={20} className="nav-ico" />
          <span>Lưu mọi thứ</span>
          <span className="arrow">▼</span>
        </button>
        <div className="nav-dropdown">
          {SAVE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`dd-item ${
                pathname === "/save" && currentCat === c.id ? "active" : ""
              }`}
              onClick={() => goSave(c.id)}
              type="button"
            >
              <GhibliIcon type={c.ico} size={18} className="dd-ico" />
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ngày bên nhau */}
      <div className="nav-item">
        <Link
          href="/calendar"
          className={`nav-btn ${pathname === "/calendar" ? "active" : ""}`}
        >
          <GhibliIcon type="heart" size={20} className="nav-ico" />
          <span>Ngày bên nhau</span>
        </Link>
      </div>

      {/* Gợi ý quà (Dropdown) */}
      <div
        className={`nav-item ${openDD === "gift" ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`nav-btn ${pathname === "/gift" ? "active" : ""}`}
          onClick={(e) => toggleDD("gift", e)}
          type="button"
        >
          <GhibliIcon type="calcifer" size={20} className="nav-ico" />
          <span>Gợi ý quà</span>
          <span className="arrow">▼</span>
        </button>
        <div className="nav-dropdown">
          {GIFT_MODES.map((m) => (
            <button
              key={m.id}
              className={`dd-item ${
                pathname === "/gift" && currentMode === m.id ? "active" : ""
              }`}
              onClick={() => goGift(m.id)}
              type="button"
            >
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gợi ý hẹn hò */}
      <div className="nav-item">
        <Link
          href="/date"
          className={`nav-btn ${pathname === "/date" ? "active" : ""}`}
        >
          <GhibliIcon type="soot" size={20} className="nav-ico" />
          <span>Gợi ý hẹn hò</span>
        </Link>
      </div>
    </nav>
  );
}

export default function NavBar() {
  return (
    <Suspense fallback={<div className="nav-bar-loading">Loading...</div>}>
      <NavBarContent />
    </Suspense>
  );
}
