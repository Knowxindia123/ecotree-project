
import Hero              from '@/components/sections/Hero'
import ImpactBar         from '@/components/sections/ImpactBar'
import DashboardPreview  from '@/components/sections/DashboardPreview'
import HowItWorks        from '@/components/sections/HowItWorks'
import ThreeVerticals    from '@/components/sections/ThreeVerticals'
import AIVerification    from '@/components/sections/AIVerification'
import OccasionGifting   from '@/components/sections/OccasionGifting'
import CSRSection        from '@/components/sections/CSRSection'
import FounderStory      from '@/components/sections/FounderStory'
import Testimonials      from '@/components/sections/Testimonials'
import FinalCTA          from '@/components/sections/FinalCTA'

export default function HomePage() {
  return (
    <>
     
      <main>
        <Hero />
        <ImpactBar />
        <DashboardPreview />
        <HowItWorks />
        <ThreeVerticals />
        <AIVerification />
        <OccasionGifting />
        <CSRSection />
        <FounderStory />
        <Testimonials />
        <FinalCTA />
      </main>
      
    </>
  )
}
