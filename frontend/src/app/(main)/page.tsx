import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Home - Uscornie",
  description: "Welcome to Uscornie, your digital shared space.",
};

const HomePageContent = dynamic(() => import("./HomePageContent"), {
  ssr: false,
});

export default function Page() {
  return <HomePageContent />;
}
