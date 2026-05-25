"use client";

import GhibliIcon from "@/components/icons/GhibliIcon";
import { DATE_MOODS, DATE_SLOTS } from "@/data/mock";

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
      <div
        style={{
          fontFamily: '"Pangolin", cursive',
          fontSize: "1.1rem",
          color: "var(--earth)",
          marginBottom: "18px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <GhibliIcon type="date" size={20} />
        <span>Chọn khung giờ</span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--ink-light)",
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          (tối đa 2 khung)
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {DATE_SLOTS.map((s) => {
          const isSelected = selectedSlots.includes(s.id);
          return (
            <div
              key={s.id}
              onClick={() => onToggleSlot(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onToggleSlot(s.id);
              }}
              tabIndex={0}
              role="button"
              style={{
                cursor: "pointer",
                padding: "10px 16px",
                borderRadius: "16px",
                border: `2px solid ${isSelected ? "var(--sunset)" : "var(--earth)"}`,
                background: isSelected ? "var(--sunset)" : "var(--card)",
                color: isSelected ? "white" : "var(--ink)",
                transition: "all 0.2s",
                textAlign: "center",
                boxShadow: isSelected
                  ? "0 4px 14px rgba(244,164,96,0.35)"
                  : "none",
                minWidth: "120px",
                flex: "1 1 calc(33.33% - 10px)",
              }}
            >
              <div style={{ fontSize: "1rem" }}>{s.sub}</div>
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  marginTop: "2px",
                  opacity: isSelected ? 1 : 0.7,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          fontFamily: '"Pangolin", cursive',
          fontSize: "1.1rem",
          color: "var(--earth)",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <GhibliIcon type="heart" size={18} />
        <span>Mood hẹn hò</span>
        <span
          style={{
            fontSize: "0.8rem",
            color: "var(--ink-light)",
            fontFamily: '"Quicksand", sans-serif',
          }}
        >
          (tối đa 3 thẻ)
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        {DATE_MOODS.map((m) => {
          const isSelected = selectedMoods.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => onToggleMood(m.id)}
              type="button"
              style={{
                fontFamily: "'Quicksand',sans-serif",
                fontWeight: "700",
                fontSize: "0.88rem",
                padding: "8px 18px",
                borderRadius: "24px",
                border: `2px solid ${isSelected ? "var(--grass)" : "var(--earth)"}`,
                background: isSelected ? "var(--grass)" : "var(--card)",
                color: isSelected ? "white" : "var(--ink)",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isSelected
                  ? "0 3px 10px rgba(140,183,140,0.4)"
                  : "none",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {selectedSlots.length > 0 && selectedMoods.length > 0 ? (
        <div style={{ textAlign: "center" }}>
          <button
            className="btn btn-primary"
            onClick={onGenerate}
            type="button"
            style={{
              padding: "13px 40px",
              fontSize: "1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <GhibliIcon type="heart" size={16} color="#fff" />
            Tạo kế hoạch hẹn hò
          </button>
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            color: "var(--ink-light)",
            fontSize: "0.9rem",
            padding: "8px 0",
          }}
        >
          Chọn ít nhất 1 khung giờ và 1 mood để bắt đầu nhé 💫
        </div>
      )}
    </div>
  );
}
