import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL;

if (!url) {
  // Failing loudly at startup beats a form that silently drops submissions.
  throw new Error(
    "VITE_CONVEX_URL is not set. Copy .env.example to .env.local, or run `npx convex dev` to generate it.",
  );
}

export const convex = new ConvexReactClient(url);
