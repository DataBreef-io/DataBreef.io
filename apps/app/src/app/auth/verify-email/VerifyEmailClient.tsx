"use client";

import { useState, useEffect } from "react";

interface Props {
  email: string | null;
  error?: "invalid" | "expired";
}

export function VerifyEmailClient({ email, error }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  async function handleResend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (res.status === 429) {
        setCooldown(data.waitSeconds ?? 60);
        setStatus("idle");
      } else if (res.ok) {
        setStatus("sent");
        setCooldown(60);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="rounded-lg bg-red-50 p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              {error === "expired" ? "Link expired" : "Invalid link"}
            </h2>
            <p className="text-sm text-red-700">
              {error === "expired"
                ? "This verification link has expired. Request a new one below."
                : "This verification link is invalid or has already been used."}
            </p>
          </div>
          <button
            onClick={handleResend}
            disabled={status === "sending" || cooldown > 0}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Send new verification link"}
          </button>
          {status === "sent" && (
            <p className="text-sm text-green-700">New verification email sent. Check your inbox.</p>
          )}
          {status === "error" && (
            <p className="text-sm text-red-600">Failed to send email. Please try again.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
            📧
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to{" "}
            {email ? (
              <span className="font-semibold text-gray-900">{email}</span>
            ) : (
              "your email address"
            )}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          Click the link in your email to verify your account. The link expires in 15 minutes.
        </div>

        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Don&apos;t see it?</strong> Check your spam or junk folder.
        </div>

        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500">Didn&apos;t receive it?</p>
          <button
            onClick={handleResend}
            disabled={status === "sending" || cooldown > 0}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {status === "sending"
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend verification email"}
          </button>
          {status === "sent" && (
            <p className="text-center text-sm text-green-700">Email sent! Check your inbox.</p>
          )}
          {status === "error" && (
            <p className="text-center text-sm text-red-600">Something went wrong. Try again.</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 text-center">
          <a href="/dashboard" className="text-sm text-blue-600 hover:text-blue-500">
            Continue to dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
