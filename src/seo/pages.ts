/**
 * Every page the site serves, and what search engines and link previews are
 * told about it.
 *
 * The single source of truth for routes. App.tsx maps a component to each path
 * here (TypeScript refuses to build if one is missing either way), the build
 * pre-renders exactly these paths to static HTML, and the sitemap lists the
 * indexable ones. A path that isn't here doesn't exist in production — nginx
 * answers it with a real 404.
 */

export const SITE_NAME = "AfterGlow";

export const SITE_ORIGIN: string = import.meta.env.VITE_SITE_ORIGIN ?? "https://afterglowcredit.com";

/** Used by every page that doesn't set its own. */
export const DEFAULT_DESCRIPTION =
  "AfterGlow is buy now, pay later for beauty and wellness. Split treatments and products into easy, interest-free payments.";

/**
 * Root-relative path to a 1200×630 image for link previews, e.g.
 * "/share.jpg" in public/. None yet, so previews show no image.
 */
export const SHARE_IMAGE: string | null = null;

export interface PageMeta {
  title: string;
  /** Falls back to DEFAULT_DESCRIPTION. */
  description?: string;
  /** false keeps the page out of search results and out of the sitemap. */
  indexable: boolean;
}

const PAGE_LIST = {
  "/": { title: "AfterGlow — Glow Now, Pay Later", indexable: true },
  "/waitlist": { title: "AfterGlow — Join the waitlist", indexable: true },
  "/merchants": { title: "AfterGlow — For salons & clinics", indexable: true },
  "/book": { title: "AfterGlow — Book a treatment", indexable: true },
  "/about": { title: "AfterGlow — About us", indexable: true },
  "/contact": { title: "AfterGlow — Contact us", indexable: true },
  "/privacy": { title: "AfterGlow — Privacy and Cookie Policy", indexable: true },
  "/terms": { title: "AfterGlow — Website Terms and Conditions", indexable: true },
  // Only ever reached from an email, and useless without the token in it.
  "/unsubscribe": { title: "AfterGlow — Unsubscribe", indexable: false },
} satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof PAGE_LIST;

export const PAGES: Record<PagePath, PageMeta> = PAGE_LIST;

export const NOT_FOUND_TITLE = "AfterGlow — Page not found";

export const isPagePath = (path: string): path is PagePath =>
  Object.prototype.hasOwnProperty.call(PAGES, path);
