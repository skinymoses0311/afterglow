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

/** Used by any page that doesn't set its own: /unsubscribe and the 404 page. */
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

/*
 * Titles say what the page is, with the brand last, and stay under about 60
 * characters; descriptions stay under about 155. Google cuts both by pixel
 * width, so those are guides. The descriptions reuse wording already on each
 * page — as copy for a credit product, new claims may need sign-off.
 */
const PAGE_LIST = {
  "/": {
    title: "Buy Now, Pay Later for Beauty & Wellness | AfterGlow",
    description:
      "Split beauty treatments, wellness sessions and luxury products into three interest-free payments, with nothing to pay upfront.",
    indexable: true,
  },
  "/waitlist": {
    title: "Join the AfterGlow Waitlist | Early Access",
    description:
      "Skip the line when AfterGlow launches, with £10 welcome credit and first dibs on exclusive launches near you.",
    indexable: true,
  },
  "/merchants": {
    title: "Buy Now, Pay Later for Salons, Spas & Clinics | AfterGlow",
    description:
      "Your clients book with a simple voucher code. We pay you upfront and your clients pay us in three. Built for spas, salons, clinics and wellness studios.",
    indexable: true,
  },
  "/book": {
    title: "Book Beauty & Wellness Treatments | AfterGlow",
    description:
      "Book a treatment with an AfterGlow partner and split the cost into three interest-free payments, with nothing to pay upfront. UK only at launch.",
    indexable: true,
  },
  "/about": {
    title: "About AfterGlow | Feel Good Now, Pay Your Way",
    description:
      "AfterGlow was created from a simple belief: everyone deserves to feel their best, without having to put life on hold.",
    indexable: true,
  },
  "/contact": {
    title: "Contact AfterGlow",
    description:
      "Questions about AfterGlow, joining the waitlist or becoming a merchant partner? Get in touch and our team will get back to you.",
    indexable: true,
  },
  "/privacy": {
    title: "Privacy and Cookie Policy | AfterGlow",
    description:
      "How AfterGlow collects and uses personal data, your rights over it, and the cookies this website uses.",
    indexable: true,
  },
  "/terms": {
    title: "Website Terms and Conditions | AfterGlow",
    description: "The terms that apply when you use the AfterGlow website.",
    indexable: true,
  },
  // Only ever reached from an email, and useless without the token in it.
  "/unsubscribe": { title: "Unsubscribe | AfterGlow", indexable: false },
} satisfies Record<string, PageMeta>;

export type PagePath = keyof typeof PAGE_LIST;

export const PAGES: Record<PagePath, PageMeta> = PAGE_LIST;

export const NOT_FOUND_TITLE = "Page not found | AfterGlow";

export const isPagePath = (path: string): path is PagePath =>
  Object.prototype.hasOwnProperty.call(PAGES, path);
