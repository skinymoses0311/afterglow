import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL;

if (!url) {
  // Failing loudly at startup beats a form that silently drops submissions.
  throw new Error(
    "VITE_CONVEX_URL is not set. Copy .env.example to .env.local, or run `npx convex dev` to generate it.",
  );
}

/**
 * Only ever reached through lib/loadSubmissions, so it isn't part of any page's
 * initial JavaScript, and nothing loads it during the build's pre-render. The
 * browser-only guard stays as a backstop: if a page ever imported this directly,
 * constructing the client in the build would open a live connection to the
 * production deployment.
 */
export const convex = (typeof window === "undefined" ? undefined : new ConvexReactClient(url)) as ConvexReactClient;
