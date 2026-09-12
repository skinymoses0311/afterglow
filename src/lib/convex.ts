import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL;

if (!url) {
  // Failing loudly at startup beats a form that silently drops submissions.
  throw new Error(
    "VITE_CONVEX_URL is not set. Copy .env.example to .env.local, or run `npx convex dev` to generate it.",
  );
}

/**
 * Created in the browser only. The build imports every page to pre-render it,
 * and this module comes along with the forms; constructing the client there
 * would open a live connection to the production deployment from the build.
 *
 * Nothing touches it during a render — submissions happen in event handlers,
 * and no component uses a Convex hook. One that did would need rethinking for
 * pre-rendering anyway.
 */
export const convex = (typeof window === "undefined" ? undefined : new ConvexReactClient(url)) as ConvexReactClient;
