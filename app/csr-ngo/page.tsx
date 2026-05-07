import type { Metadata } from 'next'
import CsrNgoPage from './CsrNgoClient'

export const metadata: Metadata = {
  title: 'CSR & NGO Partnership — EcoTree',
  description: 'Partner with EcoTree for verified, AI-tracked CSR impact. Tree plantation, waste processing, water conservation — BRSR-ready ESG reports. 80G approved NGO.',
}

export default function Page() {
  return <CsrNgoPage />
}
