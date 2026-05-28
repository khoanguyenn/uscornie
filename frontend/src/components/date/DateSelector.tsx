"use client";

import { Button } from "@/components/ui/Button";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { DATE_MOODS, DATE_SLOTS } from "@/lib/data/mock";

interface DateSelectorProps {
  selectedSlots: string[];
  selectedMoods: string[];
  onToggleSlot: (id: string) => void;
  onToggleMood: (id: string) => void;
  onGenerate: () => void;
}

export default function DateSelector({
  selectedSlots,
  selectedMoods,
  onToggleSlot,
  onToggleMood,
  onGenerate,
}: DateSelectorProps) {
  return (
    <div className="card">
      <div className="font-pangolin text-[1.1rem] text-earth mb-[18px] flex items-center gap-[6px]">
        <GhibliIcon type="date" size={20} />
        <span>Chọn khung giờ</span>
        <span className="text-[0.8rem] text-ink-light font-quicksand">
          (tối đa 2 khung)
        </span>
      </div>

      <div className="flex flex-wrap gap-[10px] mb-6">
        {DATE_SLOTS.map((s) => {
          const isSelected = selectedSlots.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onToggleSlot(s.id)}
              type="button"
              className={`cursor-pointer py-[10px] px-4 rounded-2xl border-2 text-center min-w-[120px] flex-[1_1_calc(33.33%-10px)] transition-all duration-200 ${
                isSelected
                  ? "border-sunset bg-sunset text-white shadow-[0_4px_14px_rgba(244,164,96,0.35)]"
                  : "border-earth bg-card text-ink shadow-none"
              }`}
            >
              <div className="text-[1rem]">{s.sub}</div>
              <div
                className={`text-[0.8rem] font-bold mt-[2px] ${
                  isSelected ? "opacity-100" : "opacity-70"
                }`}
              >
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      <div className="font-pangolin text-[1.1rem] text-earth mb-3 flex items-center gap-[6px]">
        <GhibliIcon type="heart" size={18} />
        <span>Mood hẹn hò</span>
        <span className="text-[0.8rem] text-ink-light font-quicksand">
          (tối đa 3 thẻ)
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {DATE_MOODS.map((m) => {
          const isSelected = selectedMoods.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => onToggleMood(m.id)}
              type="button"
              className={`font-quicksand font-bold text-[0.88rem] py-2 px-[18px] rounded-[24px] border-2 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-grass bg-grass text-white shadow-[0_3px_10px_rgba(140,183,140,0.4)]"
                  : "border-earth bg-card text-ink shadow-none"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {selectedSlots.length > 0 && selectedMoods.length > 0 ? (
        <div className="text-center">
          <Button
            className="!py-[13px] !px-10 text-[1rem]"
            onClick={onGenerate}
            type="button"
          >
            <GhibliIcon type="heart" size={16} color="#fff" />
            Tạo kế hoạch hẹn hò
          </Button>
        </div>
      ) : (
        <div className="text-center text-ink-light text-[0.9rem] py-2">
          Chọn ít nhất 1 khung giờ và 1 mood để bắt đầu nhé 💫
        </div>
      )}
    </div>
  );
}
