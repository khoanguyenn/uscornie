"use client";

interface CalendarDay {
  id: string;
  day: number | null;
  class: string;
  tooltip: string | null;
}

interface SpecialDay {
  day: number;
  label: string;
}

interface CalendarViewCardProps {
  calDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  mn: string[];
  dn: string[];
  calendarData: CalendarDay[];
  specialDays: SpecialDay[];
}

export function CalendarViewCard({
  calDate,
  onPrevMonth,
  onNextMonth,
  mn,
  dn,
  calendarData,
  specialDays,
}: CalendarViewCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-center gap-5 mb-3">
        <button
          onClick={onPrevMonth}
          type="button"
          aria-label="Tháng trước"
          className="bg-transparent border-2 border-earth rounded-full size-9 text-[1rem] cursor-pointer text-ink flex items-center justify-center transition-all duration-300 font-bold hover:bg-earth hover:text-white"
        >
          &lt;
        </button>
        <span className="font-pangolin text-[1.35rem] min-w-[180px] text-center">
          {mn[calDate.getMonth()]} {calDate.getFullYear()}
        </span>
        <button
          onClick={onNextMonth}
          type="button"
          aria-label="Tháng sau"
          className="bg-transparent border-2 border-earth rounded-full size-9 text-[1rem] cursor-pointer text-ink flex items-center justify-center transition-all duration-300 font-bold hover:bg-earth hover:text-white"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-5">
        {dn.map((d) => (
          <div
            key={d}
            className="font-bold text-[0.75rem] text-ink-light py-2 text-center"
          >
            {d}
          </div>
        ))}
        {calendarData.map((d) => (
          <div
            key={d.id}
            className={`text-center py-2 px-1 text-[0.85rem] rounded-[10px] cursor-default font-medium transition-all duration-200 relative ${
              d.class === "today"
                ? "bg-grass text-white font-bold"
                : d.class === "special"
                  ? "bg-blush text-ink font-bold group"
                  : d.class === "empty"
                    ? "invisible"
                    : ""
            }`}
          >
            {d.day}
            {d.tooltip && (
              <span className="invisible group-hover:visible group-hover:opacity-100 absolute bottom-[110%] left-1/2 -translate-x-1/2 bg-ink text-cream text-[0.72rem] py-1 px-2.5 rounded-lg whitespace-nowrap z-50 opacity-0 transition-opacity duration-200">
                {d.tooltip}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4">
        {specialDays.map((s) => (
          <span
            key={s.label}
            className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold py-1 px-3 bg-petal rounded-[20px] m-[3px] text-ink-light"
          >
            {s.day}/{calDate.getMonth() + 1}: {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
