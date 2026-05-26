"use client";

import dynamic from "next/dynamic";

const HomePageContent = dynamic(() => import("./HomePageContent"), {
  ssr: false,
});

export default function HomeClientPage() {
  return <HomePageContent />;
}
