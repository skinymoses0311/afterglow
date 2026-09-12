/**
 * Turns the two Vite builds into the files nginx serves.
 *
 *   dist/          client build; its index.html is the template
 *   dist-server/   SSR build of src/entry-server.tsx
 *
 * Writes dist/index.html and dist/<path>/index.html for every page in
 * src/seo/pages.ts, dist/404.html for everything else, and dist/sitemap.xml.
 */

// Before React is loaded: the development build of react-dom/server is slower,
// and warns about things that are fine in the browser.
process.env.NODE_ENV = "production";

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const { render, headFor, sitemap, PAGE_PATHS, NOT_FOUND_PATH } = await import(
  pathToFileURL(path.join(root, "dist-server", "entry-server.js")).href
);

const template = await readFile(path.join(dist, "index.html"), "utf8");
for (const marker of ["<!--app-head-->", '<div id="root"></div>', "<title>"]) {
  if (!template.includes(marker)) throw new Error(`dist/index.html is missing ${marker}`);
}

// Preloaded, so text paints in its real face first time instead of in the
// fallback and then reflowing.
const fonts = (await readdir(path.join(dist, "assets"))).filter((file) =>
  /^(inter|montserrat)-latin-wght-normal-.+\.woff2$/.test(file),
);
if (fonts.length !== 2) {
  throw new Error(`Expected 2 latin font files to preload, found: ${fonts.join(", ") || "none"}`);
}
const preloads = fonts.map(
  (file) => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin>`,
);

async function writePage(urlPath, file) {
  const markup = await render(urlPath);
  const head = headFor(urlPath);
  // Function replacements throughout: a "$&" or "$1" in a replacement string
  // is expanded, and page text is arbitrary.
  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, () => `<title>${head.title}</title>`)
    .replace("<!--app-head-->", () => [...preloads, head.tags].join("\n    "))
    .replace('<div id="root"></div>', () => `<div id="root">${markup}</div>`);

  const out = path.join(dist, file);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, html);
  console.log(`  ${urlPath.padEnd(13)} -> dist/${file}  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
}

for (const urlPath of PAGE_PATHS) {
  await writePage(urlPath, urlPath === "/" ? "index.html" : `${urlPath.slice(1)}/index.html`);
}
await writePage(NOT_FOUND_PATH, "404.html");

await writeFile(path.join(dist, "sitemap.xml"), sitemap());
console.log("  sitemap      -> dist/sitemap.xml");
