/**
 * proxy.ts
 * Next.js 16 route proxy for Auth.js v5 middleware.
 *
 * Replaces deprecated middleware.ts convention.
 * Uses Auth.js's built-in authorization callback to protect routes.
 *
 * See: https://authjs.dev/getting-started/nextjs
 */

export { auth as proxy } from "./lib/auth";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
