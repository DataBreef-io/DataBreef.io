"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { scorePassword } from "@/lib/auth/password-client";
import styles from "../auth.module.css";
import { hashPasswordAction, checkHIBPAction } from "./actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setPassword(pwd);

    if (pwd.length > 0) {
      const { score, feedback } = scorePassword(pwd);
      setPasswordScore(score);
      setPasswordFeedback(feedback.suggestions || []);
    } else {
      setPasswordScore(0);
      setPasswordFeedback([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters");
      return;
    }

    if (passwordScore < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setLoading(true);

    try {
      const hibpCheck = await checkHIBPAction(password);
      if (hibpCheck.isPwned) {
        setError(
          `This password has been found in ${hibpCheck.count} data breaches. Please choose a different password.`
        );
        setLoading(false);
        return;
      }

      const passwordHash = await hashPasswordAction(password);

      const response = await fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordHash }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to reset password. The link may have expired.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/signin"), 3000);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number): string => {
    return (["Very Weak", "Weak", "Fair", "Good", "Very Strong"])[score] ?? "Unknown";
  };

  const getScoreColor = (score: number): string => {
    return (["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"])[score] ?? "bg-gray-300";
  };

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.accentBar} />
          <div className={styles.cardBody}>
            <div className={styles.brandMark}>DataBreef</div>
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-foam)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className={styles.eyebrow}>Password Reset</p>
              <h2 className={styles.heading}>Depths secured.</h2>
              <p className={styles.subtext}>
                Your credentials have been updated. Surfacing you back to sign in&hellip;
              </p>
              <Link href="/auth/signin" className={styles.btnPrimary} style={{ display: "block", textDecoration: "none", textAlign: "center" }}>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Invalid reset link</h2>
            <p className="mt-2 text-sm text-gray-600">
              This password reset link is missing or invalid.
            </p>
          </div>
          <Link href="/auth/forgot-password" className="block text-sm font-semibold text-blue-600 hover:text-blue-500">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="text-center text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose a strong new password for your account.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
            {error.toLowerCase().includes("expired") || error.toLowerCase().includes("invalid") ? (
              <Link href="/auth/forgot-password" className="mt-2 block text-sm font-semibold text-red-700 hover:text-red-600">
                Request a new reset link
              </Link>
            ) : null}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New password (minimum 12 characters)
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={handlePasswordChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
            />

            {password.length > 0 && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreColor(passwordScore)}`}
                      style={{ width: `${(passwordScore + 1) * 20}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{getScoreLabel(passwordScore)}</span>
                </div>
                {passwordFeedback.length > 0 && (
                  <ul className="space-y-1 text-xs text-gray-600">
                    {passwordFeedback.slice(0, 2).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || password.length === 0 || passwordScore < 2}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Updating password..." : "Reset password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link href="/auth/signin" className="font-semibold text-blue-600 hover:text-blue-500">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
