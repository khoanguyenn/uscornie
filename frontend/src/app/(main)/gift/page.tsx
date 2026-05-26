import type { Metadata } from "next";
import GiftClientPage from "./GiftClientPage";

export const metadata: Metadata = {
  title: "Gift Planner - Uscornie",
  description: "Find the perfect gifts for your loved ones with Uscornie.",
};

export default function GiftPage() {
  return <GiftClientPage />;
}
