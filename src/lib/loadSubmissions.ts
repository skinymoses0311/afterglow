import type { UnsubscribeLookup } from "./submissions";

type Submissions = typeof import("./submissions");

/**
 * The form backend, fetched on demand.
 *
 * lib/submissions brings in the Convex client — about a sixth of the site's
 * JavaScript — and it only matters once someone sends a form or opens an
 * unsubscribe link, so it's kept out of every page load.
 */
export const loadSubmissions = () => import("./submissions");

/** Starts the fetch early. Forms call this on first focus, so it's usually ready before they submit. */
export const warmSubmissions = () => {
  loadSubmissions().catch(() => {
    // Nothing to do yet; getSubmissions() tries again, and handles failure, at submit.
  });
};

const unavailable: Submissions = {
  submitWaitlistSignup: async () => ({ ok: false }),
  submitMerchantApplication: async () => ({ ok: false }),
  submitContactEnquiry: async () => ({ ok: false }),
  lookupUnsubscribeToken: async (): Promise<UnsubscribeLookup> => ({
    status: "invalid",
    message: "Could not validate this link. Please try again.",
  }),
  confirmUnsubscribe: async () => ({ ok: false }),
};

/**
 * The backend, or — if it can't be fetched, say offline — stand-ins that fail
 * the way a failed submission does, so the form shows its usual error instead
 * of spinning forever.
 */
export async function getSubmissions(): Promise<Submissions> {
  try {
    return await loadSubmissions();
  } catch {
    return unavailable;
  }
}
