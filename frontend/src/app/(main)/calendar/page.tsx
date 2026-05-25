"use client";

import dynamic from "next/dynamic";

const CalendarPageContent = dynamic(() => import("./CalendarPageContent"), {
  ssr: false,
});

export default function CalendarPage() {
  return <CalendarPageContent />;
}
