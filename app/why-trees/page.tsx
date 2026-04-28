// app/why-trees/page.tsx
import type { Metadata } from "next";
import WhyTreesClient from "./WhyTreesClient";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Why Trees Are Important | Tree Plantation Benefits & CSR Impact | EcoTree Bangalore",
  description:
    "Discover why trees are essential for climate, water, air quality, and life. Learn about the Miyawaki method, native species, and how EcoTree's GPS-verified tree plantation creates real impact across Karnataka.",
  keywords: [
    "why trees are important",
    "tree plantation benefits India",
    "Miyawaki forest Bangalore",
    "tree plantation CSR Karnataka",
    "why plant trees environment",
    "benefits of tree plantation India",
    "native trees Karnataka",
    "tree plantation NGO Bangalore",
    "carbon offset tree plantation India",
    "urban tree plantation Bangalore",
  ],
  openGraph: {
    title: "Why Trees Matter More Than Ever | EcoTree Impact Foundation",
    description:
      "Trees clean air, save water, fight climate change, and support life. Plant and track your trees with EcoTree's GPS-verified platform across Karnataka.",
    url: "https://ecotree-project-tkr2.vercel.app/why-trees",
    siteName: "EcoTree Impact Foundation",
    type: "website",
  },
  alternates: {
    canonical: "https://ecotree-project-tkr2.vercel.app/why-trees",
  },
  robots: "index, follow",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "name": "Why Trees Are Important",
      "description": "Comprehensive guide to tree plantation benefits — air quality, water conservation, climate change, biodiversity, and CSR impact.",
      "url": "https://ecotree-project-tkr2.vercel.app/why-trees",
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type":"ListItem", "position":1, "name":"Home",      "item":"https://ecotree-project-tkr2.vercel.app" },
          { "@type":"ListItem", "position":2, "name":"Why Trees", "item":"https://ecotree-project-tkr2.vercel.app/why-trees" },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Why are trees important for the environment?",
          "acceptedAnswer": { "@type":"Answer", "text":"Trees absorb carbon dioxide, release oxygen, regulate water cycles, prevent soil erosion, and support over 80% of all land-based species. Without trees, ecosystems collapse." },
        },
        {
          "@type": "Question",
          "name": "How does tree plantation help climate change?",
          "acceptedAnswer": { "@type":"Answer", "text":"Each tree absorbs approximately 22 kg of CO₂ per year. At scale, tree plantation is one of the most cost-effective climate interventions available." },
        },
        {
          "@type": "Question",
          "name": "What is the Miyawaki forest method?",
          "acceptedAnswer": { "@type":"Answer", "text":"The Miyawaki method plants native trees densely — 3 to 5 per square metre — growing 10× faster than conventional plantation and becoming self-sustaining within 3 years." },
        },
        {
          "@type": "Question",
          "name": "Can I track my planted tree?",
          "acceptedAnswer": { "@type":"Answer", "text":"Yes. With EcoTree, every tree is GPS-tagged at planting. You get a personal dashboard to see your trees on a live map and check their health." },
        },
        {
          "@type": "Question",
          "name": "What is the 80G tax benefit for tree donation?",
          "acceptedAnswer": { "@type":"Answer", "text":"EcoTree is registered under Section 80G of the Indian Income Tax Act. Donations are eligible for 50% tax deduction with an official certificate." },
        },
      ],
    },
  ],
};

export default function WhyTreesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WhyTreesClient />
    </>
  );
}
