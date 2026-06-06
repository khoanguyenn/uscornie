"use client";

import GhibliIcon from "@/components/ui/GhibliIcon";

interface DaysTogetherCardProps {
  daysTogether: number | null;
  detailTime: string;
}

export function DaysTogetherCard({
  daysTogether,
  detailTime,
}: DaysTogetherCardProps) {
  return (
    <div className="bg-gradient-to-br from-petal to-blush rounded-[20px] p-9 text-center mb-6 shadow-[0_4px_20px_rgba(242,196,196,0.3)] relative overflow-hidden">
      <div className="absolute size-10 opacity-18 pointer-events-none top-3 left-4 animate-[charBob_4s_ease-in-out_infinite]">
        <GhibliIcon type="calcifer" size={40} />
      </div>
      <div className="absolute size-10 opacity-18 pointer-events-none bottom-3 right-4 animate-[charBob_3.5s_ease-in-out_infinite_1s]">
        <GhibliIcon type="soot" size={40} />
      </div>
      <div className="font-pangolin text-[3.2rem] md:text-[4.5rem] text-ink leading-none">
        {daysTogether !== null ? daysTogether : "?"}
      </div>
      <div className="text-[1.1rem] font-semibold text-ink-light mt-1">
        ngày bên nhau
      </div>
      {detailTime && (
        <div className="text-[0.85rem] text-ink-light mt-2 opacity-80">
          {detailTime}
        </div>
      )}
    </div>
  );
}
