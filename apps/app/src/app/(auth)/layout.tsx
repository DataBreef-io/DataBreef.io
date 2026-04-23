/**
 * Auth shell layout — unauthenticated (auth) route group.
 * Centers content on the page with a minimal ocean backdrop.
 *
 * Future: redirect to /dashboard if already authenticated.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-shell__card">
        <div className="auth-shell__brand">
          <span>DataBreef</span>
          <p>Your schema, surfaced.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
