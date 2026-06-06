"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarViewCard } from "@/components/calendar/CalendarViewCard";
import { DateConfigCard } from "@/components/calendar/DateConfigCard";
import { DaysTogetherCard } from "@/components/calendar/DaysTogetherCard";
import GhibliIcon from "@/components/ui/GhibliIcon";
import { OCCASIONS } from "@/lib/data/mock";
import { useDataActions, useDataStore } from "@/lib/stores/useDataStore";

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
  const { loadData, setAnniversaryDate, setBirthdayDate } = useDataActions();

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

      <DaysTogetherCard daysTogether={daysTogether} detailTime={detailTime} />

      <DateConfigCard
        birthdayDate={birthdayDate}
        anniversaryDate={anniversaryDate}
        onBirthdayChange={setBirthdayDate}
        onAnniversaryChange={setAnniversaryDate}
      />

      <CalendarViewCard
        calDate={calDate}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        mn={mn}
        dn={dn}
        calendarData={calendarData}
        specialDays={specialDays}
      />
    </div>
  );
}
