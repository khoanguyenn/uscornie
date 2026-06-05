"use client";

import { useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { Input } from "@/components/ui/Input";
import { OCCASIONS } from "@/lib/data/mock";
import { useDataStore } from "@/lib/stores/useDataStore";

const mn = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];
const dn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function Page() {
  const anniversaryDate = useDataStore((s) => s.anniversaryDate);
  const birthdayDate = useDataStore((s) => s.birthdayDate);
  const loadData = useDataStore((s) => s.loadData);
  const setAnniversaryDate = useDataStore((s) => s.setAnniversaryDate);
  const setBirthdayDate = useDataStore((s) => s.setBirthdayDate);

  const [mounted, setMounted] = useState(false);
  const [calDate, setCalDate] = useState(() => new Date());

  useEffect(() => {
    setMounted(true);
    document.title = "Calendar - Uscornie";
    loadData();
  }, [loadData]);

  const daysTogether = useMemo(() => {
    if (!anniversaryDate) return null;
    const start = new Date(anniversaryDate);
    const now = new Date();
    // Clear hours to calculate clean day diff
    start.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diff = now.getTime() - start.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [anniversaryDate]);

  const detailTime = useMemo(() => {
    if (!anniversaryDate) return "";
    const start = new Date(anniversaryDate);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} năm`);
    if (months > 0) parts.push(`${months} tháng`);
    if (days > 0) parts.push(`${days} ngày`);
    return parts.join(", ") || "0 ngày";
  }, [anniversaryDate]);

  const specialDays = useMemo(() => {
    const list: { day: number; label: string }[] = [];
    const month = calDate.getMonth();
    const m = month + 1;

    if (birthdayDate) {
      const bd = new Date(birthdayDate);
      if (bd.getMonth() === month) {
        list.push({ day: bd.getDate(), label: "Sinh nhật 🎂" });
      }
    }

    if (anniversaryDate) {
      const ad = new Date(anniversaryDate);
      if (ad.getMonth() === month) {
        list.push({ day: ad.getDate(), label: "Anniversary 💖" });
      }
    }

    for (const o of OCCASIONS) {
      if (o.month === m && o.day !== undefined) {
        list.push({ day: o.day, label: o.name });
      }
    }

    return list;
  }, [calDate, birthdayDate, anniversaryDate]);

  const calendarData = useMemo(() => {
    const y = calDate.getFullYear();
    const m = calDate.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const days: {
      id: string;
      day: number | null;
      class: string;
      tooltip: string | null;
    }[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ id: `empty-${i}`, day: null, class: "empty", tooltip: null });
    }
    const specialDaysMap = new Map(specialDays.map((s) => [s.day, s]));
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday =
        d === new Date().getDate() &&
        m === new Date().getMonth() &&
        y === new Date().getFullYear();
      const special = specialDaysMap.get(d);
      let cls = "";
      if (isToday) cls = "today";
      else if (special) cls = "special";

      days.push({
        id: `day-${d}`,
        day: d,
        class: cls,
        tooltip: special ? special.label : null,
      });
    }
    return days;
  }, [calDate, specialDays]);

  const prevMonth = () => {
    setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1));
  };

  // Render stable loading fallback if not mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-full max-w-[600px] mx-auto min-h-[400px] flex items-center justify-center">
        <GhibliIcon type="soot" size={48} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <h2 className="font-pangolin text-[1.9rem] text-ink mb-5 pb-2.5 border-b-2 border-dashed border-earth inline-flex items-center gap-2.5">
        <span className="size-8">
          <GhibliIcon type="heart" size={32} />
        </span>
        Ngày bên nhau
      </h2>

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

      <div className="card">
        <Input
          id="birthday-input"
          label="Ngày sinh nhật"
          type="date"
          className="max-w-[220px]"
          value={birthdayDate}
          onChange={(e) => setBirthdayDate(e.target.value)}
          aria-label="Ngày sinh nhật"
        />
        <Input
          id="anniversary-input"
          label="Ngày anniversary"
          type="date"
          className="max-w-[220px]"
          value={anniversaryDate}
          onChange={(e) => setAnniversaryDate(e.target.value)}
          aria-label="Ngày kỷ niệm"
        />
      </div>

      <div className="card">
        <div className="flex items-center justify-center gap-5 mb-3">
          <button
            onClick={prevMonth}
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
            onClick={nextMonth}
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
    </div>
  );
}
