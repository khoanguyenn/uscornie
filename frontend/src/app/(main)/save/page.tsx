import type { Metadata } from "next";
import SaveClientPage from "./SaveClientPage";

export const metadata: Metadata = {
  title: "Save - Uscornie",
  description:
    "Save and organize your favorite memories and items on Uscornie.",
};

export default function Page() {
  return <SaveClientPage />;
}
