import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Puts each navigation where the reader expects it: the top of a new page, the
 * element a #link asked for, or — going back — wherever they had got to.
 *
 * React Router swaps the route's markup without touching the scroll offset, so
 * without this a visitor 2000px down /privacy who clicks "About us" lands
 * 2000px down /about. It reads as intermittent because the browser clamps the
 * offset to the new document's height: on a short page you end up at the foot
 * of it instead, which looks like the navigation did something. It never
 * actually reached the top.
 *
 * Back and forward are ours too. The browser's own restoration is no use in a
 * single-page app — it applies the saved offset while the outgoing document is
 * still what's mounted, and measurably lands at the foot of the page — so we
 * turn it off and keep the offsets per history entry ourselves.
 */

/** Scroll offset per history entry key, so Back can return to it. */
const positions = new Map<string, number>();

/** How long to keep re-trying an offset that is past the end of the document. */
const RETRY_FRAMES = 20;

/**
 * Scrolls to `y`, retrying for a few frames.
 *
 * A lazily loaded route (/privacy, /terms) paints a short placeholder before
 * its real content arrives, so the offset we want can be beyond the bottom of
 * the document — and therefore unreachable — for a frame or two.
 */
function settle(y: number): void {
  let frames = 0;
  const go = () => {
    // Explicit "instant": a later `scroll-behavior: smooth` would otherwise
    // turn every navigation into a long scroll through the outgoing page.
    window.scrollTo({ top: y, left: 0, behavior: "instant" });
    if (y > 0 && Math.round(window.scrollY) < y && frames++ < RETRY_FRAMES) {
      requestAnimationFrame(go);
    }
  };
  go();
}

/** Same retry, for an element that may not be mounted yet. */
function settleOnHash(hash: string): void {
  const id = decodeURIComponent(hash.slice(1));
  let frames = 0;
  const go = () => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView(); // honours the target's scroll-margin-top
    } else if (frames++ < RETRY_FRAMES) {
      requestAnimationFrame(go);
    }
  };
  go();
}

export const RouteScroll = () => {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();

  /**
   * Where the reader actually is.
   *
   * Not `window.scrollY` read at cleanup time: by then the incoming page's DOM
   * is already mounted, and if it is shorter the browser has clamped the
   * offset — so we would file that clamped number against the page we are
   * leaving, and Back would return to the wrong place.
   */
  const readerY = useRef(0);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const track = () => {
      readerY.current = window.scrollY;
    };
    window.addEventListener("scroll", track, { passive: true });
    return () => window.removeEventListener("scroll", track);
  }, []);

  useLayoutEffect(() => {
    let target = 0;
    if (hash) {
      settleOnHash(hash);
      target = window.scrollY;
    } else if (navigationType === "POP") {
      target = positions.get(key) ?? 0;
      settle(target);
    } else {
      settle(0);
    }
    readerY.current = target;

    // Cleanup runs before the next entry's effect, so this records where the
    // reader had got to on the entry we are leaving.
    return () => {
      positions.set(key, readerY.current);
    };
  }, [key, pathname, hash, navigationType]);

  return null;
};
