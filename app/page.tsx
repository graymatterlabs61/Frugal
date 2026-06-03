import { VideoHero } from "@/components/landing/VideoHero"
import { ProvidersBar } from "@/components/landing/ProvidersBar"
import { ProblemSection } from "@/components/landing/ProblemSection"
import { FeaturesGrid } from "@/components/landing/FeaturesGrid"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { UseCases } from "@/components/landing/UseCases"
import { PricingTeaser } from "@/components/landing/PricingTeaser"
import { FaqSection } from "@/components/landing/FaqSection"
import { FinalCTA } from "@/components/landing/FinalCTA"
import { Footer } from "@/components/landing/Footer"
import { Navbar } from "@/components/landing/Navbar"

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground relative z-0">
      {/* Global Ambient Background */}
      <div className="mesh-bg">
        <div className="mesh-orb mesh-orb-1" />
        <div className="mesh-orb mesh-orb-2" />
        <div className="mesh-orb mesh-orb-3" />
      </div>

      <Navbar />
      <VideoHero />
      <main>
        <ProvidersBar />
        <ProblemSection />
        <FeaturesGrid />
        <HowItWorks />
        {/* <TestimonialsSection /> */}
        <UseCases />
        <PricingTeaser />
        <FaqSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}