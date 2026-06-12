import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Sign in to Frugal",
    template: "%s | Frugal",
  },
  description:
    "Sign in or create your Frugal account to start monitoring AI API costs across OpenAI, Anthropic, Replicate, and fal.ai.",
  robots: { index: false, follow: false },
};

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
