"use client";

import { useState } from "react";
import DateSelector from "@/components/date/DateSelector";
import PlanResultCard from "@/components/date/PlanResultCard";
import GhibliIcon from "@/components/icons/GhibliIcon";
import { DATE_DB, DATE_SLOTS } from "@/data/mock";

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

export default function DatePageContent() {
  const [selDateSlots, setSelDateSlots] = useState<string[]>([]);
  const [selDateMoods, setSelDateMoods] = useState<string[]>([]);
  const [datePlan, setDatePlan] = useState<DatePlanBlock[] | null>(null);

  const burst = () => {
    let c = document.getElementById("heart-burst");
    if (!c) {
      c = document.createElement("div");
      c.id = "heart-burst";
      c.className = "heart-burst";
      document.body.appendChild(c);
    }
    const cols = ["#f2a0a0", "#f5c0c0", "#f9e27a", "#a8e6cf", "#f5a0b8"];
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 14; i++) {
      const p = document.createElement("div");
      p.className = "hb-particle";
      p.style.cssText = `left: ${30 + Math.random() * 40}%; bottom: 35%; animation-delay: ${Math.random() * 0.4}s; animation-duration: ${1.4 + Math.random() * 0.8}s;`;
      const sz = 16 + Math.random() * 18;
      p.innerHTML = `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 17 Q0 10 3 5 Q5 2 8 4 Q9 5 10 7 Q11 5 12 4 Q15 2 17 5 Q20 10 10 17Z" fill="${
        cols[Math.floor(Math.random() * cols.length)]
      }"/></svg>`;
      fragment.appendChild(p);
      setTimeout(() => p.remove(), 2500);
    }
    c.appendChild(fragment);
  };

  const handleToggleSlot = (id: string) => {
    setSelDateSlots((prev) => {
      if (prev.includes(id)) {
        return prev.filter((s) => s !== id);
      }
      if (prev.length >= 2) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleToggleMood = (id: string) => {
    setSelDateMoods((prev) => {
      if (prev.includes(id)) {
        return prev.filter((m) => m !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const genDatePlan = () => {
    if (!selDateSlots.length || !selDateMoods.length) return;
    const plan: DatePlanBlock[] = [];
    const used = new Set<string>();

    const slotsMap = new Map(DATE_SLOTS.map((s) => [s.id, s]));
    const primaryMoods = selDateMoods.filter((m) => m !== "khac");
    const hasKhac = selDateMoods.includes("khac");

    for (const slotId of selDateSlots) {
      const slotData = (DATE_DB[slotId as keyof typeof DATE_DB] ||
        {}) as Record<string, { a: string; l?: string }[]> & {
        khac?: { a: string; l?: string }[];
      };
      const slotInfo = slotsMap.get(slotId);
      const activities: DateActivity[] = [];

      for (const moodId of primaryMoods) {
        const items = slotData[moodId] || [];
        for (const item of items) {
          if (!used.has(item.a)) {
            activities.push({ ...item, mood: moodId });
          }
        }
      }

      // Also include 'khac' if selected
      if (hasKhac) {
        const items = slotData.khac || [];
        for (const item of items) {
          if (!used.has(item.a)) {
            activities.push({ ...item, mood: "khac" });
          }
        }
      }

      // Shuffle
      activities.sort(() => Math.random() - 0.5);

      // Pick 3-5
      let picked = activities.slice(0, Math.min(5, activities.length));

      // If < 3, fill from 'khac' fallback regardless of selection
      if (picked.length < 3) {
        const fallback = (slotData.khac || []).filter(
          (item) => !used.has(item.a) && !picked.some((p) => p.a === item.a),
        );
        fallback.sort(() => Math.random() - 0.5);
        const needed = 3 - picked.length;
        picked = picked.concat(
          fallback.slice(0, needed).map((f) => ({ ...f, mood: "khac" })),
        );
      }

      // Still < 3? Fill from any mood in that slot
      if (picked.length < 3) {
        const allInSlot: { a: string; l?: string; mood: string }[] = [];
        for (const [moodKey, arr] of Object.entries(slotData)) {
          for (const item of arr) {
            if (!used.has(item.a) && !picked.some((p) => p.a === item.a)) {
              allInSlot.push({ ...item, mood: moodKey });
            }
          }
        }
        allInSlot.sort(() => Math.random() - 0.5);
        const needed = 3 - picked.length;
        picked = picked.concat(allInSlot.slice(0, needed));
      }

      for (const p of picked) {
        used.add(p.a);
      }

      if (slotInfo) {
        plan.push({
          slot: {
            id: slotInfo.id,
            label: slotInfo.label,
            sub: slotInfo.sub,
          },
          items: picked,
        });
      }
    }

    setDatePlan(plan);
    burst();
  };

  const resetPlan = () => {
    setDatePlan(null);
  };

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="page-title">
        <span className="pt-ico">
          <GhibliIcon type="soot" size={32} />
        </span>
        Gợi ý hẹn hò
      </h2>

      {/* Settings Card */}
      {!datePlan && (
        <DateSelector
          selectedSlots={selDateSlots}
          selectedMoods={selDateMoods}
          onToggleSlot={handleToggleSlot}
          onToggleMood={handleToggleMood}
          onGenerate={genDatePlan}
        />
      )}

      {/* Results Card */}
      {datePlan && (
        <PlanResultCard
          plan={datePlan}
          selectedMoods={selDateMoods}
          onRegenerate={genDatePlan}
          onReset={resetPlan}
        />
      )}

      {/* Empty State */}
      {!datePlan && (
        <div className="empty-state" style={{ padding: "32px 20px" }}>
          <GhibliIcon
            type="date"
            size={60}
            style={{ opacity: 0.25, margin: "0 auto 12px" }}
          />
          <p style={{ marginTop: "12px" }}>
            Chọn khung giờ và mood rồi bấm tạo kế hoạch nhé!
          </p>
        </div>
      )}
    </div>
  );
}
