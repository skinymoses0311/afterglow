/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Convex deployment the browser talks to. Set in .env.production / .env.local. */
  readonly VITE_CONVEX_URL: string;
  /** GA4 measurement ID, e.g. G-XXXXXXXXXX. Optional — when absent, analytics is inert. */
  readonly VITE_GA_MEASUREMENT_ID?: string;
  /**
   * The canonical public origin, no trailing slash. Drives rel=canonical, so it
   * must name the host search engines should index — not whichever host the
   * page happens to be served from.
   */
  readonly VITE_SITE_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
