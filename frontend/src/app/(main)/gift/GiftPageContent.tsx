"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/icons/GhibliIcon";
import { EXCEL_GIFTS, OCCASIONS } from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";

interface GiftSuggestion {
  title: string;
  reason?: string;
  desc?: string;
  image?: string | null;
}

function GiftPageContentInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const loadData = useDataStore((s) => s.loadData);
  const items = useDataStore((s) => s.items);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const giftMode = searchParams.get("mode") || "random";
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
    router.push(`${pathname}?${params.toString()}`);
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
      setGiftRes({ title: item, reason: "" });
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
    setGiftRes({
      title: item.title,
      desc: item.desc,
      image: item.image,
    });
  };

  // Reset when mode changes
  useEffect(() => {
    setGiftRes(null);
    setSelOcc(null);
    setSelGender(null);
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="page-title">
        <span className="pt-ico">
          <GhibliIcon type="calcifer" size={32} />
        </span>
        Gợi ý quà tặng
      </h2>

      {/* Mode Tabs */}
      <div className="gift-mode-tabs">
        <button
          className={`gift-mode-tab ${giftMode === "random" ? "active" : ""}`}
          onClick={() => swGM("random")}
          type="button"
        >
          Gợi ý ngẫu nhiên
        </button>
        <button
          className={`gift-mode-tab ${giftMode === "wishlist" ? "active" : ""}`}
          onClick={() => swGM("wishlist")}
          type="button"
        >
          Gợi ý từ Wishlist
        </button>
      </div>

      {/* Random Mode View */}
      {giftMode === "random" && (
        <div>
          <p
            style={{
              textAlign: "center",
              color: "var(--ink-light)",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Chọn dịp và đối tượng để nhận gợi ý nha 🎁
          </p>

          <p
            style={{
              textAlign: "center",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            🎉 Dịp đặc biệt
          </p>

          <div className="occasion-grid" style={{ marginBottom: "20px" }}>
            {OCCASIONS.map((o) => (
              <div
                key={o.id}
                className={`occasion-card ${selOcc === o.id ? "selected" : ""}`}
                onClick={() => selO(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selO(o.id);
                }}
                tabIndex={0}
                role="button"
              >
                <div className="occasion-name">{o.name}</div>
              </div>
            ))}
          </div>

          <p
            style={{
              textAlign: "center",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              margin: "20px 0 10px",
            }}
          >
            🎁 Tặng cho ai?
          </p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: "24px",
            }}
          >
            {genders.map((g) => (
              <button
                key={g.id}
                onClick={() => selGnd(g.id)}
                type="button"
                style={{
                  fontFamily: "'Quicksand',sans-serif",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  padding: "10px 22px",
                  borderRadius: "24px",
                  border: `2px solid ${
                    selGender === g.id ? "var(--sunset)" : "var(--earth)"
                  }`,
                  background:
                    selGender === g.id ? "var(--sunset)" : "var(--card)",
                  color: selGender === g.id ? "white" : "var(--ink)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow:
                    selGender === g.id
                      ? "0 4px 14px rgba(244,164,96,0.35)"
                      : "none",
                }}
              >
                {g.label}
              </button>
            ))}
          </div>

          {selOcc && selGender && (
            <div style={{ textAlign: "center", margin: "4px 0 24px" }}>
              <button
                className="btn btn-primary"
                onClick={doRG}
                type="button"
                style={{
                  padding: "14px 40px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                ✨ Gợi ý giúp mình
              </button>
            </div>
          )}

          {/* Suggestion Result */}
          {giftRes && (
            <div className="gift-result">
              <div className="gift-label">
                Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""} ·{" "}
                {genders.find((g) => g.id === selGender)?.label || ""}:
              </div>
              <div
                className="gift-name"
                style={{ fontSize: "1.5rem", margin: "12px 0" }}
              >
                {giftRes.title}
              </div>
              {giftRes.reason && (
                <div
                  className="gift-desc"
                  style={{ marginTop: "6px", fontStyle: "italic" }}
                >
                  💬 {giftRes.reason}
                </div>
              )}
              <div style={{ marginTop: "20px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={doRG}
                  type="button"
                  style={{ cursor: "pointer" }}
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
          <p
            style={{
              textAlign: "center",
              color: "var(--ink-light)",
              fontWeight: 500,
              marginBottom: "16px",
            }}
          >
            Chọn dịp đặc biệt để bốc quà từ Wishlist
          </p>

          <div className="occasion-grid" style={{ marginBottom: "20px" }}>
            {OCCASIONS.map((o) => (
              <div
                key={o.id}
                className={`occasion-card ${selOcc === o.id ? "selected" : ""}`}
                onClick={() => selO(o.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") selO(o.id);
                }}
                tabIndex={0}
                role="button"
              >
                <div className="occasion-name">{o.name}</div>
              </div>
            ))}
          </div>

          {selOcc && wishlistItems.length > 0 && (
            <div style={{ textAlign: "center", margin: "20px 0" }}>
              <button
                className="btn btn-primary"
                onClick={doWG}
                type="button"
                style={{
                  padding: "14px 36px",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                Bốc quà từ Wishlist
              </button>
            </div>
          )}

          {/* Wishlist Result */}
          {giftRes && wishlistItems.length > 0 && (
            <div className="gift-result">
              <div className="gift-label">
                Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""}:
              </div>
              <div className="gift-name">{giftRes.title}</div>
              {giftRes.desc && <div className="gift-desc">{giftRes.desc}</div>}
              {giftRes.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={giftRes.image}
                  alt={giftRes.title}
                  style={{
                    maxWidth: "260px",
                    borderRadius: "14px",
                    marginTop: "16px",
                    boxShadow: "0 4px 16px var(--shadow)",
                  }}
                />
              )}
              <div style={{ marginTop: "16px" }}>
                <button
                  className="btn btn-secondary"
                  onClick={doWG}
                  type="button"
                  style={{ cursor: "pointer" }}
                >
                  Bốc lại
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {wishlistItems.length === 0 && (
            <div className="empty-state">
              <GhibliIcon
                type="soot"
                size={60}
                style={{ opacity: 0.25, margin: "0 auto 12px" }}
              />
              <p style={{ marginTop: "12px" }}>
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

export default function GiftPageContent() {
  return (
    <Suspense fallback={<div className="loading">Đang tải...</div>}>
      <GiftPageContentInner />
    </Suspense>
  );
}
