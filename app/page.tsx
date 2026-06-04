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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Frugal?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Frugal is an AI API cost management SaaS. It connects to your AI provider accounts and provides real-time spend dashboards, budget rules, and automated alerts to prevent unexpected costs.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best tool for monitoring LLM API costs?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Frugal provides a unified comparison table against native dashboards, letting you view real-time spend across OpenAI, Anthropic, Replicate, and fal.ai in one place.",
      },
    },
    {
      "@type": "Question",
      name: "How do I set a hard budget limit on the OpenAI API?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1. Connect your OpenAI API key to Frugal. 2. Navigate to Budget Rules. 3. Create a new rule with a hard limit amount. 4. Set the action to disable the key when the limit is reached.",
      },
    },
    {
      "@type": "Question",
      name: "How to get alerts before OpenAI API overspend?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "1. Go to the Alerts tab in Frugal. 2. Set up an alert for your OpenAI provider. 3. Configure thresholds (e.g. 80% of budget). 4. Choose email or Slack notifications.",
      },
    },
    {
      "@type": "Question",
      name: "How much does the Anthropic Claude 3 API cost compared to OpenAI?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Frugal offers a real-time comparison table of your usage so you can directly compare your effective cost-per-token across Anthropic Claude 3 models and OpenAI GPT-4 models based on your actual prompts.",
      },
    },
    {
      "@type": "Question",
      name: "What happens when you exceed your AI API budget?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "When you exceed your AI API budget, requests will return a 429 status code if Frugal is configured to disable your keys, preventing any surprise overspend.",
      },
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground relative z-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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