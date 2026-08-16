// Must stay first: strips the unsubscribe token from the URL before anything
// else — ours or Google's — can read it.
import "./lib/unsubscribeToken";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import "./index.css";
import { initAnalyticsShim, loadAnalytics } from "./lib/analytics";
import { getConsent } from "./lib/consent";

// The shim is inert: a queue in memory, no request and no cookie. The script
// itself only loads for a visitor who has already accepted.
initAnalyticsShim();
if (getConsent() === "granted") loadAnalytics();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
