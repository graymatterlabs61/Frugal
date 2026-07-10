import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Check your inbox and click the verification link to activate your Frugal account.",
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
