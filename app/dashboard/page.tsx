// app/dashboard/page.tsx
import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const revalidate = 86400; // ISR — revalidate daily at midnight

export const metadata: Metadata = {
  title: "Live Impact Dashboard | EcoTree Impact Foundation — Trees, Waste & Water",
  description:
    "Track EcoTree Impact Foundation's verified environmental impact in real time — trees planted across Bangalore, waste recycled, water conserved, and CO₂ offset. Transparent data for donors and CSR partners.",
  keywords: [
    "tree plantation impact dashboard Bangalore",
    "CSR tree plantation impact India",
    "NGO environmental impact tracker",
    "how many trees planted Bangalore 2026",
    "corporate CSR green impact report India",
    "EcoTree Impact Foundation",
    "tree plantation NGO Bangalore",
  ],
  openGraph: {
    title: "Live Impact Dashboard — EcoTree Impact Foundation",
    description:
      "Real-time environmental impact: 12,847 trees planted, 2,82,634 kg CO₂ offset, 5,230 kg waste recycled across Bangalore.",
    url: "https://ecotree-project-tkr2.vercel.app/dashboard",
    siteName: "EcoTree Impact Foundation",
    type: "website",
  },
  alternates: {
    canonical: "https://ecotree-project-tkr2.vercel.app/dashboard",
  },
};

// JSON-LD Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "name": "EcoTree Impact Foundation — Live Environmental Dashboard",
      "description":
        "Verified data on trees planted, waste recycled, and water conserved by EcoTree Impact Foundation across Bangalore.",
      "url": "https://ecotree-project-tkr2.vercel.app/dashboard",
      "creator": {
        "@type": "NGO",
        "name": "EcoTree Impact Foundation",
        "url": "https://ecotree-project-tkr2.vercel.app",
        "areaServed": "Bangalore, Karnataka, India",
      },
      "measurementTechnique": "GPS-verified field data + ISFR carbon sequestration standards",
      "temporalCoverage": "2005/..",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does EcoTree track trees planted?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each tree is GPS-tagged by field volunteers using the EcoTree mobile app. Location, species, and planting date are recorded and verified before being counted.",
          },
        },
        {
          "@type": "Question",
          "name": "How is CO₂ offset calculated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We use the Indian State of Forest Report (ISFR) standard of 22 kg CO₂ absorbed per tree per year — a conservative, credible baseline.",
          },
        },
        {
          "@type": "Question",
          "name": "Can my company get a CSR impact report?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. All CSR partners receive quarterly PDF impact reports with GPS data, species breakdown, and verified tree counts.",
          },
        },
      ],
    },
  ],
};

export default function DashboardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DashboardClient />
    </>
  );
}
