import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { trackEvent } from "@/lib/analytics";
import { NOT_FOUND_TITLE, PAGES, SITE_ORIGIN, isPagePath } from "@/seo/pages";

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

/**
 * Points each indexable page at its one canonical URL, and removes the tag
 * everywhere else. Without it, a host serving the same content twice — www vs
 * apex, say — reads as duplicate content. Pre-rendered pages arrive with the
 * right tag already; this keeps it right as the visitor navigates.
 */
function setCanonical(path: string | null): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (path === null) {
    link?.remove();
    return;
  }
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = SITE_ORIGIN + path;
}

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

    const page = isPagePath(pathname) ? PAGES[pathname] : null;
    const title = page?.title ?? NOT_FOUND_TITLE;
    document.title = title; // set before the event, so page_title is correct
    // Canonical uses the path only — query strings are not distinct pages here.
    setCanonical(page?.indexable ? pathname : null);

    const referrer = lastPath.current
      ? window.location.origin + lastPath.current
      : document.referrer || undefined;

    trackEvent("page_view", {
      page_location: window.location.origin + path,
      page_title: title,
      ...(referrer ? { page_referrer: referrer } : {}),
    });

    if (!page) {
      trackEvent("page_not_found", { af_page_path: path });
    }

    lastSent.current = path;
    lastPath.current = path;
  }, [pathname, search]);

  return null;
};
