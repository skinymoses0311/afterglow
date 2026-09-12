import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Anchor for the form's own aria-describedby — see the note below. */
export const formPrivacyNoticeId = "form-privacy-notice";

/**
 * The UK GDPR processing notice belonging to a form.
 *
 * It is its own child of the hero grid rather than living inside either
 * column. At md it is assigned column 1 / row 2, so on desktop it occupies the
 * space beneath the copy that the much taller form card would otherwise leave
 * empty — no trailing band under the hero, and no dead half-page beside it.
 * Because it still comes after the card in the DOM, the single-column mobile
 * stack reads copy → form → notice, so a screen of legal small print never
 * lands between the pitch and the first field.
 *
 * The visual pairing is only visual: "beside the form" does not exist for a
 * screen reader. Give the <form> aria-describedby={formPrivacyNoticeId} so the
 * association is programmatic too.
 *
 * The ground is bg-card/60, not bg-background/50 — the latter is 50% pink over
 * the identical pink, so the panel had no tonal separation at all and the
 * 13px muted text measured 4.26:1, under the 4.5:1 AA floor.
 */
export const FormPrivacyNotice = ({ children }: { children: ReactNode }) => (
  <section
    id={formPrivacyNoticeId}
    aria-labelledby={`${formPrivacyNoticeId}-heading`}
    className="scroll-mt-24 rounded-3xl border border-border/60 bg-card/60 p-6 text-[13px] leading-relaxed text-muted-foreground md:col-start-1 md:row-start-2 md:p-7"
  >
    <h2 id={`${formPrivacyNoticeId}-heading`} className="mb-3 text-sm font-medium text-foreground">
      How we use your information
    </h2>
    {children}
  </section>
);

export const PolicyLink = () => (
  <Link to="/privacy" className="text-link underline underline-offset-2 hover:no-underline">
    Privacy and Cookie Policy
  </Link>
);

export const LouisaMail = () => (
  <a
    href="mailto:louisa@afterglowcredit.com"
    className="text-link underline underline-offset-2 hover:no-underline"
  >
    louisa@afterglowcredit.com
  </a>
);
