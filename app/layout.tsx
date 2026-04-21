import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EcoTree — Every Impact, Verified.',
  description: "India's first NGO where every tree has a GPS address. Plant a tree from ₹100. AI-verified, GPS-tagged, tracked for 3 years.",
  keywords: 'tree planting NGO India, CSR tree planting, plant a tree online India, AI verified tree planting, 80G NGO Bangalore',
  openGraph: {
    title: 'EcoTree — Every Impact, Verified.',
    description: "India's first NGO where every tree has a GPS address.",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
