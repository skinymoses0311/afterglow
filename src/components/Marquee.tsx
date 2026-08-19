import { useEffect, useRef } from "react";

const ITEMS = [
  "0% interest, always",
  "Nothing to pay upfront",
  "Soft credit check only",
  "Trusted UK partners",
  "Three easy payments",
];

/** Pixels per second at rest. Slow enough to read, quick enough to notice. */
const REST_SPEED = 34;
/** Ceiling on the scroll boost, as a multiple of the resting speed. */
const MAX_RATE = 4;
/** Scroll velocity (px/ms) that reaches the ceiling. */
const VELOCITY_AT_MAX = 3.5;
/** Per-frame decay of the boost once scrolling stops, and easing toward it. */
const DECAY = 0.055;
const EASE = 0.12;

/**
 * The trust strip. Drifts continuously, and accelerates while the visitor is
 * scrolling past it, easing back to its resting speed when they stop.
 *
 * Uses the Web Animations API rather than a CSS keyframe animation because the
 * speed changes constantly: setting `playbackRate` retimes the animation in
 * place, whereas rewriting an animation-duration restarts it and makes the
 * strip visibly jump.
 */
export const Marquee = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    // Translate by exactly one copy's width so the second copy lands where the
    // first began — an invisible seam. Measured from the element rather than
    // halving the track, because the track's own padding would skew that.
    const firstCopy = track.firstElementChild as HTMLElement | null;
    if (!firstCopy) return;
    const copyWidth = firstCopy.getBoundingClientRect().width;
    if (copyWidth < 1) return;

    const animation = track.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: `translate3d(${-copyWidth}px, 0, 0)` },
      ],
      { duration: (copyWidth / REST_SPEED) * 1000, iterations: Infinity, easing: "linear" },
    );

    let targetRate = 1;
    let currentRate = 1;
    let frame = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let running = false;

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const velocity = Math.abs(window.scrollY - lastY) / dt;
      lastY = window.scrollY;
      lastT = now;

      const boost = Math.min(velocity / VELOCITY_AT_MAX, 1) * (MAX_RATE - 1);
      targetRate = Math.max(targetRate, 1 + boost);
    };

    const tick = () => {
      targetRate += (1 - targetRate) * DECAY;
      currentRate += (targetRate - currentRate) * EASE;
      animation.playbackRate = currentRate;
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      lastY = window.scrollY;
      lastT = performance.now();
      animation.play();
      window.addEventListener("scroll", onScroll, { passive: true });
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      animation.pause();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };

    // Only animate while the strip is actually on screen — no point burning
    // frames for something nobody can see.
    const observer = new IntersectionObserver((entries) => {
      entries[0].isIntersecting ? start() : stop();
    });
    observer.observe(track);

    const onReducedChange = () => {
      if (reduced.matches) {
        stop();
        animation.cancel();
        observer.disconnect();
      }
    };
    reduced.addEventListener("change", onReducedChange);

    return () => {
      stop();
      animation.cancel();
      observer.disconnect();
      reduced.removeEventListener("change", onReducedChange);
    };
  }, []);

  // Two identical copies. Spacing lives entirely inside each item (gap plus a
  // trailing pad) rather than as a gap on the track, so the copies tile with no
  // seam and one copy's width is exactly the distance to translate.
  const copy = (key: string, hidden = false) => (
    <div key={key} className="flex items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-10 whitespace-nowrap pr-10">
          {item}
          <span aria-hidden="true" className="text-primary">
            ✳
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-foreground py-[18px] text-background">
      <div
        ref={trackRef}
        className="flex w-max items-center font-display text-[13px] font-bold uppercase tracking-[0.22em] will-change-transform"
      >
        {copy("a")}
        {/* Purely visual filler — assistive tech reads the strip once. */}
        {copy("b", true)}
      </div>
    </div>
  );
};
