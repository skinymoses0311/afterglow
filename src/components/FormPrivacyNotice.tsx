import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * The processing notice that sits beneath a form.
 *
 * Belongs below the whole two-column hero, not inside the form's column. Inside
 * the column it roughly doubled that column's height, which dragged the hero
 * far taller than it needs to be for a block of small print. Below the grid it
 * still reads as belonging to the form, and the hero stays one screen.
 *
 * Capped at a readable measure: 13px small print across a 1240px container is
 * far too long a line to scan.
 */
export const FormPrivacyNotice = ({ children }: { children: ReactNode }) => (
  <div className="mt-10 max-w-[72ch] rounded-3xl border border-border/60 bg-background/50 p-6 text-[13px] leading-relaxed text-muted-foreground md:p-7">
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
