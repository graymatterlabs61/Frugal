import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your free Frugal account and start tracking AI API spend across providers in minutes. No credit card required.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
