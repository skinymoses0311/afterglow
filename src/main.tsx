// Must stay first: strips the unsubscribe token from the URL before anything
// else — ours or Google's — can read it.
import "./lib/unsubscribeToken";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Self-hosted variable fonts: one file per family from our own origin, so they
// can be preloaded, instead of nine weights fetched from Google.
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";

import App from "./App";
import { loadMobileMenu } from "./components/layout/Header";
import "./index.css";
import { initAnalyticsShim, loadAnalytics } from "./lib/analytics";
import { getConsent } from "./lib/consent";

// The shim is inert: a queue in memory, no request and no cookie. The script
// itself only loads for a visitor who has already accepted.
initAnalyticsShim();
if (getConsent() === "granted") loadAnalytics();

const app = (
  <StrictMode>
    {/* Page changes run as a transition: while a lazily loaded page (the legal
        documents) is on its way, the current page stays on screen instead of
        flashing the loading fallback. */}
    <BrowserRouter future={{ v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

const root = document.getElementById("root")!;
// Production pages arrive pre-rendered (scripts/prerender.mjs), so attach to
// that markup rather than replacing it. `vite dev` serves an empty root.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);

// Once the page has settled, fetch the phone menu in the background, so
// opening it doesn't wait on the network.
window.addEventListener(
  "load",
  () => {
    const fetchMenu = () => void loadMobileMenu();
    if ("requestIdleCallback" in window) requestIdleCallback(fetchMenu, { timeout: 5000 });
    else setTimeout(fetchMenu, 3000);
  },
  { once: true },
);
