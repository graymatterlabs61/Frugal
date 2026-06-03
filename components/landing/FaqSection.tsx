import React from "react";

const faqs = [
  {
    col: 1,
    question: "What is Frugal?",
    answer: "Frugal is an AI API cost management SaaS. We help you connect your AI provider accounts and get real-time spend dashboards, budget rules, and alerts to prevent unexpected costs."
  },
  {
    col: 1,
    question: "Which AI providers do you support?",
    answer: "Currently we support OpenAI, Anthropic, Replicate, and fal.ai. We're constantly adding more providers to our platform."
  },
  {
    col: 1,
    question: "Are my API keys secure?",
    answer: "Absolutely. All API keys are encrypted using AES-256 with a server-side secret before storage, and are never exposed to the client."
  },
  {
    col: 2,
    question: "How does the polling work?",
    answer: "We pull usage data from provider APIs on a 5-minute cron schedule. This means your dashboard is near real-time with up to a 5-minute enforcement lag."
  },
  {
    col: 2,
    question: "What happens if I hit a budget limit?",
    answer: "When you hit a budget limit, Frugal automatically triggers an alert via email and Slack, and can enforce rules to prevent further API usage depending on your configuration."
  },
  {
    col: 2,
    question: "Can I export my usage data?",
    answer: "Yes, you can export your usage data history directly from the dashboard for your own accounting and analysis purposes."
  },
  {
    col: 3,
    question: "How does the pricing work?",
    answer: "We offer Hobby, Pro, and Enterprise plans with transparent pricing based on your project volume and feature needs. Every plan includes a free tier."
  },
  {
    col: 3,
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including credit cards, debit cards, PayPal, and bank transfers. Choose the most convenient option for you during checkout."
  },
  {
    col: 3,
    question: "How do I contact support?",
    answer: "You can contact support by email at support@frugal.com. We are here to help you with any questions or issues."
  }
];

export function FaqSection() {
  const col1Faqs = faqs.filter(f => f.col === 1);
  const col2Faqs = faqs.filter(f => f.col === 2);
  const col3Faqs = faqs.filter(f => f.col === 3);

  const FaqCard = ({ question, answer }: { question: string, answer: string }) => (
    <div className="cursor-pointer rounded-2xl glass-panel backdrop-blur-md p-8 shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] dark:shadow-[2px_4px_16px_0px_rgba(248,248,248,0.06)_inset]">
      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">{question}</h3>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 lg:text-base">{answer}</p>
    </div>
  );

  return (
    <section id="faq" className="mx-auto grid max-w-7xl gap-4 px-4 py-20 md:px-8 md:py-40">
      <h2 className="text-left text-4xl font-medium tracking-tight text-neutral-600 dark:text-neutral-50 md:text-5xl">
        Frequently asked questions
      </h2>
      <p className="max-w-lg text-left text-base text-neutral-600 dark:text-neutral-50">
        We are here to help you with any questions you may have. If you don't find what you need, please contact us at{" "}
        <a href="mailto:support@frugal.com" className="text-blue-500 underline">
          support@frugal.com
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