import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { verifyEmailToken } from "@/lib/auth/verification";
import { VerifyEmailClient } from "./VerifyEmailClient";

export const metadata: Metadata = { title: "Verify Email — DataBreef" };

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (token) {
    const result = await verifyEmailToken(token);
    if (result) {
      redirect("/dashboard");
    }
    // Token was invalid or expired — show error UI (no session needed)
    return <VerifyEmailClient email={null} error="invalid" />;
  }

  // No token — show "check your email" UI
  const session = await auth();
  const email = session?.user?.email ?? null;

  if (!session) {
    redirect("/auth/signin");
  }

  return <VerifyEmailClient email={email} />;
}
