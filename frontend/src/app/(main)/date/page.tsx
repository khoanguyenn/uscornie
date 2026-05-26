import type { Metadata } from "next";
import DateClientPage from "./DateClientPage";

export const metadata: Metadata = {
  title: "Date Planner - Uscornie",
  description: "Plan memorable dates and schedule events on Uscornie.",
};

export default function DatePage() {
  return <DateClientPage />;
}
