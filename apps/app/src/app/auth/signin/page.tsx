"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import s from "../auth.module.css";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl, redirect: true });
    } catch (err) {
      setError(`${provider} sign-in failed. Please try again.`);
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.accentBar} />
        <div className={s.cardBody}>
          <div className={s.brandMark}>DataBreef</div>
          <p className={s.eyebrow}>Dive In</p>
          <h1 className={s.heading}>Welcome back<br />to the reef</h1>

          {error && <div className={s.errorBox}>{error}</div>}

          <form onSubmit={handleEmailSignIn} className={s.form}>
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

            <div className={s.field}>
              <div className={s.fieldRow}>
                <label htmlFor="password" className={s.label}>Password</label>
                <Link href="/auth/forgot-password" className={s.forgotLink}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={s.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} className={s.btnPrimary}>
              {loading ? "Diving in…" : "Sign in"}
            </button>
          </form>

          <div className={s.divider}>
            <div className={s.dividerLine} />
            <span className={s.dividerText}>or continue with</span>
            <div className={s.dividerLine} />
          </div>

          <div className={s.oauthButtons}>
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={loading}
              className={s.btnSecondary}
            >
              Sign in with Google
            </button>
            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={loading}
              className={s.btnSecondary}
            >
              Sign in with GitHub
            </button>
          </div>
        </div>

        <div className={s.cardFooter}>
          <span className={s.footerText}>New to DataBreef?</span>
          <Link href="/auth/signup" className={s.footerLink}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
