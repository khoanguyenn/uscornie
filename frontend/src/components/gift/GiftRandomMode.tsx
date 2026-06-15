"use client";

import { Button } from "@/components/ui/Button";
import { OCCASIONS } from "@/lib/data/mock";

export interface GiftSuggestion {
  title: string;
  reason?: string | undefined;
  desc?: string | undefined;
  image?: string | null | undefined;
}

interface Gender {
  id: string;
  label: string;
}

interface GiftRandomModeProps {
  selOcc: string | null;
  selGender: string | null;
  genders: Gender[];
  onSelectOccasion: (id: string) => void;
  onSelectGender: (id: string) => void;
  onGenerate: () => void;
  giftRes: GiftSuggestion | null;
}

export function GiftRandomMode({
  selOcc,
  selGender,
  genders,
  onSelectOccasion,
  onSelectGender,
  onGenerate,
  giftRes,
}: GiftRandomModeProps) {
  return (
    <div>
      <p className="text-center text-ink-light font-medium mb-4">
        Chọn dịp và đối tượng để nhận gợi ý nha 🎁
      </p>

      <p className="text-center text-ink font-bold text-[0.85rem] tracking-wider uppercase mb-2.5">
        🎉 Dịp đặc biệt
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 mb-5">
        {OCCASIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`rounded-[14px] p-[20px_12px] text-center cursor-pointer transition-all duration-300 border-2 hover:border-grass hover:-translate-y-1 hover:shadow-md ${
              selOcc === o.id
                ? "border-sunset bg-petal"
                : "border-earth/20 bg-card"
            }`}
            onClick={() => onSelectOccasion(o.id)}
          >
            <div className="font-pangolin text-[1.15rem] text-ink mt-1">
              {o.name}
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-ink font-bold text-[0.85rem] tracking-wider uppercase my-5 mb-2.5">
        🎁 Tặng cho ai?
      </p>

      <div className="flex gap-2.5 justify-center flex-wrap mb-6">
        {genders.map((g) => (
          <button
            key={g.id}
            onClick={() => onSelectGender(g.id)}
            type="button"
            className={`font-quicksand font-bold text-[0.95rem] py-2.5 px-[22px] rounded-[24px] border-2 cursor-pointer transition-all duration-200 ${
              selGender === g.id
                ? "border-sunset bg-sunset text-white shadow-[0_4px_14px_rgba(244,164,96,0.35)]"
                : "border-earth bg-card text-ink"
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {selOcc && selGender && (
        <div className="text-center my-1 mb-6">
          <Button
            className="!py-3.5 !px-10 text-[1rem]"
            onClick={onGenerate}
            type="button"
          >
            ✨ Gợi ý giúp mình
          </Button>
        </div>
      )}

      {/* Suggestion Result */}
      {giftRes && (
        <div className="mt-6 p-8 bg-gradient-to-br from-cream to-petal rounded-[20px] border-2 border-earth animate-[popIn_0.5s_ease] text-center">
          <div className="text-[0.85rem] text-ink-light font-semibold mb-2">
            Gợi ý cho {OCCASIONS.find((o) => o.id === selOcc)?.name || ""} ·{" "}
            {genders.find((g) => g.id === selGender)?.label || ""}:
          </div>
          <div className="font-pangolin text-2xl text-ink my-3">
            {giftRes.title}
          </div>
          {giftRes.reason && (
            <div className="text-[0.9rem] text-ink-light mt-2 italic">
              💬 {giftRes.reason}
            </div>
          )}
          <div className="mt-5">
            <Button variant="secondary" onClick={onGenerate} type="button">
              🔄 Gợi ý khác
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
