"use client";

import GhibliIcon from "@/components/icons/GhibliIcon";
import { DATE_MOODS } from "@/data/mock";

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

const moodColors: Record<string, string> = {
  nhonnhip: "#f4a460",
  langman: "#f2a0a0",
  khampha: "#7ec8c8",
  thugian: "#a8c88e",
  nghethuat: "#b39ddb",
  haihuoc: "#ffcc80",
  sangchanh: "#c9a96e",
  khac: "#aaa",
};

export default function PlanResultCard({
  plan,
  selectedMoods,
  onRegenerate,
  onReset,
}: PlanResultCardProps) {
  const getMoodLabel = (id: string) => {
    return DATE_MOODS.find((m) => m.id === id)?.label || "";
  };

  return (
    <div>
      <div className="card" style={{ padding: "28px" }}>
        <div
          style={{
            fontFamily: '"Pangolin", cursive',
            fontSize: "1.35rem",
            color: "var(--ink)",
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <GhibliIcon type="date" size={24} />
          Kế hoạch hẹn hò của bạn
        </div>
        <div
          style={{
            fontSize: "0.83rem",
            color: "var(--ink-light)",
            marginBottom: "22px",
          }}
        >
          Mood: {selectedMoods.map((id) => getMoodLabel(id)).join(" · ")}
        </div>

        {plan.map((block) => (
          <div key={block.slot.id} style={{ marginBottom: "28px" }}>
            <div
              style={{
                fontFamily: '"Pangolin", cursive',
                fontSize: "1.2rem",
                color: "var(--ink)",
                marginBottom: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>{block.slot.label}</span>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--ink-light)",
                  fontFamily: '"Quicksand", sans-serif',
                }}
              >
                {block.slot.sub}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "column",
              }}
            >
              {block.items.map((item, idx) => {
                const moodLabel = getMoodLabel(item.mood);
                const firstChar = moodLabel.split(" ")[0] || "✨";
                const bgLight = `${moodColors[item.mood] || "var(--earth)"}22`;
                const fgColor = moodColors[item.mood] || "var(--ink)";

                return (
                  <div
                    key={idx}
                    className="date-activity-item"
                    style={{
                      background: "var(--cream)",
                      border: "1.5px solid rgba(201,169,110,0.2)",
                      borderRadius: "14px",
                      padding: "14px 18px",
                      display: "flex",
                      gap: "14px",
                      alignItems: "flex-start",
                      animation: `fadeUp 0.35s ease ${idx * 0.08}s both`,
                      transition: "all 0.25s",
                    }}
                  >
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "50%",
                        background: bgLight,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: "0.9rem",
                        fontWeight: "700",
                        color: fgColor,
                      }}
                    >
                      {firstChar}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: '"Pangolin", cursive',
                          fontSize: "1rem",
                          color: "var(--ink)",
                          marginBottom: "3px",
                        }}
                      >
                        {item.a}
                      </div>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--ink-light)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
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

      <div style={{ textAlign: "center", marginTop: "12px" }}>
        <button
          className="btn btn-secondary"
          onClick={onRegenerate}
          style={{ marginRight: "8px", cursor: "pointer" }}
          type="button"
        >
          🔄 Tạo lại
        </button>
        <button
          className="btn btn-primary"
          onClick={onReset}
          style={{ cursor: "pointer" }}
          type="button"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}
