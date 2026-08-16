/**
 * Cookie-consent state.
 *
 * Deliberately tiny and dependency-free: one first-party cookie holding one of
 * three states. Analytics never loads unless this says "granted".
 */

const COOKIE = "ag_consent";
const SIX_MONTHS_SECONDS = 60 * 60 * 24 * 182;

export type Consent = "granted" | "denied";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** null means the visitor has not chosen yet — show the banner. */
export function getConsent(): Consent | null {
  const value = readCookie(COOKIE);
  return value === "granted" || value === "denied" ? value : null;
}

export function setConsent(value: Consent): void {
  document.cookie = `${COOKIE}=${value}; max-age=${SIX_MONTHS_SECONDS}; path=/; SameSite=Lax`;
}

/**
 * Removes the cookies Google Analytics sets. Used when someone withdraws
 * consent — under UK guidance, withdrawal has to actually stop the processing,
 * not just stop future page loads.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;

  const names = document.cookie
    .split("; ")
    .map((row) => row.split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_") || name === "_gid");

  // The cookie was set on the registrable domain, so clear it on both the exact
  // host and the dot-prefixed parent, since we cannot tell which one took.
  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");

  for (const name of names) {
    for (const domain of [undefined, host, `.${parent}`]) {
      document.cookie = `${name}=; max-age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
