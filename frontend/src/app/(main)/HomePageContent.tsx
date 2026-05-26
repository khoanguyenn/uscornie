"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/icons/GhibliIcon";
import { spaceService } from "@/services/spaceService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/useDataStore";
import type { Space } from "@/types";

export default function HomePageContent() {
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const loadData = useDataStore((s) => s.loadData);
  const items = useDataStore((s) => s.items);
  const anniversaryDate = useDataStore((s) => s.anniversaryDate);

  const [inviteLink, setInviteLink] = useState("");

  // Load local data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch user spaces from API
  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["spaces"],
    queryFn: spaceService.fetchMySpaces,
    enabled: isAuthenticated,
    retry: 1,
  });

  // Create Space mutation
  const createSpaceMutation = useMutation({
    mutationFn: spaceService.createSpace,
    onSuccess: (newSpace) => {
      queryClient.setQueryData(["spaces"], (oldSpaces: Space[] = []) => [
        ...oldSpaces,
        newSpace,
      ]);
    },
    onError: () => {
      alert("Lỗi khi tạo không gian");
    },
  });

  // Generate Invite mutation
  const generateInviteMutation = useMutation({
    mutationFn: spaceService.generateInvite,
    onSuccess: (data) => {
      const fullUrl = `${window.location.origin}${data.url}`;
      setInviteLink(fullUrl);
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
    onError: () => {
      alert("Lỗi khi tạo link mời");
    },
  });

  // Compute Ghibli stats
  const stats = useMemo(() => {
    let days = "?";
    if (anniversaryDate) {
      const start = new Date(anniversaryDate);
      const now = new Date();
      days = Math.max(
        0,
        Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      ).toString();
    }

    const totalSaved = items.length;
    const wishlistCount = items.filter((i) => i.category === "wishlist").length;

    return [
      {
        label: "Kỷ niệm đã lưu",
        value: totalSaved,
        ico: "soot",
        color: "var(--grass)",
      },
      {
        label: "Điều ước Wishlist",
        value: wishlistCount,
        ico: "calcifer",
        color: "var(--sunset)",
      },
      {
        label: "Ngày bên nhau",
        value: days,
        ico: "heart",
        color: "var(--water)",
      },
    ];
  }, [items, anniversaryDate]);

  if (isLoading) {
    return <div className="loading-state">⏳ Đang tải…</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="guest-hero">
        <h2 className="hero-text">
          Gặp gỡ trong <br />
          <span className="text-accent" style={{ color: "var(--sunset)" }}>
            không gian riêng
          </span>
        </h2>
        <p className="hero-sub">
          Nơi lưu giữ những kỷ niệm quý giá nhất chỉ dành cho hai người.
        </p>
      </div>
    );
  }

  return (
    <div className="home-view">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <h2 className="page-title">
          <span className="pt-ico">
            <GhibliIcon type="totoro" size={32} />
          </span>
          Chào mừng trở lại~
        </h2>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          {stats.map((s) => (
            <div key={s.label} className="card stat-card">
              <div className="stat-deco">
                <GhibliIcon type={s.ico} size={35} />
              </div>
              <div
                style={{
                  fontFamily: '"Pangolin", cursive',
                  fontSize: "2.8rem",
                  lineHeight: 1,
                  color: s.color,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  color: "var(--ink-light)",
                  fontSize: "0.88rem",
                  marginTop: "8px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote Card */}
        <div className="card" style={{ marginTop: "20px" }}>
          <p
            style={{
              fontFamily: '"Pangolin", cursive',
              fontSize: "1.4rem",
              color: "var(--ink-light)",
            }}
          >
            &quot;Mỗi khoảnh khắc nhỏ đều đáng được ghi nhớ...&quot;
          </p>
        </div>
      </div>

      {/* Spaces Management */}
      <section className="spaces-section">
        <div className="section-divider" />
        <div className="spaces-container">
          {spaces.map((space: Space) => (
            <div
              key={space.id}
              className="space-item card"
              style={{
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 25px",
              }}
            >
              <div className="space-info">
                <span className="space-name">{space.name}</span>
                <span className={`space-badge ${space.type}`}>
                  {space.type === "personal" ? "Cá nhân" : "Chung"}
                </span>
              </div>
              {space.type === "shared" && (
                <button
                  onClick={() => generateInviteMutation.mutate(space.id)}
                  className="invite-btn"
                  type="button"
                >
                  Tạo Link Mời ❤️
                </button>
              )}
            </div>
          ))}

          {!spaces.some((s: Space) => s.type === "shared") && (
            <div className="no-spaces">
              <p style={{ marginBottom: "12px", color: "var(--ink-light)" }}>
                Bạn chưa có không gian chung nào.
              </p>
              <button
                onClick={() => createSpaceMutation.mutate()}
                className="create-btn"
                type="button"
              >
                Tạo nhà chung
              </button>
            </div>
          )}

          {inviteLink && (
            <div className="invite-display">
              <p className="invite-title">Magic Link đã sẵn sàng!</p>
              <div className="invite-copy-row">
                <input
                  readOnly
                  value={inviteLink}
                  className="invite-input"
                  aria-label="Đường dẫn mời tham gia"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    alert("Đã copy!");
                  }}
                  className="copy-btn"
                  type="button"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
