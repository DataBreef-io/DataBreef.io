"use client";

import { useState } from "react";
import Link from "next/link";
import s from "../auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.status === 429) {
        const data = await response.json();
        const minutes = Math.ceil((data.waitSeconds ?? 300) / 60);
        setError(`Too many requests. Please wait ${minutes} minute${minutes !== 1 ? "s" : ""} before trying again.`);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={s.page}>
        <div className={s.card}>
          <div className={s.accentBar} />
          <div className={s.cardBody}>
            <div className={s.brandMark}>DataBreef</div>
            <div className={s.successState}>
              <div className={s.successIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="hsl(148,50%,58%)" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <p className={s.eyebrow}>Message sent</p>
              <h1 className={s.heading}>Check your<br />inbox</h1>
              <p className={s.subtext}>
                If an account exists for{" "}
                <strong style={{ color: "var(--color-seafoam)" }}>{email}</strong>,
                {" "}we sent a reset link. It expires in 15 minutes.
              </p>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                color: "var(--color-sand-dark)",
                lineHeight: 1.5,
              }}>
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    color: "var(--color-brine)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  try again
                </button>.
              </p>
            </div>
          </div>
          <div className={s.cardFooter}>
            <Link href="/auth/signin" className={s.footerLink}>← Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.accentBar} />
        <div className={s.cardBody}>
          <div className={s.brandMark}>DataBreef</div>
          <p className={s.eyebrow}>Account Security</p>
          <h1 className={s.heading}>Surface your<br />access</h1>
          <p className={s.subtext}>
            Enter your email and we&apos;ll send a reset link to the surface.
          </p>

          {error && <div className={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            <div className={s.field}>
              <label htmlFor="email" className={s.label}>Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={s.input}
                placeholder="you@example.com"
              />
            </div>

            <button type="submit" disabled={loading || !email} className={s.btnPrimary}>
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>

        <div className={s.cardFooter}>
          <span className={s.footerText}>Remember your password?</span>
          <Link href="/auth/signin" className={s.footerLink}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
