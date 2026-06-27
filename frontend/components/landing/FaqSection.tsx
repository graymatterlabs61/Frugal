import React from "react";
import Link from "next/link";

const faqs = [
  {
    col: 1,
    question: "What is Frugal?",
    answer: "Frugal is an AI API cost management SaaS. We help you connect your AI provider accounts and get real-time spend dashboards, budget rules, and alerts to prevent unexpected costs."
  },
  {
    col: 1,
    question: "What is the best tool for monitoring LLM API costs?",
    answer: "Frugal provides a unified comparison table against native dashboards, letting you view real-time spend across OpenAI, Anthropic, Replicate, and fal.ai in one place."
  },
  {
    col: 1,
    question: "How do I set a hard budget limit on the OpenAI API?",
    answer: "1. Connect your OpenAI API key to Frugal. 2. Navigate to Budget Rules. 3. Create a rule with your limit amount and choose the Block action. Frugal acts at the next 5-minute poll — pair it with OpenAI's native hard limit for a guaranteed stop."
  },
  {
    col: 2,
    question: "How to get alerts before OpenAI API overspend?",
    answer: "1. Go to the Alerts tab in Frugal. 2. Set up an alert for your OpenAI provider. 3. Configure thresholds (e.g. 80% of budget). 4. Choose email or Slack notifications."
  },
  {
    col: 2,
    question: "How much does the Anthropic Claude 3 API cost compared to OpenAI?",
    answer: "Frugal offers a real-time comparison table of your usage so you can directly compare your effective cost-per-token across Anthropic Claude 3 models and OpenAI GPT-4 models based on your actual prompts."
  },
  {
    col: 2,
    question: "What happens when you exceed your AI API budget?",
    answer: "Frugal alerts you by email or Slack and, with a Block rule, flags the connection at the next 5-minute poll. Because Frugal never sits between your app and the provider, pair Block with your provider's native hard limit for a guaranteed stop."
  },
  {
    col: 3,
    question: "How does the pricing work?",
    answer: (
      <>
        To see a full breakdown of limits and features, you can <Link href="/pricing" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">compare Frugal pricing plans</Link> designed for solo developers and growing teams. Plus costs $15/month (billed annually) or $19/month (billed monthly). Pro costs $39/month (billed annually) or $49/month (billed monthly). Free plan is $0 forever — 1 provider, no expiry. Corporate proxy plans are targeting Q3 2026.
      </>
    )
  },
  {
    col: 3,
    question: "What payment methods do you accept?",
    answer: "Payments are processed by Stripe — all major credit and debit cards are supported. You can upgrade, downgrade, or cancel from billing settings at any time."
  },
  {
    col: 3,
    question: "How do I contact support?",
    answer: "You can contact support by email at support@getfrugal.dev. We are here to help you with any questions or issues."
  }
];

export function FaqSection({ customFaqs }: { customFaqs?: { question: string, answer: React.ReactNode, col?: number }[] } = {}) {
  const data = customFaqs || faqs;
  const col1Faqs = data.filter(f => f.col === 1 || !f.col);
  const col2Faqs = data.filter(f => f.col === 2);
  const col3Faqs = data.filter(f => f.col === 3);

  const FaqCard = ({ question, answer }: { question: string, answer: React.ReactNode }) => (
    <div className="rounded-2xl glass-panel card-lift p-7 md:p-8">
      <h3 className="text-sm font-semibold text-foreground leading-snug">{question}</h3>
      <div className="mt-2 text-sm text-muted-foreground leading-relaxed">{answer}</div>
    </div>
  );

  return (
    <section id="faq" className="mx-auto grid max-w-7xl gap-4 px-4 py-20 md:px-8 md:py-40">
      <p className="section-eyebrow">FAQ</p>
      <h2 className="text-left text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
        Frequently asked questions
      </h2>
      <p className="max-w-lg text-left text-base text-muted-foreground leading-relaxed">
        If you don&apos;t find what you need, contact us at{" "}
        <a href="mailto:support@getfrugal.dev" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">
          support@getfrugal.dev
        </a>
      </p>
      <div className="mt-10 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-3">
        <div className="grid grid-cols-1 items-start gap-4">
          {col1Faqs.map((faq, i) => (
            <FaqCard key={`col1-${i}`} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        <div className="grid grid-cols-1 items-start gap-4">
          {col2Faqs.map((faq, i) => (
            <FaqCard key={`col2-${i}`} question={faq.question} answer={faq.answer} />
          ))}
        </div>
        <div className="grid grid-cols-1 items-start gap-4">
          {col3Faqs.map((faq, i) => (
            <FaqCard key={`col3-${i}`} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}