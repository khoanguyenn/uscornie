import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Gift Planner - Uscornie",
  description: "Find the perfect gifts for your loved ones with Uscornie.",
};

const GiftPageContent = dynamic(() => import("./GiftPageContent"), {
  ssr: false,
});

export default function GiftPage() {
  return <GiftPageContent />;
}
