import type { Metadata } from "next";
import HomeClientPage from "./HomeClientPage";

export const metadata: Metadata = {
  title: "Home - Uscornie",
  description: "Welcome to Uscornie, your digital shared space.",
};

export default function Page() {
  return <HomeClientPage />;
}
