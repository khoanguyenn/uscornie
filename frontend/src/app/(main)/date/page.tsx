import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Date Planner - Uscornie",
  description: "Plan memorable dates and schedule events on Uscornie.",
};

const DatePageContent = dynamic(() => import("./DatePageContent"), {
  ssr: false,
});

export default function DatePage() {
  return <DatePageContent />;
}
