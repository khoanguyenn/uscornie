import type { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Save - Uscornie",
  description:
    "Save and organize your favorite memories and items on Uscornie.",
};

const SavePageContent = dynamic(() => import("./SavePageContent"), {
  ssr: false,
});

export default function Page() {
  return <SavePageContent />;
}
