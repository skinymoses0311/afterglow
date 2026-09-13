import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { loadAnalytics } from "@/lib/analytics";
import { clearAnalyticsCookies, getConsent, setConsent } from "@/lib/consent";

/**
 * Cookie consent.
 *
 * Requirements this is built to meet, per ICO guidance:
 *  - reject is exactly as prominent as accept, on the first layer
 *  - nothing loads until a positive action; no pre-ticked anything
 *  - the choice is real — analytics genuinely does not load on reject
 *  - Google is named, and the privacy policy is linked
 *  - withdrawal is as easy as consent, and actually deletes the cookies
 *
 * Deliberately not a dependency. A CMP library is a lot of machinery, and its
 * default UI would not match the site; this is the whole requirement in a
 * hundred lines.
 */

/** Lets the footer link reopen the banner after a choice has been made. */
export const REOPEN_CONSENT_EVENT = "afterglow:reopen-consent";

/**
 * "prerendered" is the state every page is built in, with the banner already
 * in the HTML. That matters on a phone: the banner is the largest thing on a
 * first visitor's screen, so if it waited for JavaScript it set the page's
 * Largest Contentful Paint — about a second after everything else had painted.
 *
 * A visitor who has already chosen must never see it flash, so the inline
 * script in index.html marks <html> before first paint and index.css hides the
 * banner while it is still in this state. Once mounted, the component reads the
 * cookie itself and moves to "open" or "closed".
 */
type Phase = "prerendered" | "open" | "closed";

export const ConsentBanner = () => {
  const [phase, setPhase] = useState<Phase>("prerendered");

  useEffect(() => {
    setPhase(getConsent() === null ? "open" : "closed");

    const reopen = () => setPhase("open");
    window.addEventListener(REOPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, reopen);
  }, []);

  const accept = useCallback(() => {
    setConsent("granted");
    loadAnalytics();
    setPhase("closed");
  }, []);

  const reject = useCallback(() => {
    setConsent("denied");
    // If they had previously accepted, withdrawal has to remove what was set.
    clearAnalyticsCookies();
    setPhase("closed");
  }, []);

  if (phase === "closed") return null;

  // data-nosnippet: now that the banner is in every page's HTML, keep its text
  // out of the snippets search engines show for the page.
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      aria-describedby="consent-body"
      data-consent-phase={phase}
      data-nosnippet=""
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-bottom safe-x"
    >
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-6 py-6 md:flex-row md:items-center md:gap-8 md:px-12">
        <div className="flex-1">
          <h2 id="consent-heading" className="font-display text-lg">
            Cookies on AfterGlow
          </h2>
          <p id="consent-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            We would like to use Google Analytics to understand how people use the site, so we can improve it.
            It sets cookies and shares data with Google. We will not use analytics unless you say yes, and you
            can change your mind at any time.{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
              Read our privacy notice
            </Link>
            .
          </p>
        </div>

        {/* Equal weight, equal size, side by side — reject is never the quieter option. */}
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button onClick={reject} variant="outline" size="lg" className="rounded-full sm:min-w-[140px]">
            Reject
          </Button>
          <Button onClick={accept} size="lg" className="rounded-full sm:min-w-[140px]">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};

/** Fired by the footer's "Cookie settings" link. */
export const reopenConsent = () => window.dispatchEvent(new Event(REOPEN_CONSENT_EVENT));
