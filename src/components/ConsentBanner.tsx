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

export const ConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setVisible(true);

    const reopen = () => setVisible(true);
    window.addEventListener(REOPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(REOPEN_CONSENT_EVENT, reopen);
  }, []);

  const accept = useCallback(() => {
    setConsent("granted");
    loadAnalytics();
    setVisible(false);
  }, []);

  const reject = useCallback(() => {
    setConsent("denied");
    // If they had previously accepted, withdrawal has to remove what was set.
    clearAnalyticsCookies();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-heading"
      aria-describedby="consent-body"
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
