import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * The processing notice that sits beneath a form.
 *
 * Kept out of the form card itself: it is long, and burying it inside the fields
 * makes the form feel heavier without making the notice any easier to read.
 */
export const FormPrivacyNotice = ({ children }: { children: ReactNode }) => (
  <div className="mt-6 rounded-3xl border border-border/60 bg-background/50 p-6 text-[13px] leading-relaxed text-muted-foreground md:p-7">
    {children}
  </div>
);

export const PolicyLink = () => (
  <Link to="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
    Privacy and Cookie Policy
  </Link>
);

export const LouisaMail = () => (
  <a
    href="mailto:louisa@afterglowcredit.com"
    className="text-primary underline underline-offset-2 hover:no-underline"
  >
    louisa@afterglowcredit.com
  </a>
);
