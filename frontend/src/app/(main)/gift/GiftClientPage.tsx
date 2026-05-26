"use client";

import dynamic from "next/dynamic";

const GiftPageContent = dynamic(() => import("./GiftPageContent"), {
  ssr: false,
});

export default function GiftClientPage() {
  return <GiftPageContent />;
}
