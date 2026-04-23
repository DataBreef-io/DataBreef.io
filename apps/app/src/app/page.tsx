import { redirect } from "next/navigation";

/**
 * Root page — redirects authenticated users to /dashboard.
 * When auth is wired up, unauthenticated users will redirect to /sign-in instead.
 */
export default function RootPage() {
  redirect("/dashboard");
}
