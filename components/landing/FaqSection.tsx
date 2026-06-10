import React from "react";

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
    answer: "1. Connect your OpenAI API key to Frugal. 2. Navigate to Budget Rules. 3. Create a new rule with a hard limit amount. 4. Set the action to disable the key when the limit is reached."
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
    answer: "When you exceed your AI API budget, requests will return a 429 status code if Frugal is configured to disable your keys, preventing any surprise overspend."
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
        We are here to help you with any questions you may have. If you don&apos;t find what you need, please contact us at{" "}
        <a href="mailto:support@getfrugal.dev" className="text-blue-500 underline">
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