// app/impact/page.tsx
import type { Metadata } from "next";
import ImpactClient from "./ImpactClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Impact Roadmap 2026–2028 | EcoTree Impact Foundation — 1,00,000 Trees · Karnataka",
  description:
    "EcoTree Impact Foundation's 2-year environmental roadmap — 1,00,000 trees planted, 5,000 tonnes waste recycled, 50 crore litres water conserved across all of Karnataka by 2028. GPS-verified impact. Public accountability.",
  keywords: [
    "tree plantation impact Karnataka 2026",
    "NGO environmental goals India",
    "CSR tree plantation impact report Bangalore",
    "Miyawaki forest Karnataka",
    "plastic waste recycling NGO India",
    "lake restoration Bangalore NGO",
    "EcoTree Impact Foundation goals",
    "environmental NGO Karnataka 2028",
    "tree plantation 1 lakh Karnataka",
    "UN SDG tree plantation India",
  ],
  openGraph: {
    title: "Impact Roadmap 2026–2028 — EcoTree Impact Foundation",
    description:
      "1,00,000 trees · 5,000T waste recycled · 50 crore litres water · All of Karnataka by 2028. Public goals. Verified impact.",
    url: "https://ecotree-project-tkr2.vercel.app/impact",
    siteName: "EcoTree Impact Foundation",
    type: "website",
  },
  alternates: {
    canonical: "https://ecotree-project-tkr2.vercel.app/impact",
  },
  robots: "index, follow",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "NGO",
      "name": "EcoTree Impact Foundation",
      "description": "Environmental NGO focused on tree plantation, waste recycling, and water conservation across Karnataka, India.",
      "url": "https://ecotree-project-tkr2.vercel.app",
      "areaServed": "Karnataka, India",
      "knowsAbout": ["Tree plantation", "Miyawaki forest", "Waste recycling", "Water conservation", "CSR partnerships"],
      "foundingDate": "2024",
      "slogan": "Every tree tracked. Every impact verified.",
    },
    {
      "@type": "ItemList",
      "name": "EcoTree 2028 Impact Goals",
      "description": "EcoTree Impact Foundation's publicly committed environmental targets for Karnataka by 2028",
      "itemListElement": [
        { "@type":"ListItem", "position":1, "name":"Trees Planted",    "description":"1,00,000 trees planted across all 30 districts of Karnataka using Miyawaki method and native species" },
        { "@type":"ListItem", "position":2, "name":"Waste Recycled",   "description":"5,000 tonnes of plastic and mixed waste recycled — converted to bricks, tiles, and road material" },
        { "@type":"ListItem", "position":3, "name":"Water Conserved",  "description":"50 crore litres of water conserved through lake restoration, rainwater harvesting, and tree plantation" },
        { "@type":"ListItem", "position":4, "name":"Volunteers",       "description":"5,000 registered volunteers trained and active across Karnataka" },
        { "@type":"ListItem", "position":5, "name":"CSR Partners",     "description":"50 corporate CSR partners with GPS-verified impact reports and quarterly certificates" },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why does EcoTree set public impact goals?",
          "acceptedAnswer": { "@type":"Answer", "text":"EcoTree publishes its 2028 goals publicly so donors, CSR partners, and communities can hold the organisation accountable. Every target is tracked on a live dashboard updated daily." },
        },
        {
          "@type": "Question",
          "name": "How do you verify trees are actually planted?",
          "acceptedAnswer": { "@type":"Answer", "text":"Every tree is GPS-tagged by field volunteers at the moment of planting using the EcoTree app. Location, species, and health are verified by coordinators before counting toward totals." },
        },
        {
          "@type": "Question",
          "name": "What is Miyawaki forest plantation?",
          "acceptedAnswer": { "@type":"Answer", "text":"The Miyawaki method plants native trees 3-5 per square metre, growing 10x faster than conventional plantation and becoming self-sustaining within 3 years. EcoTree uses this method for urban greening across Bangalore and Karnataka." },
        },
        {
          "@type": "Question",
          "name": "Which UN SDGs does EcoTree contribute to?",
          "acceptedAnswer": { "@type":"Answer", "text":"EcoTree contributes to SDG 13 (Climate Action), SDG 15 (Life on Land), SDG 6 (Clean Water), SDG 11 (Sustainable Cities), and SDG 17 (Partnerships for the Goals)." },
        },
        {
          "@type": "Question",
          "name": "How can my company partner with EcoTree for CSR?",
          "acceptedAnswer": { "@type":"Answer", "text":"CSR partners receive GPS-verified impact reports, quarterly certificates, live dashboard access, and dedicated plantation zones. Contact EcoTree to design a custom programme." },
        },
      ],
    },
  ],
};

export default function ImpactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImpactClient />
    </>
  );
}
