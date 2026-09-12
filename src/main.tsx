// Must stay first: strips the unsubscribe token from the URL before anything
// else — ours or Google's — can read it.
import "./lib/unsubscribeToken";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConvexProvider } from "convex/react";

// Self-hosted variable fonts: one file per family from our own origin, so they
// can be preloaded, instead of nine weights fetched from Google.
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";

import App from "./App";
import "./index.css";
import { initAnalyticsShim, loadAnalytics } from "./lib/analytics";
import { getConsent } from "./lib/consent";
import { convex } from "./lib/convex";

// The shim is inert: a queue in memory, no request and no cookie. The script
// itself only loads for a visitor who has already accepted.
initAnalyticsShim();
if (getConsent() === "granted") loadAnalytics();

const app = (
  <StrictMode>
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProvider>
  </StrictMode>
);

const root = document.getElementById("root")!;
// Production pages arrive pre-rendered (scripts/prerender.mjs), so attach to
// that markup rather than replacing it. `vite dev` serves an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
