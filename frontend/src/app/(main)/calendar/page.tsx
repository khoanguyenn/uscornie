import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Calendar - Uscornie",
  description:
    "View and track your special dates and calendar events on Uscornie.",
};

const CalendarPageContent = dynamic(() => import("./CalendarPageContent"), {
  ssr: false,
});

export default function CalendarPage() {
  return <CalendarPageContent />;
}
