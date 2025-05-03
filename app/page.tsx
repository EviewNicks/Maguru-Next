'use client'
export const dynamic = 'force-dynamic'

import HeroSection from '@/features/home-page/components/sections/HeroSection'
import LogosSection from '@/features/home-page/components/sections/LogosSection'
import FeaturesSection from '@/features/home-page/components/sections/FeaturesSection'
import HowItWorksSection from '@/features/home-page/components/sections/HowItWorksSection'
import TestimonialsSection from '@/features/home-page/components/sections/TestimonialsSection'
import PricingSection from '@/features/home-page/components/sections/PricingSection'
import FaqSection from '@/features/home-page/components/sections/FaqSection'
import CtaSection from '@/features/home-page/components/sections/CtaAction'

export default function LandingPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="flex-1">
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
    </div>
  )
}
