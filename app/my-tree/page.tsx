import type { Metadata } from "next";
import { Suspense } from "react";
import MyTreeClient from "./MyTreeClient";

export const metadata: Metadata = {
  title: "My Trees | EcoTree Impact Foundation — Track Your Personal Impact",
  description:
    "Track your personal tree plantation impact with EcoTree. See your trees on a live GPS map, download your impact certificate, and share your contribution to Bangalore's green cover.",
  robots: "noindex",
};

export default function MyTreePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', background:'#1A3C34', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🌳</div>
          <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.6)' }}>Loading your forest...</div>
        </div>
      </div>
    }>
      <MyTreeClient />
    </Suspense>
  );
}
