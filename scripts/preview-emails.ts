/**
 * Renders every confirmation email to .mail-preview/ so they can be eyeballed
 * without sending anything.
 *
 *   npm run mail:preview        # then open .mail-preview/index.html
 *
 * The cases below are the ones worth looking at rather than a happy path each:
 * a signup with nothing but an email address, a treatment list long enough to
 * be truncated, and a submission full of markup. That last one is a standing
 * check that the templates escape — both forms are public and unauthenticated,
 * and every field on them lands in an HTML email.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  contactConfirmation,
  merchantConfirmation,
  waitlistConfirmation,
  type Mail,
} from "../convex/mailTemplates";

const OUT = join(process.cwd(), ".mail-preview");
const UNSUB = "https://afterglowcredit.online/unsubscribe?token=preview-token";

const CASES: Array<[string, Mail]> = [
  [
    "waitlist-new",
    waitlistConfirmation({
      name: "Ava Rose",
      city: "London",
      treatments: ["Facials", "Lash extensions", "Massage"],
      returning: false,
      unsubscribeUrl: UNSUB,
    }),
  ],
  [
    "waitlist-returning",
    waitlistConfirmation({
      name: "Ava Rose",
      city: "Manchester",
      treatments: ["Skin peels", "IV drips", "Brow shaping", "Spray tan", "Injectables", "Massage"],
      returning: true,
      unsubscribeUrl: UNSUB,
    }),
  ],
  [
    // The homepage CTA captures an address and nothing else.
    "waitlist-email-only",
    waitlistConfirmation({ treatments: [], returning: false, unsubscribeUrl: UNSUB }),
  ],
  [
    "contact",
    contactConfirmation({
      name: "Priya Shah",
      enquiryType: "Becoming a merchant partner",
      message:
        "Hi — we run three clinics in Leeds and would love to hear more about how AfterGlow works for aesthetics providers. What are the fees?",
    }),
  ],
  [
    "merchant",
    merchantConfirmation({
      businessName: "Lumière Skin Studio",
      contactName: "Priya Shah",
      category: "Aesthetics clinic",
      locations: 3,
    }),
  ],
  [
    "escaping-probe",
    contactConfirmation({
      name: '<script>alert(1)</script> "Bobby"',
      enquiryType: "Press",
      message: "</td></tr></table><img src=x onerror=alert(2)> & <b>bold?</b> 'quoted'",
    }),
  ],
];

mkdirSync(OUT, { recursive: true });

for (const [name, mail] of CASES) {
  writeFileSync(join(OUT, `${name}.html`), mail.html);
  writeFileSync(join(OUT, `${name}.txt`), `Subject: ${mail.subject}\n\n${mail.text}\n`);
}

writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>AfterGlow email previews</title>
<style>body{font:15px/1.6 system-ui;margin:40px auto;max-width:680px;color:#4C242E}
a{color:#AE323F}li{margin:.4em 0}code{color:#84626A}</style>
<h1>AfterGlow email previews</h1>
<p>Regenerate with <code>npm run mail:preview</code>. Nothing here is sent.</p>
<ul>${CASES.map(
    ([name, mail]) =>
      `<li><a href="${name}.html">${name}</a> &middot; <a href="${name}.txt">text</a><br><code>${mail.subject.replace(/</g, "&lt;")}</code></li>`,
  ).join("")}</ul>`,
);

console.log(`${CASES.length} emails written to ${OUT}`);
for (const [name, mail] of CASES) console.log(`  ${name.padEnd(22)} ${mail.subject}`);
