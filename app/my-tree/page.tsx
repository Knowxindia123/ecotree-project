// app/my-tree/page.tsx
import type { Metadata } from "next";
import MyTreeClient from "./MyTreeClient";

export const metadata: Metadata = {
  title: "My Trees | EcoTree Impact Foundation — Track Your Personal Impact",
  description:
    "Track your personal tree plantation impact with EcoTree. See your trees on a live GPS map, download your impact certificate, and share your contribution to Bangalore's green cover.",
  robots: "noindex", // private donor page — don't index
};

export default function MyTreePage() {
  return <MyTreeClient />;
}
