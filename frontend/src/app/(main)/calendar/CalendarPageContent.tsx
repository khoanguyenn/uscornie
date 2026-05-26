"use client";

import { useEffect, useMemo, useState } from "react";
import GhibliIcon from "@/components/icons/GhibliIcon";
import { OCCASIONS } from "@/data/mock";
import { useDataStore } from "@/stores/useDataStore";

export default function CalendarPageContent() {
  const anniversaryDate = useDataStore((s) => s.anniversaryDate);
  const birthdayDate = useDataStore((s) => s.birthdayDate);
  const loadData = useDataStore((s) => s.loadData);
  const setAnniversaryDate = useDataStore((s) => s.setAnniversaryDate);
  const setBirthdayDate = useDataStore((s) => s.setBirthdayDate);

  useEffect(() => {
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

  const [calDate, setCalDate] = useState(() => new Date());
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

  return (
    <div style={{ width: "100%", maxWidth: "600px", margin: "0 auto" }}>
      <h2 className="page-title">
        <span className="pt-ico">
          <GhibliIcon type="heart" size={32} />
        </span>
        Ngày bên nhau
      </h2>

      <div className="couple-counter">
        <div className="deco-svg deco-l">
          <GhibliIcon type="calcifer" size={40} />
        </div>
        <div className="deco-svg deco-r">
          <GhibliIcon type="soot" size={40} />
        </div>
        <div className="big-number">
          {daysTogether !== null ? daysTogether : "?"}
        </div>
        <div className="counter-label">ngày bên nhau</div>
        {detailTime && <div className="counter-sub">{detailTime}</div>}
      </div>

      <div className="card">
        <div className="form-group">
          <label htmlFor="birthday-input">Ngày sinh nhật</label>
          <input
            id="birthday-input"
            type="date"
            className="form-input"
            style={{ maxWidth: "220px" }}
            value={birthdayDate}
            onChange={(e) => setBirthdayDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="anniversary-input">Ngày anniversary</label>
          <input
            id="anniversary-input"
            type="date"
            className="form-input"
            style={{ maxWidth: "220px" }}
            value={anniversaryDate}
            onChange={(e) => setAnniversaryDate(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="cal-nav">
          <button onClick={prevMonth} type="button" aria-label="Tháng trước">
            &lt;
          </button>
          <span>
            {mn[calDate.getMonth()]} {calDate.getFullYear()}
          </span>
          <button onClick={nextMonth} type="button" aria-label="Tháng sau">
            &gt;
          </button>
        </div>
        <div className="calendar-grid">
          {dn.map((d) => (
            <div key={d} className="cal-header">
              {d}
            </div>
          ))}
          {calendarData.map((d) => (
            <div key={d.id} className={`cal-day ${d.class}`}>
              {d.day}
              {d.tooltip && <span className="tooltip-text">{d.tooltip}</span>}
            </div>
          ))}
        </div>
        <div className="special-dates">
          {specialDays.map((s) => (
            <span key={s.label} className="special-item">
              {s.day}/{calDate.getMonth() + 1}: {s.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
