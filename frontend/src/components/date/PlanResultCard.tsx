"use client";

import { Button } from "@/components/ui/Button";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { DATE_MOODS } from "@/lib/data/mock";

interface DateActivity {
  a: string;
  l?: string;
  mood: string;
}

interface DatePlanBlock {
  slot: {
    id: string;
    label: string;
    sub: string;
  };
  items: DateActivity[];
}

interface PlanResultCardProps {
  plan: DatePlanBlock[];
  selectedMoods: string[];
  onRegenerate: () => void;
  onReset: () => void;
}

const moodClassNames: Record<string, { bg: string; text: string }> = {
  nhonnhip: { bg: "bg-[#f4a460]/13", text: "text-[#f4a460]" },
  langman: { bg: "bg-[#f2a0a0]/13", text: "text-[#f2a0a0]" },
  khampha: { bg: "bg-[#7ec8c8]/13", text: "text-[#7ec8c8]" },
  thugian: { bg: "bg-[#a8c88e]/13", text: "text-[#a8c88e]" },
  nghethuat: { bg: "bg-[#b39ddb]/13", text: "text-[#b39ddb]" },
  haihuoc: { bg: "bg-[#ffcc80]/13", text: "text-[#ffcc80]" },
  sangchanh: { bg: "bg-[#c9a96e]/13", text: "text-[#c9a96e]" },
  khac: { bg: "bg-[#aaaaaa]/13", text: "text-[#aaaaaa]" },
};

const getAnimationClass = (idx: number) => {
  const delays = ["0s", "0.08s", "0.16s", "0.24s", "0.32s", "0.4s", "0.48s"];
  const delay = delays[idx] || "0s";
  return `animate-[fadeUp_0.35s_ease_${delay}_both]`;
};

const getMoodLabel = (id: string) => {
  return DATE_MOODS.find((m) => m.id === id)?.label || "";
};

export default function PlanResultCard({
  plan,
  selectedMoods,
  onRegenerate,
  onReset,
}: PlanResultCardProps) {
  return (
    <div>
      <div className="card !p-7">
        <div className="font-pangolin text-[1.35rem] text-ink mb-1 flex items-center gap-2">
          <GhibliIcon type="date" size={24} />
          Kế hoạch hẹn hò của bạn
        </div>
        <div className="text-[0.83rem] text-ink-light mb-[22px]">
          Mood: {selectedMoods.map((id) => getMoodLabel(id)).join(" · ")}
        </div>

        {plan.map((block) => (
          <div key={block.slot.id} className="mb-7">
            <div className="font-pangolin text-[1.2rem] text-ink mb-3.5 flex items-center gap-2">
              <span>{block.slot.label}</span>
              <span className="text-[0.8rem] text-ink-light font-quicksand">
                {block.slot.sub}
              </span>
            </div>
            <div className="flex gap-2.5 flex-col">
              {block.items.map((item, idx) => {
                const moodLabel = getMoodLabel(item.mood);
                const firstChar = moodLabel.split(" ")[0] || "✨";
                const moodStyle = moodClassNames[item.mood] || {
                  bg: "bg-earth/13",
                  text: "text-ink",
                };

                return (
                  <div
                    key={item.a}
                    className={`bg-cream border-[1.5px] border-earth/20 rounded-[14px] p-[14px_18px] flex gap-[14px] items-start transition-all duration-[250ms] hover:shadow-[0_4px_14px_rgba(74,64,51,0.1)] hover:translate-x-[3px] ${getAnimationClass(
                      idx,
                    )}`}
                  >
                    <div
                      className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 text-[0.9rem] font-bold ${moodStyle.bg} ${moodStyle.text}`}
                    >
                      {firstChar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-pangolin text-[1rem] text-ink mb-[3px]">
                        {item.a}
                      </div>
                      <div className="text-[0.82rem] text-ink-light flex items-center gap-1">
                        <GhibliIcon type="pin" size={13} />
                        {item.l || "—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-3">
        <Button
          variant="secondary"
          className="mr-2"
          onClick={onRegenerate}
          type="button"
        >
          🔄 Tạo lại
        </Button>
        <Button onClick={onReset} type="button">
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
