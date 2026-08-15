/**
 * Form submission layer.
 *
 * Every write the site makes goes through here, so no page needs to know which
 * backend is behind it. Currently Convex; previously Supabase.
 */

import { api } from "../../convex/_generated/api";
import { convex } from "./convex";

export interface SubmitResult {
  ok: boolean;
  /** True when the email was already on the waitlist. */
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
  businessName: string;
  category?: string;
  contactName: string;
  role?: string;
  email: string;
  locations: number;
  message?: string;
}

export async function submitWaitlistSignup(signup: WaitlistSignup): Promise<SubmitResult> {
  try {
    const { duplicate } = await convex.mutation(api.waitlist.signUp, signup);
    return { ok: true, duplicate };
  } catch (error) {
    console.error("Waitlist signup failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export async function submitMerchantApplication(application: MerchantApplication): Promise<SubmitResult> {
  try {
    await convex.mutation(api.merchants.apply, application);
    return { ok: true };
  } catch (error) {
    console.error("Merchant application failed", error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

export type UnsubscribeLookup =
  | { status: "valid"; email: string }
  | { status: "already" }
  | { status: "invalid"; message: string };

export async function lookupUnsubscribeToken(token: string): Promise<UnsubscribeLookup> {
  if (!token) return { status: "invalid", message: "Missing unsubscribe token." };

  try {
    return await convex.query(api.email.lookupUnsubscribeToken, { token });
  } catch (error) {
    console.error("Unsubscribe lookup failed", error);
    return { status: "invalid", message: "Could not validate this link. Please try again." };
  }
}

export async function confirmUnsubscribe(token: string): Promise<SubmitResult> {
  try {
    const { ok } = await convex.mutation(api.email.unsubscribe, { token });
    return ok ? { ok: true } : { ok: false, error: "This unsubscribe link is invalid or expired." };
  } catch (error) {
    console.error("Unsubscribe failed", error);
    return { ok: false, error: "Network error. Please try again." };
  }
}
