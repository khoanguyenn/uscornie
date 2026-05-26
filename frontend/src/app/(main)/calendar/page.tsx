import type { Metadata } from "next";
import CalendarClientPage from "./CalendarClientPage";

export const metadata: Metadata = {
  title: "Calendar - Uscornie",
  description:
    "View and track your special dates and calendar events on Uscornie.",
};

export default function CalendarPage() {
  return <CalendarClientPage />;
}
