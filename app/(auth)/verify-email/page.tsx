import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ShowcaseVerifyEmail } from "@/components/auth/ShowcaseVerifyEmail";
import { VerifyEmailForm } from "./VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <AuthLayout showcase={<ShowcaseVerifyEmail />}>
      <Suspense fallback={<div className="animate-pulse h-64 rounded-xl bg-white/5" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
