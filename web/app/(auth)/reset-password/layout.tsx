import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New password",
  description: "Set a new password for your Frugal account.",
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
