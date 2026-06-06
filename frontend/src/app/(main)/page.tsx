"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { spaceService } from "@/lib/services/spaceService";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDataActions, useDataStore } from "@/lib/stores/useDataStore";
import type { Space } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export default function Page() {
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { loadData } = useDataActions();
  const items = useDataStore((s) => s.items);
  const anniversaryDate = useDataStore((s) => s.anniversaryDate);

  const [inviteLink, setInviteLink] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load local data on mount and set title
  useEffect(() => {
    setMounted(true);
    document.title = "Home - Uscornie";
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

  // Render stable loading fallback if not mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-[800px] mx-auto min-h-[400px] flex items-center justify-center">
        <GhibliIcon type="soot" size={48} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-[100px] text-2xl font-pangolin text-center">
        ⏳ Đang tải…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="py-15 px-5 text-center">
        <h2 className="text-[2.5rem] font-extrabold text-ink leading-tight">
          Gặp gỡ trong <br />
          <span className="text-sunset">không gian riêng</span>
        </h2>
        <p className="mt-5 text-ink-light text-[1.1rem]">
          Nơi lưu giữ những kỷ niệm quý giá nhất chỉ dành cho hai người.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center py-4">
        <h2 className="font-pangolin text-[1.9rem] text-ink mb-5 pb-2.5 border-b-2 border-dashed border-earth inline-flex items-center gap-2.5">
          <span className="size-8">
            <GhibliIcon type="totoro" size={32} />
          </span>
          Chào mừng trở lại~
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mt-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card relative overflow-hidden text-center p-5"
            >
              <div className="absolute size-[35px] opacity-12 bottom-2 right-2 pointer-events-none">
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
              <div className="font-semibold text-ink-light text-[0.88rem] mt-2">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quote Card */}
        <div className="card mt-5">
          <p className="font-pangolin text-[1.4rem] text-ink-light">
            &quot;Mỗi khoảnh khắc nhỏ đều đáng được ghi nhớ...&quot;
          </p>
        </div>
      </div>

      {/* Spaces Management */}
      <section className="mt-10">
        <div className="h-[2px] bg-[radial-gradient(circle,var(--earth)_0%,transparent_70%)] opacity-20 mb-[30px]" />
        <div className="max-w-[600px] mx-auto">
          {spaces.map((space: Space) => (
            <div
              key={space.id}
              className="card mb-3.5 flex justify-between items-center p-[15px_25px]"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-[1.1rem]">{space.name}</span>
                <span
                  className={cn(
                    "text-[0.7rem] py-0.5 px-2.5 rounded-[10px] font-bold",
                    space.type === "personal"
                      ? "bg-[#f1f5f9] text-[#64748b]"
                      : "bg-[#fdf2f8] text-[#db2777]",
                  )}
                >
                  {space.type === "personal" ? "Cá nhân" : "Chung"}
                </span>
              </div>
              {space.type === "shared" && (
                <button
                  onClick={() => generateInviteMutation.mutate(space.id)}
                  className="bg-transparent border-2 border-[#fecdd3] text-[#e11d48] text-[0.8rem] font-bold py-1.5 px-3.5 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[#fff1f2] hover:scale-105"
                  type="button"
                >
                  Tạo Link Mời ❤️
                </button>
              )}
            </div>
          ))}

          {!spaces.some((s: Space) => s.type === "shared") && (
            <div className="text-center p-[30px] bg-white/50 border-2 border-dashed border-earth rounded-[20px]">
              <p className="mb-3 text-ink-light">
                Bạn chưa có không gian chung nào.
              </p>
              <button
                onClick={() => createSpaceMutation.mutate()}
                className="bg-grass text-white border-none py-2.5 px-6 rounded-[15px] font-bold cursor-pointer hover:bg-grass-dark transition-colors duration-250"
                type="button"
              >
                Tạo nhà chung
              </button>
            </div>
          )}

          {inviteLink && (
            <div className="mt-5 p-[15px] bg-[#fffdf5] border border-[#eae0c0] rounded-xl animate-[fadeUp_0.3s_ease]">
              <p className="font-pangolin font-bold text-sunset mb-2">
                Magic Link đã sẵn sàng!
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-[0.85rem] p-[8px_12px] border border-[#eae0c0] rounded-lg outline-none bg-white"
                  aria-label="Đường dẫn mời tham gia"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    alert("Đã copy!");
                  }}
                  className="bg-earth text-white border-none py-2 px-4 rounded-lg font-semibold cursor-pointer hover:bg-[#bfa065] transition-colors duration-200"
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
