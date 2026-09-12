/**
 * Build-time rendering, run by scripts/prerender.mjs. Never shipped to the
 * browser.
 *
 * On its own, the browser bundle gave every URL the same empty HTML shell with
 * the homepage's title and description. Google renders JavaScript eventually,
 * but link-preview scrapers and most AI crawlers don't, so to them every page
 * was one blank page. Rendering each route to HTML at build time fixes that
 * without running a server: nginx still serves plain files.
 */
import { Writable } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import App from "./App";
import {
  DEFAULT_DESCRIPTION,
  NOT_FOUND_TITLE,
  PAGES,
  SHARE_IMAGE,
  SITE_NAME,
  SITE_ORIGIN,
  isPagePath,
  type PagePath,
} from "./seo/pages";

export const PAGE_PATHS = Object.keys(PAGES) as PagePath[];

/** Not a page, so it renders NotFound — the markup for dist/404.html. */
export const NOT_FOUND_PATH = "/404";

/**
 * Renders one path to markup. Waits for lazily loaded routes (/privacy, /terms)
 * to resolve, rather than writing out their loading placeholder.
 */
export function render(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new Writable({
      write(chunk, _encoding, done) {
        html += chunk.toString();
        done();
      },
    });
    sink.on("finish", () => resolve(html));

    const { pipe } = renderToPipeableStream(
      <StaticRouter location={path}>
        <App />
      </StaticRouter>,
      {
        onAllReady: () => pipe(sink),
        onShellError: reject,
        // Fail the build, rather than ship a page that quietly falls back to
        // rendering in the browser.
        onError: reject,
      },
    );
  });
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const named = (name: string, content: string) => `<meta name="${name}" content="${escapeHtml(content)}">`;
const property = (name: string, content: string) => `<meta property="${name}" content="${escapeHtml(content)}">`;

/**
 * Organization and WebSite data for the homepage. WebSite is what Google reads
 * for the site name it shows above a result.
 *
 * Deliberately no FAQPage: Google stopped showing FAQ rich results for anything
 * but government and health sites in 2023.
 */
function structuredData(): string {
  const organization = `${SITE_ORIGIN}/#organization`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organization,
        name: SITE_NAME,
        legalName: "AfterGlow Credit Limited",
        url: `${SITE_ORIGIN}/`,
        logo: `${SITE_ORIGIN}/apple-touch-icon.png`,
        email: "hello@afterglowcredit.com",
        sameAs: ["https://www.instagram.com/afterglowcredit/"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_ORIGIN}/#website`,
        name: SITE_NAME,
        url: `${SITE_ORIGIN}/`,
        inLanguage: "en-GB",
        publisher: { "@id": organization },
      },
    ],
  };
  // Escaped so that nothing inside the data can close the script element.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
}

/** The title and the head tags for one path, ready to write into the template. */
export function headFor(path: string): { title: string; tags: string } {
  const page = isPagePath(path) ? PAGES[path] : null;
  const title = page?.title ?? NOT_FOUND_TITLE;
  const description = page?.description ?? DEFAULT_DESCRIPTION;
  const url = SITE_ORIGIN + path;
  const indexable = page?.indexable ?? false;
  const image = SHARE_IMAGE ? SITE_ORIGIN + SHARE_IMAGE : null;

  const tags = [
    named("description", description),
    // A canonical on a noindex page sends mixed signals, so it's one or the other.
    indexable ? `<link rel="canonical" href="${escapeHtml(url)}">` : named("robots", "noindex"),
    property("og:type", "website"),
    property("og:site_name", SITE_NAME),
    property("og:locale", "en_GB"),
    property("og:title", title),
    property("og:description", description),
    indexable && property("og:url", url),
    image && property("og:image", image),
    named("twitter:card", image ? "summary_large_image" : "summary"),
    named("twitter:title", title),
    named("twitter:description", description),
    image && named("twitter:image", image),
    path === "/" && structuredData(),
  ].filter(Boolean);

  return { title: escapeHtml(title), tags: tags.join("\n    ") };
}

/**
 * No lastmod: Google only uses it when it is consistently accurate, and a
 * build-time date would change on every deploy whether the page did or not.
 */
export function sitemap(): string {
  const urls = PAGE_PATHS.filter((path) => PAGES[path].indexable)
    .map((path) => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
