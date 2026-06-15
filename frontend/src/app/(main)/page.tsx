"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import DoubleStatsPanel from "@/components/space/DoubleStatsPanel";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { useSaveItems } from "@/lib/hooks/useSaveItems";
import { spaceService } from "@/lib/services/spaceService";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { useDataActions, useDataStore } from "@/lib/stores/useDataStore";
import type { Space } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export default function Page() {
  const queryClient = useQueryClient();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { loadData } = useDataActions();
  const { allItems: items } = useSaveItems();
  const anniversaryDate = useDataStore((s) => s.anniversaryDate);

  const [inviteLink, setInviteLink] = useState("");
  const [mounted, setMounted] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [acceptorInfo, setAcceptorInfo] = useState<any>(null);

  // Load local data on mount and set title
  useEffect(() => {
    setMounted(true);
    document.title = "Home - Uscornie";
    loadData();
  }, [loadData]);

  // Fetch user spaces from API
  const { data: spaces = [], isLoading } = useQuery<Space[]>({
    queryKey: ["spaces"],
    queryFn: spaceService.fetchMySpaces,
    enabled: isAuthenticated,
    retry: 1,
  });

  // Filter visible spaces (hide personal spaces if a shared space is active)
  const visibleSpaces = useMemo(() => {
    const hasShared = spaces.some((s: Space) => s.type === "shared");
    if (hasShared) {
      return spaces.filter((s: Space) => s.type !== "personal");
    }
    return spaces;
  }, [spaces]);

  // Determine active space (prefer shared, fallback to personal)
  const activeSpace = useMemo(() => {
    if (!isAuthenticated || spaces.length === 0) return null;
    const shared = spaces.find((s) => s.type === "shared");
    if (shared) return shared;
    return spaces.find((s) => s.type === "personal") || null;
  }, [spaces, isAuthenticated]);

  // Query space stats from database
  const { data: spaceStats } = useQuery({
    queryKey: ["spaceStats", activeSpace?.id],
    queryFn: () => spaceService.getSpaceStats(activeSpace?.id || ""),
    enabled: !!activeSpace,
  });

  // Generate invite status polling
  useEffect(() => {
    if (!pendingToken) return;

    const interval = setInterval(async () => {
      try {
        const statusData = await spaceService.getInviteStatus(pendingToken);
        setInviteStatus(statusData.status);
        setCreatorInfo(statusData.creator);
        setAcceptorInfo(statusData.acceptor);

        if (statusData.status === "accepted") {
          clearInterval(interval);
          setTimeout(() => {
            setPendingToken(null);
            setInviteLink("");
            setInviteStatus(null);
            queryClient.invalidateQueries({ queryKey: ["spaces"] });
            queryClient.invalidateQueries({ queryKey: ["items"] });
          }, 2500);
        } else if (
          statusData.status === "cancelled" ||
          statusData.status === "declined"
        ) {
          clearInterval(interval);
          setPendingToken(null);
          setInviteLink("");
          setInviteStatus(null);
        }
      } catch (_) {
        // Ignore polling errors
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pendingToken, queryClient]);

  // Cancel invitation handler
  const handleCancelInvite = async () => {
    if (!pendingToken) return;
    try {
      await spaceService.updateInviteStatus(pendingToken, "cancelled");
      setPendingToken(null);
      setInviteLink("");
      setInviteStatus(null);
    } catch (_) {
      alert("Lỗi khi hủy lời mời");
    }
  };

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
      setPendingToken(data.invite_token);
      setInviteStatus("pending");
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

    const totalSaved = isAuthenticated
      ? (spaceStats?.total ?? 0)
      : items.length;
    const wishlistCount = isAuthenticated
      ? (spaceStats?.categories?.wishlist ?? 0)
      : items.filter((i) => i.category === "wishlist").length;

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
  }, [items, anniversaryDate, isAuthenticated, spaceStats]);

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

  if (pendingToken) {
    const isMerging = inviteStatus === "accepted";

    return (
      <div className="w-full max-w-[800px] mx-auto py-10 px-4">
        <div className="card overflow-hidden border-4 border-white shadow-xl bg-white rounded-3xl p-8 relative">
          <h2 className="font-pangolin text-[2rem] text-[#5c4a3d] text-center mb-8">
            {isMerging
              ? "💞 Đang đồng bộ ngôi nhà chung..."
              : "⏳ Đang chờ người ấy tham gia..."}
          </h2>

          <DoubleStatsPanel
            creatorInfo={creatorInfo}
            acceptorInfo={acceptorInfo}
            showAcceptorWaiting={!isMerging}
            isMerging={isMerging}
          />

          {!isMerging && (
            <div className="mt-10 p-5 bg-[#fffdf5] border border-[#eae0c0] rounded-2xl animate-[fadeUp_0.3s_ease]">
              <p className="font-pangolin font-bold text-sunset mb-2 text-center">
                Magic Link kết nối của hai bạn:
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={inviteLink}
                  className="flex-1 text-[0.85rem] p-[8px_12px] border border-[#eae0c0] rounded-lg outline-none bg-white font-mono"
                  aria-label="Đường dẫn mời tham gia"
                  id="invite-link-input"
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

              <div className="mt-5 flex justify-center">
                <button
                  onClick={handleCancelInvite}
                  className="bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb] font-bold py-2.5 px-6 rounded-xl border border-gray-300 transition-colors"
                  type="button"
                  id="cancel-invite-btn"
                >
                  Hủy lời mời
                </button>
              </div>
            </div>
          )}

          {isMerging && (
            <div
              className="mt-8 text-center text-[#e0664b] font-pangolin font-bold text-lg animate-bounce"
              id="merging-success-message"
            >
              🎉 Đồng bộ thành công! Đang chuẩn bị dọn vào nhà mới...
            </div>
          )}
        </div>
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
        <div className="max-w-[600px] mx-auto" id="spaces-list-container">
          {visibleSpaces.map((space: Space) => (
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

          {!visibleSpaces.some((s: Space) => s.type === "shared") && (
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
        </div>
      </section>
    </div>
  );
}
