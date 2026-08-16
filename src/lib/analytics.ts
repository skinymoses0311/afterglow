/**
 * Google Analytics 4.
 *
 * Two-stage by design. `initAnalyticsShim()` runs at startup and only installs
 * the dataLayer queue — no network request, no cookie, no bytes. `loadAnalytics()`
 * injects the actual script and runs only after consent.
 *
 * The split matters: if the whole thing were deferred to the consent callback,
 * the entry pageview would be lost forever. The route effect fires on mount,
 * finds no gtag, no-ops, and sets its dedupe ref — and by the time consent
 * arrives no location has changed, so nothing re-fires. Most visitors to a
 * waitlist site only ever see one page, so that is most of the landing data.
 * Queuing into memory instead means the entry pageview is sent on accept, or
 * discarded with the tab on reject.
 *
 * Never throws. A missing measurement ID makes every function inert — unlike
 * the Convex client, where failing loudly is correct, analytics must never be
 * able to take the site down.
 */

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const ANALYTICS_ENABLED = import.meta.env.PROD && Boolean(MEASUREMENT_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Marks this browser as ours so the events can be filtered out in GA4.
 * Set once per device from the console on the live site:
 *   document.cookie = "ag_internal=1; max-age=31536000; path=/"
 */
const isInternal = (): boolean =>
  typeof document !== "undefined" && document.cookie.includes("ag_internal=1");

let shimInstalled = false;
let scriptInjected = false;

/** Installs the dataLayer queue. Safe to call before consent. */
export function initAnalyticsShim(): void {
  if (shimInstalled || !ANALYTICS_ENABLED) return;
  shimInstalled = true;

  window.dataLayer = window.dataLayer ?? [];

  // gtag.js validates every queued item with
  //   Object.prototype.toString.call(item) === "[object Arguments]"
  // so this must push a genuine `arguments` object. Spreading a rest parameter
  // into an array is silently ignored. The declared rest parameter exists only
  // to satisfy the type checker's arity check; it is intentionally unused.
  function gtag(..._args: unknown[]): void {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    // The router owns page_view. Note this only suppresses the pageview that
    // `config` would have sent — enhanced measurement's history-based pageviews
    // are switched off in the GA4 admin, not here.
    send_page_view: false,
    ...(isInternal() ? { traffic_type: "internal" } : {}),
  });
}

/** Loads gtag.js. Call only once consent is granted. Idempotent. */
export function loadAnalytics(): void {
  if (scriptInjected || !ANALYTICS_ENABLED) return;
  initAnalyticsShim();
  scriptInjected = true;

  const script = document.createElement("script");
  // async rather than defer: the dataLayer queue removes any ordering concern.
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  if (!ANALYTICS_ENABLED) {
    if (import.meta.env.DEV) console.debug("[ga4:inert]", name, params);
    return;
  }
  initAnalyticsShim();
  window.gtag?.("event", name, {
    ...params,
    ...(isInternal() ? { traffic_type: "internal" } : {}),
  });
}
