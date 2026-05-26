"use client";

import dynamic from "next/dynamic";

const DatePageContent = dynamic(() => import("./DatePageContent"), {
  ssr: false,
});

export default function DateClientPage() {
  return <DatePageContent />;
}
