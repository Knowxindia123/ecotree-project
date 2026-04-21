import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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
      <body>
        <Navbar />
        <div style={{ paddingTop: '80px' }}>
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
