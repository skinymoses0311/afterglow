/**
 * Captures the unsubscribe token at app entry and strips it from the URL.
 *
 * Unsubscribe links arrive as `/unsubscribe?token=<opaque token>`. That token
 * identifies one waitlist signup, so it is personal data. Anything that reads
 * `location.href` — our own analytics, and more importantly GA4's automatic
 * scroll and outbound-click events, which we do not control — would transmit
 * it to a third party.
 *
 * Sanitising our own events is not enough, because the automatic ones read the
 * live URL independently. So the token is removed from the address bar before
 * React renders anything, and held in memory instead.
 *
 * This module must be imported first in main.tsx, before any other import that
 * could read the URL.
 */

let captured: string | null = null;

if (typeof window !== "undefined" && window.location.pathname === "/unsubscribe") {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    captured = token;
    params.delete("token");
    const query = params.toString();
    window.history.replaceState({}, "", `/unsubscribe${query ? `?${query}` : ""}`);
  }
}

/** The token this page was opened with, or "" if there wasn't one. */
export const getUnsubscribeToken = (): string => captured ?? "";
