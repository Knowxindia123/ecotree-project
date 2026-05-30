import type { Metadata } from "next";
import WasteClient from "./WasteClient";

export const metadata: Metadata = {
  title: "Plastic Waste to Urban Infrastructure | EcoTree Impact Foundation",
  description:
    "EcoTree converts industrial plastic waste into interlocking bricks, tree guards, pavers & urban furniture. GPS-verified circular economy impact for CSR partners. 300 tons recycled. Bangalore, Hosur, Coimbatore.",
  keywords: [
    "recycled plastic products India",
    "plastic waste to pavers",
    "eco paver Bangalore",
    "CSR plastic recycling",
    "circular economy NGO India",
    "plastic waste urban infrastructure",
    "EcoTree recycled products",
  ],
  openGraph: {
    title: "From Plastic Waste to Urban Infrastructure | EcoTree",
    description:
      "300 tons of plastic recycled. 70,805 kg installed on pathways and footpaths. 1,000+ trees protected. India's integrated circular sustainability platform.",
    url: "https://ecotrees.org/waste",
    siteName: "EcoTree Impact Foundation",
    images: [{ url: "/images/waste/hero-waste.jpg", width: 1200, height: 630, alt: "EcoTree recycled plastic paver installation" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plastic Waste to Urban Infrastructure | EcoTree",
    description: "300 tons recycled. 70,805 kg installed. India's integrated circular economy NGO.",
  },
  alternates: {
    canonical: "https://ecotrees.org/waste",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "Plastic Waste Recycling & Urban Infrastructure",
      provider: {
        "@type": "NGO",
        name: "EcoTree Impact Foundation",
        url: "https://ecotrees.org",
      },
      description:
        "EcoTree collects industrial plastic waste and manufactures it into urban infrastructure products — pavers, tiles, kerbs, grass pavers, and poly bricks — installed on pathways and public spaces.",
      areaServed: ["Bangalore", "Hosur", "Coimbatore", "India"],
      serviceType: "Circular Economy & Plastic Recycling",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What products does EcoTree make from recycled plastic?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EcoTree manufactures Eco Pavers, Eco Tiles, Nature Kerbs, Grass Pavers, and Poly Bricks — 10+ product variants in total — all made from 100% recycled industrial plastic waste.",
          },
        },
        {
          "@type": "Question",
          name: "How much plastic has EcoTree recycled?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EcoTree has recycled over 300 tons of plastic waste, converting 70,805 kg into installed urban infrastructure across 4 major project sites in Bangalore, Hosur, and Coimbatore.",
          },
        },
        {
          "@type": "Question",
          name: "Can companies partner with EcoTree for CSR plastic recycling?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. EcoTree partners with industrial companies to collect and recycle their plastic waste. Partners receive GPS-verified impact reports, ESG-ready data, and visible public infrastructure bearing their CSR contribution.",
          },
        },
        {
          "@type": "Question",
          name: "Which companies has EcoTree worked with?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "EcoTree has partnered with Titan Eyewear, Shahi Export, South Western Railway, Microtex, LM Wind Mill, MRPL (Mangalore Refinery), Sabari Recyclers, and Titan Jewellery among others.",
          },
        },
      ],
    },
  ],
};

export default function WastePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WasteClient />
    </>
  );
}
