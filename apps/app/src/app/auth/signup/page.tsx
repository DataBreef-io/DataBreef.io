"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { scorePassword } from "@/lib/auth/password-client";
import { hashPasswordAction, checkHIBPAction } from "./actions";
import s from "../auth.module.css";

const SCORE_LABELS = ["Very Weak", "Weak", "Fair", "Good", "Very Strong"];
const SCORE_COLORS = [
  "hsl(350,65%,58%)",
  "hsl(16,80%,62%)",
  "hsl(182,90%,58%)",
  "hsl(148,50%,58%)",
  "hsl(152,55%,46%)",
];

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordScore, setPasswordScore] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 12) { setError("Password must be at least 12 characters"); return; }
    if (passwordScore < 2) { setError("Password is too weak. Please use a stronger password."); return; }

    setLoading(true);
    try {
      const hibpCheck = await checkHIBPAction(password);
      if (hibpCheck.isPwned) {
        setError(`This password has been found in ${hibpCheck.count} data breaches. Please choose a different password.`);
        setLoading(false);
        return;
      }

      const passwordHash = await hashPasswordAction(password);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordHash }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Sign up failed");
        setLoading(false);
        return;
      }

      router.push("/auth/signin?email=" + encodeURIComponent(email));
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.accentBar} />
        <div className={s.cardBody}>
          <div className={s.brandMark}>DataBreef</div>
          <p className={s.eyebrow}>Start Diving</p>
          <h1 className={s.heading}>Anchor your<br />account</h1>

          {error && <div className={s.errorBox}>{error}</div>}

          <form onSubmit={handleSignUp} className={s.form}>
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
              <label htmlFor="password" className={s.label}>Password (min. 12 characters)</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={handlePasswordChange}
                className={s.input}
                placeholder="••••••••"
              />
              {password.length > 0 && (
                <>
                  <div className={s.strengthRow}>
                    <div className={s.strengthBar}>
                      <div
                        className={s.strengthFill}
                        style={{
                          width: `${(passwordScore + 1) * 20}%`,
                          backgroundColor: SCORE_COLORS[passwordScore],
                        }}
                      />
                    </div>
                    <span
                      className={s.strengthLabel}
                      style={{ color: SCORE_COLORS[passwordScore] }}
                    >
                      {SCORE_LABELS[passwordScore]}
                    </span>
                  </div>
                  {passwordFeedback.length > 0 && (
                    <ul className={s.strengthHints}>
                      {passwordFeedback.slice(0, 2).map((tip, i) => (
                        <li key={i} className={s.strengthHint}>
                          <span>·</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>

            <div className={s.field}>
              <label htmlFor="confirmPassword" className={s.label}>Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={s.input}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading || password.length === 0 || passwordScore < 2}
              className={s.btnPrimary}
            >
              {loading ? "Anchoring your account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className={s.legalText}>
          By signing up, you agree to our{" "}
          <Link href="/legal/terms" className={s.legalLink}>Terms of Service</Link>{" "}
          and{" "}
          <Link href="/legal/privacy" className={s.legalLink}>Privacy Policy</Link>.
        </p>

        <div className={s.cardFooter}>
          <span className={s.footerText}>Already have an account?</span>
          <Link href="/auth/signin" className={s.footerLink}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
