import type { Metadata } from "next";
import { Suspense } from "react";
import JoinPageContent from "./JoinPageContent";

export const metadata: Metadata = {
  title: "Join - Uscornie",
  description: "Join your partner's shared space on Uscornie.",
};

export default function JoinPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
