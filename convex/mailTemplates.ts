/**
 * Confirmation emails sent back to whoever submitted a form.
 *
 * Distinct from the notifications in notify.ts, which go to the team: these go
 * to the customer, so they carry the brand rather than a field dump.
 *
 * Rules this file is written to, all of them email-specific rather than web:
 *
 *  - Tables and inline styles only. Gmail strips <style> blocks and most
 *    clients ignore flexbox and grid entirely. There is no cascade to rely on.
 *  - No images. The AfterGlow mark is a solid square of type, so it rebuilds
 *    exactly as a coloured table cell — which means it survives the
 *    images-off default that Outlook and Gmail still apply to unknown senders.
 *  - Webfonts are declared but never depended on. Only Apple Mail and iOS load
 *    them; everywhere else falls through the stack to a system face.
 *  - Every colour is stated explicitly on the element, including on <body>,
 *    because a client that force-inverts for dark mode inverts the gaps we
 *    leave rather than the palette we chose.
 *  - Nothing here is a financial promotion. These confirm an action the person
 *    just took; they do not offer, price, or induce a credit agreement. The
 *    £10 welcome credit the waitlist page mentions is deliberately absent.
 */

const BRAND = {
  ground: "#FBDFE2", // --background, the pink page ground
  card: "#FFFFFF", // --card
  ink: "#4C242E", // --foreground
  muted: "#84626A", // --muted-foreground, 5.1:1 on white
  link: "#AE323F", // --link, the AA-passing link colour
  logo: "#F49FA3", // --primary
  logoInk: "#FBF7EF", // --primary-foreground
  soft: "#FADBDE", // --secondary
} as const;

const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const DISPLAY = "Montserrat, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export interface Mail {
  subject: string;
  html: string;
  text: string;
}

/** Escapes anything that reached us from a public, unauthenticated form. */
const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** "Ava" from "Ava Rose" — a first name reads warmer than the full one. */
const firstName = (full?: string) => {
  const first = (full ?? "").trim().split(/\s+/)[0] ?? "";
  return first.length > 0 && first.length <= 40 ? first : "";
};

const greeting = (name?: string) => {
  const first = firstName(name);
  return first ? `Hi ${esc(first)},` : "Hi there,";
};

const p = (content: string, top = 16) =>
  `<p style="margin:${top}px 0 0;font-family:${SANS};font-size:16px;line-height:1.6;color:${BRAND.ink};">${content}</p>`;

const a = (href: string, label: string) =>
  `<a href="${esc(href)}" style="color:${BRAND.link};text-decoration:underline;">${esc(label)}</a>`;

/**
 * A quiet key/value panel for echoing back what someone submitted. People do
 * use these to check they typed their address correctly, which is the one job
 * a confirmation email has beyond saying "received".
 */
const panel = (rows: Array<[string, string]>) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="margin:28px 0 0;background-color:${BRAND.soft};border-radius:16px;">
    <tr><td style="padding:20px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        ${rows
          .map(
            ([label, value], i) => `
        <tr>
          <td style="padding:${i === 0 ? "0" : "10px"} 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${BRAND.muted};width:104px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:${i === 0 ? "0" : "10px"} 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:${BRAND.ink};vertical-align:top;">${esc(value)}</td>
        </tr>`,
          )
          .join("")}
      </table>
    </td></tr>
  </table>`;

/**
 * The shared shell. `preheader` is the grey line clients show beside the
 * subject in the inbox list — left unset it fills itself with whatever markup
 * comes first, which is invariably the logo alt text or a run of whitespace.
 */
function shell(args: { preheader: string; heading: string; body: string; footerExtra?: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(args.heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.ground};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BRAND.ground};">${esc(args.preheader)}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${BRAND.ground}" style="background-color:${BRAND.ground};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">

          <tr>
            <td align="center" style="padding:0 0 28px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="52" height="52" align="center" valign="middle" bgcolor="${BRAND.logo}"
                      style="width:52px;height:52px;background-color:${BRAND.logo};border-radius:6px;
                             font-family:${DISPLAY};font-size:11px;font-weight:800;letter-spacing:-0.3px;
                             line-height:1.05;text-transform:uppercase;color:${BRAND.logoInk};text-align:center;">
                    After<br>Glow
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td bgcolor="${BRAND.card}" style="background-color:${BRAND.card};border-radius:24px;padding:40px 32px;">
              <h1 style="margin:0;font-family:${DISPLAY};font-size:28px;line-height:1.15;font-weight:600;color:${BRAND.ink};">${esc(args.heading)}</h1>
              ${args.body}
            </td>
          </tr>

          <tr>
            <td style="padding:28px 8px 0;">
              <p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.6;color:${BRAND.muted};">
                AfterGlow Credit Limited &middot; ${a("https://afterglowcredit.com", "afterglowcredit.com")}<br>
                AfterGlow is not a lender; credit is subject to status.
              </p>
              ${args.footerExtra ?? ""}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Wraps plain-text bodies with the same sign-off the HTML carries. */
const textShell = (body: string, extra?: string) =>
  [
    body.trim(),
    "",
    "--",
    "AfterGlow Credit Limited",
    "afterglowcredit.com",
    "AfterGlow is not a lender; credit is subject to status.",
    ...(extra ? ["", extra.trim()] : []),
  ].join("\n");

/* ---------------------------------------------------------------- waitlist */

export interface WaitlistMailArgs {
  name?: string;
  city?: string;
  treatments: string[];
  /** True when this address was already on the list and re-submitted. */
  returning: boolean;
  unsubscribeUrl: string;
}

export function waitlistConfirmation(args: WaitlistMailArgs): Mail {
  const { returning, unsubscribeUrl } = args;
  const list = args.treatments.slice(0, 4).join(", ");

  const rows: Array<[string, string]> = [];
  if (args.city) rows.push(["City", args.city]);
  if (args.treatments.length > 0) {
    rows.push([
      args.treatments.length === 1 ? "Treatment" : "Treatments",
      args.treatments.length > 4 ? `${list} and ${args.treatments.length - 4} more` : list,
    ]);
  }

  const heading = returning ? "You are already on the list" : "You are on the waitlist";

  const body = [
    p(greeting(args.name), 20),
    p(
      returning
        ? "Thanks for coming back — you were already on the AfterGlow waitlist, so there is nothing more to do. If you changed anything just now, we have saved it."
        : "Thanks for joining the AfterGlow waitlist. We have got your details and you are on the list.",
    ),
    rows.length > 0 ? panel(rows) : "",
    p(
      args.city
        ? `We will email you when AfterGlow opens in ${esc(args.city)}. Until then you will not hear from us unless there is something worth telling you.`
        : "We will email you when AfterGlow opens near you. Until then you will not hear from us unless there is something worth telling you.",
      28,
    ),
    p("Need to change something? Just reply to this email — a real person reads it."),
  ].join("");

  const text = textShell(
    [
      greeting(args.name).replace(/&#39;/g, "'"),
      "",
      returning
        ? "Thanks for coming back - you were already on the AfterGlow waitlist, so there is nothing more to do. If you changed anything just now, we have saved it."
        : "Thanks for joining the AfterGlow waitlist. We have got your details and you are on the list.",
      ...(rows.length > 0 ? ["", ...rows.map(([k, val]) => `${k}: ${val}`)] : []),
      "",
      args.city
        ? `We will email you when AfterGlow opens in ${args.city}. Until then you will not hear from us unless there is something worth telling you.`
        : "We will email you when AfterGlow opens near you. Until then you will not hear from us unless there is something worth telling you.",
      "",
      "Need to change something? Just reply to this email - a real person reads it.",
    ].join("\n"),
    `Unsubscribe: ${unsubscribeUrl}`,
  );

  return {
    subject: returning ? "You are already on the AfterGlow waitlist" : "You are on the AfterGlow waitlist",
    html: shell({
      preheader: returning
        ? "No action needed — you were already on the list."
        : "We have got your details. We will be in touch at launch.",
      heading,
      body,
      footerExtra: `<p style="margin:10px 0 0;font-family:${SANS};font-size:12px;line-height:1.6;color:${BRAND.muted};">
        You are receiving this because you joined the waitlist at afterglowcredit.com.
        ${a(unsubscribeUrl, "Unsubscribe")}.
      </p>`,
    }),
    text,
  };
}

/* ----------------------------------------------------------------- contact */

export interface ContactMailArgs {
  name: string;
  enquiryType: string;
  message: string;
}

export function contactConfirmation(args: ContactMailArgs): Mail {
  const trimmed = args.message.length > 600 ? `${args.message.slice(0, 600)}…` : args.message;

  const body = [
    p(greeting(args.name), 20),
    p("Thanks for getting in touch. Your message has reached the AfterGlow team and we will come back to you as soon as we can."),
    panel([
      ["Subject", args.enquiryType],
      ["Your message", trimmed],
    ]),
    p("No need to do anything else — replying to this email adds to the same conversation.", 28),
  ].join("");

  return {
    subject: "We have got your message",
    html: shell({
      preheader: "Your message has reached the AfterGlow team.",
      heading: "We have got your message",
      body,
    }),
    text: textShell(
      [
        greeting(args.name).replace(/&#39;/g, "'"),
        "",
        "Thanks for getting in touch. Your message has reached the AfterGlow team and we will come back to you as soon as we can.",
        "",
        `Subject: ${args.enquiryType}`,
        "",
        "Your message:",
        trimmed,
        "",
        "No need to do anything else - replying to this email adds to the same conversation.",
      ].join("\n"),
    ),
  };
}

/* ---------------------------------------------------------------- merchant */

export interface MerchantMailArgs {
  businessName: string;
  contactName: string;
  category?: string;
  locations: number;
}

export function merchantConfirmation(args: MerchantMailArgs): Mail {
  const rows: Array<[string, string]> = [["Business", args.businessName]];
  if (args.category) rows.push(["Category", args.category]);
  rows.push(["Locations", String(args.locations)]);

  const body = [
    p(greeting(args.contactName), 20),
    p(
      `Thanks for applying to partner with AfterGlow. We have received your application for ${esc(args.businessName)}, and our partnerships team will be in touch within 48 hours.`,
    ),
    panel(rows),
    p("If anything above is wrong, or you have something to add, just reply to this email.", 28),
  ].join("");

  return {
    subject: `We have got your application — ${args.businessName}`,
    html: shell({
      preheader: "Our partnerships team will be in touch within 48 hours.",
      heading: "Application received",
      body,
    }),
    text: textShell(
      [
        greeting(args.contactName).replace(/&#39;/g, "'"),
        "",
        `Thanks for applying to partner with AfterGlow. We have received your application for ${args.businessName}, and our partnerships team will be in touch within 48 hours.`,
        "",
        ...rows.map(([k, val]) => `${k}: ${val}`),
        "",
        "If anything above is wrong, or you have something to add, just reply to this email.",
      ].join("\n"),
    ),
  };
}
