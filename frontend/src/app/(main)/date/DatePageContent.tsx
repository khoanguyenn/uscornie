"use client";

import { AnimatePresence, motion } from "framer-motion";
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

interface Particle {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

export default function DatePageContent() {
  const [selDateSlots, setSelDateSlots] = useState<string[]>([]);
  const [selDateMoods, setSelDateMoods] = useState<string[]>([]);
  const [datePlan, setDatePlan] = useState<DatePlanBlock[] | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const burst = () => {
    const cols = ["#f2a0a0", "#f5c0c0", "#f9e27a", "#a8e6cf", "#f5a0b8"];
    const newParticles: Particle[] = [];
    const now = Date.now();
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: now + i,
        x: 30 + Math.random() * 40,
        size: 16 + Math.random() * 18,
        color: cols[Math.floor(Math.random() * cols.length)] || "#f2a0a0",
        delay: Math.random() * 0.4,
        duration: 1.4 + Math.random() * 0.8,
      });
    }
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2500);
  };

  const handleToggleSlot = (id: string) => {
    setSelDateSlots((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id);
      return prev.length >= 2 ? [...prev.slice(1), id] : [...prev, id];
    });
  };

  const handleToggleMood = (id: string) => {
    setSelDateMoods((prev) => {
      if (prev.includes(id)) return prev.filter((m) => m !== id);
      return prev.length >= 3 ? [...prev.slice(1), id] : [...prev, id];
    });
  };

  const genDatePlan = () => {
    if (!selDateSlots.length || !selDateMoods.length) return;

    const plan: DatePlanBlock[] = [];
    for (const slotId of selDateSlots) {
      const slotData = (DATE_DB[slotId as keyof typeof DATE_DB] ||
        {}) as Record<string, { a: string; l?: string }[]>;

      // 1. Gather matched items based on selected moods
      let matched = selDateMoods.flatMap((mood) => slotData[mood] || []);

      // 2. Fallback to all items in slot if not enough
      if (matched.length < 3) {
        matched = Object.values(slotData).flat();
      }

      // 3. Keep unique items, shuffle, and slice 3-5 items
      const uniques = Array.from(
        new Map(matched.map((item) => [item.a, item])).values(),
      );
      const shuffled = uniques.sort(() => Math.random() - 0.5);
      const picked = shuffled.slice(
        0,
        Math.min(5, Math.max(3, shuffled.length)),
      );

      const slotInfo = DATE_SLOTS.find((s) => s.id === slotId);
      if (slotInfo) {
        plan.push({
          slot: {
            id: slotId,
            label: slotInfo.label,
            sub: slotInfo.sub,
          },
          items: picked.map((p) => ({ ...p, mood: "default" })),
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
    <div className="w-full max-w-[600px] mx-auto overflow-hidden">
      <h2 className="font-pangolin text-[1.9rem] text-ink mb-5 pb-2.5 border-b-2 border-dashed border-earth inline-flex items-center gap-2.5">
        <span className="w-8 h-8">
          <GhibliIcon type="soot" size={32} />
        </span>
        Gợi ý hẹn hò
      </h2>

      <AnimatePresence mode="wait">
        {!datePlan ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <DateSelector
              selectedSlots={selDateSlots}
              selectedMoods={selDateMoods}
              onToggleSlot={handleToggleSlot}
              onToggleMood={handleToggleMood}
              onGenerate={genDatePlan}
            />

            {/* Empty State / Hint */}
            <div className="text-center p-[32px_20px] text-ink-light">
              <GhibliIcon
                type="date"
                size={60}
                className="!opacity-25 !mx-auto !mb-3"
              />
              <p className="text-[0.95rem] font-medium mt-3">
                Chọn khung giờ và mood rồi bấm tạo kế hoạch nhé!
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            <PlanResultCard
              plan={datePlan}
              selectedMoods={selDateMoods}
              onRegenerate={genDatePlan}
              onReset={resetPlan}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart Burst Particles using Framer Motion */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                opacity: 1,
                left: `${p.x}%`,
                bottom: "35%",
                scale: 0.4,
                rotate: 0,
              }}
              animate={{
                opacity: [1, 0.9, 0],
                bottom: ["35%", "55%", "85%"],
                scale: [0.4, 1.1, 0.5],
                rotate: [0, 15, -10],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
              }}
              exit={{ opacity: 0 }}
              className="absolute"
            >
              <svg
                width={p.size}
                height={p.size}
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Heart</title>
                <path
                  d="M10 17 Q0 10 3 5 Q5 2 8 4 Q9 5 10 7 Q11 5 12 4 Q15 2 17 5 Q20 10 10 17Z"
                  fill={p.color}
                />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
