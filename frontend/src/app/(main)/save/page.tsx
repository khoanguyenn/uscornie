"use client";

import dynamic from "next/dynamic";

const SavePageContent = dynamic(() => import("./SavePageContent"), {
  ssr: false,
});

export default function Page() {
  return <SavePageContent />;
}
