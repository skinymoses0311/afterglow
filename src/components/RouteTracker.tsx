import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { trackEvent } from "@/lib/analytics";

/**
 * Fires page_view on route change.
 *
 * GA4's own history-event listener is switched off in the admin, because it
 * fires synchronously on pushState — before React has committed the route or
 * updated document.title, so it reports the previous page's title against the
 * new page's URL. It also never refreshes document.referrer, so every in-app
 * navigation stays attributed to whatever site the visitor originally arrived
 * from.
 */

const TITLES: Record<string, string> = {
  "/": "AfterGlow — Glow Now, Pay Later",
  "/waitlist": "AfterGlow — Join the waitlist",
  "/merchants": "AfterGlow — For salons & clinics",
  "/book": "AfterGlow — Book a treatment",
  "/unsubscribe": "AfterGlow — Unsubscribe",
  "/privacy": "AfterGlow — Privacy",
};

/**
 * Allowlist, not a blocklist. Anything not named here is dropped before the URL
 * reaches Google, so a stray token or email in a query string can never leak.
 */
const KEEP_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
  "gclid",
]);

function safeSearch(search: string): string {
  const kept = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) {
    if (KEEP_PARAMS.has(key)) kept.append(key, value);
  }
  const query = kept.toString();
  return query ? `?${query}` : "";
}

export const RouteTracker = () => {
  const { pathname, search } = useLocation();
  const lastSent = useRef<string | null>(null);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = pathname + safeSearch(search);

    // Guards StrictMode's development double-mount, and any re-render that
    // does not actually change the location.
    if (lastSent.current === path) return;

    const title = TITLES[pathname] ?? "AfterGlow — Page not found";
    document.title = title; // set before the event, so page_title is correct

    const referrer = lastPath.current
      ? window.location.origin + lastPath.current
      : document.referrer || undefined;

    trackEvent("page_view", {
      page_location: window.location.origin + path,
      page_title: title,
      ...(referrer ? { page_referrer: referrer } : {}),
    });

    if (!(pathname in TITLES)) {
      trackEvent("page_not_found", { af_page_path: path });
    }

    lastSent.current = path;
    lastPath.current = path;
  }, [pathname, search]);

  return null;
};
