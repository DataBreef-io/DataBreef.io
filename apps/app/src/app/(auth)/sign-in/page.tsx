import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to DataBreef to access your connected reefs and Dibs.",
};

export default function SignInPage() {
  return (
    <div>
      <h1>Sign in</h1>
      {/* TODO: Auth.js sign-in form */}
      <p>Auth.js sign-in UI — coming soon.</p>
    </div>
  );
}
