"use client";

import CalciferCharacter from "@/components/characters/CalciferCharacter";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-[#7a7060] animate-[charBob_3s_ease-in-out_infinite]">
      <div className="size-[80px] flex items-center justify-center">
        <CalciferCharacter />
      </div>
      <p className="font-pangolin text-lg font-bold">Đang tải góc nhỏ...</p>
    </div>
  );
}
