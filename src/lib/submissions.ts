/**
 * Form submission layer.
 *
 * The original site wrote directly to Supabase from the browser. That is being
 * replaced with Convex, so every write goes through this module and nothing else
 * in the app knows where data lands. When Convex is wired up, the three
 * functions below are the only things that need to change.
 *
 * ⚠️  Until then `BACKEND` is "none": submissions are validated and echoed to the
 * console but NOT persisted anywhere. `persisted: false` is returned so callers
 * can tell the difference. Do not drive real traffic at the waitlist until this
 * is pointed at Convex, or signups will be lost.
 */

const BACKEND: "none" | "convex" = "none";

export interface SubmitResult {
  ok: boolean;
  /** False when the payload was accepted by the UI but never stored. */
  persisted: boolean;
  /** True when the email is already on the waitlist. */
  duplicate?: boolean;
  error?: string;
}

export interface WaitlistSignup {
  name?: string;
  email: string;
  city?: string;
  treatments: string[];
}

export interface MerchantApplication {
  business_name: string;
  category?: string;
  contact_name: string;
  role?: string;
  email: string;
  locations: number;
  message?: string;
}

function unconfigured(kind: string, payload: unknown): SubmitResult {
  console.warn(
    `[afterglow] ${kind} submitted but no backend is configured — this payload was discarded.`,
    payload,
  );
  return { ok: true, persisted: false };
}

export async function submitWaitlistSignup(signup: WaitlistSignup): Promise<SubmitResult> {
  if (BACKEND === "none") return unconfigured("waitlist signup", signup);

  // TODO(convex): replace with
  //   await convex.mutation(api.waitlist.signUp, signup)
  // and map a unique-constraint failure to { ok: true, persisted: true, duplicate: true }.
  throw new Error("Convex backend selected but not implemented");
}

export async function submitMerchantApplication(application: MerchantApplication): Promise<SubmitResult> {
  if (BACKEND === "none") return unconfigured("merchant application", application);

  // TODO(convex): replace with
  //   await convex.mutation(api.merchants.apply, application)
  throw new Error("Convex backend selected but not implemented");
}

export type UnsubscribeLookup =
  | { status: "valid"; email: string }
  | { status: "already" }
  | { status: "invalid"; message: string };

export async function lookupUnsubscribeToken(token: string): Promise<UnsubscribeLookup> {
  if (!token) return { status: "invalid", message: "Missing unsubscribe token." };

  if (BACKEND === "none") {
    return {
      status: "invalid",
      message: "Unsubscribe links are not active yet. Please contact us and we will remove you manually.",
    };
  }

  // TODO(convex): replace with
  //   await convex.query(api.email.lookupUnsubscribeToken, { token })
  throw new Error("Convex backend selected but not implemented");
}

export async function confirmUnsubscribe(token: string): Promise<SubmitResult> {
  if (BACKEND === "none") return unconfigured("unsubscribe", { token });

  // TODO(convex): replace with
  //   await convex.mutation(api.email.unsubscribe, { token })
  throw new Error("Convex backend selected but not implemented");
}
