// biome-ignore-all lint/complexity/useLiteralKeys: TypeScript requires bracket notation for index signature properties
"use client";

import Image from "next/image";
import GhibliIcon from "@/components/ui/GhibliIcon";

interface UserStats {
  memories: number;
  wishlist: number;
  cafe: number;
  restaurant: number;
}

interface UserInfo {
  full_name?: string;
  picture?: string;
  stats?: {
    categories?: Record<string, number>;
  };
}

interface DoubleStatsPanelProps {
  creatorInfo: UserInfo | null;
  acceptorInfo: UserInfo | null;
  showAcceptorWaiting?: boolean;
  isMerging?: boolean;
}

const getStats = (userStats: UserInfo | null): UserStats => {
  const categories = userStats?.stats?.categories || {};
  return {
    memories: categories["memories"] || 0,
    wishlist: categories["wishlist"] || 0,
    cafe: categories["cafe"] || 0,
    restaurant: categories["restaurant"] || 0,
  };
};

export default function DoubleStatsPanel({
  creatorInfo,
  acceptorInfo,
  showAcceptorWaiting = false,
  isMerging = false,
}: DoubleStatsPanelProps) {
  const aStats = getStats(creatorInfo);
  const bStats = getStats(acceptorInfo);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full relative">
      {/* Left Side: Creator */}
      <div
        className="flex-1 w-full text-center p-6 bg-[#fdfbf7] rounded-2xl border-2 border-[#eae3d9]"
        id="creator-stats-panel"
      >
        <div className="size-20 mx-auto rounded-full overflow-hidden bg-[#e8f4f8] border-4 border-white shadow-md flex items-center justify-center mb-4 relative">
          {creatorInfo?.picture ? (
            <Image
              src={creatorInfo.picture}
              alt="A Avatar"
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <GhibliIcon type="totoro" size={48} />
          )}
        </div>
        <h3 className="font-bold text-lg text-[#5c4a3d] mb-3">
          {creatorInfo?.full_name || "Bạn (Người gửi)"}
        </h3>
        <div className="space-y-1.5 text-sm text-[#7d6958] font-semibold text-left max-w-[200px] mx-auto">
          <div>
            📚 Kỷ niệm đã lưu:{" "}
            <span id="creator-memories">{aStats.memories}</span>
          </div>
          <div>
            🎁 Điều ước Wishlist:{" "}
            <span id="creator-wishlist">{aStats.wishlist}</span>
          </div>
          <div>
            ☕ Quán cafe: <span id="creator-cafe">{aStats.cafe}</span>
          </div>
          <div>
            🍽️ Quán ăn: <span id="creator-restaurant">{aStats.restaurant}</span>
          </div>
        </div>
      </div>

      {/* Center Sync Animation / Spinner */}
      <div className="relative z-10 flex items-center justify-center size-20 rounded-full bg-[#fdf8f0] shadow-md border-2 border-[#eae3d9] animate-pulse">
        <div className="animate-spin duration-3000" id="sync-spinner">
          <GhibliIcon type="heart" size={40} />
        </div>
      </div>

      {/* Right Side: Acceptor */}
      <div
        className="flex-1 w-full text-center p-6 bg-[#fdfbf7] rounded-2xl border-2 border-[#eae3d9]"
        id="acceptor-stats-panel"
      >
        <div className="size-20 mx-auto rounded-full overflow-hidden bg-[#e8f4f8] border-4 border-white shadow-md flex items-center justify-center mb-4 relative">
          {!showAcceptorWaiting && acceptorInfo?.picture ? (
            <Image
              src={acceptorInfo.picture}
              alt="B Avatar"
              fill
              unoptimized
              sizes="80px"
              className="object-cover"
            />
          ) : !showAcceptorWaiting ? (
            <GhibliIcon type="calcifer" size={48} />
          ) : (
            <GhibliIcon type="soot" size={48} />
          )}
        </div>
        <h3 className="font-bold text-lg text-[#5c4a3d] mb-3">
          {showAcceptorWaiting
            ? "Đang chờ người ấy..."
            : acceptorInfo?.full_name || "Bạn (Người nhận)"}
        </h3>
        {showAcceptorWaiting ? (
          <p className="text-sm text-[#a39485] italic py-6">
            Gửi link bên dưới để người ấy cùng kết nối nhé!
          </p>
        ) : (
          <div
            className={`space-y-1.5 text-sm text-[#7d6958] font-semibold text-left max-w-[200px] mx-auto ${isMerging ? "animate-pulse" : ""}`}
          >
            <div>
              📚 Kỷ niệm đã lưu:{" "}
              <span id="acceptor-memories">{bStats.memories}</span>
            </div>
            <div>
              🎁 Điều ước Wishlist:{" "}
              <span id="acceptor-wishlist">{bStats.wishlist}</span>
            </div>
            <div>
              ☕ Quán cafe: <span id="acceptor-cafe">{bStats.cafe}</span>
            </div>
            <div>
              🍽️ Quán ăn:{" "}
              <span id="acceptor-restaurant">{bStats.restaurant}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
