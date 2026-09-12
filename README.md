# AfterGlow

Marketing site for AfterGlow — buy now, pay later for beauty and wellness.

Rebuilt as a clean Vite + React + TypeScript + Tailwind codebase from the design
at `afterglowcredit.com`, and deployed to `afterglowcredit.online`.

## Stack

| Concern    | Choice                                    |
| ---------- | ----------------------------------------- |
| Build      | Vite 6                                    |
| UI         | React 18 + TypeScript                     |
| Styling    | Tailwind CSS 3, shadcn/ui-style primitives |
| Routing    | React Router 6                            |
| Validation | Zod                                       |
| Backend    | Convex                                    |
| Toasts     | Sonner                                    |
| Icons      | lucide-react                               |

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # typecheck + production build into dist/
npm run preview  # serve the built output locally
npm run lint     # typecheck only
```

## Routes

| Path           | Page          | Notes                                                     |
| -------------- | ------------- | --------------------------------------------------------- |
| `/`            | Index         | "Editorial Bloom" — 8 sections, incl. waitlist capture     |
| `/waitlist`    | Waitlist      | Signup form with treatment multi-select                   |
| `/merchants`   | Merchants     | Partner application form + benefits grid                  |
| `/book`        | Book          | Category tabs; shows "COMING SOON" until partners are live |
| `/unsubscribe` | Unsubscribe   | Token is stripped from the URL at entry — see below       |
| `/about`       | About         | Brand story and founder note                              |
| `/contact`     | Contact       | Enquiry form, writes to `contactEnquiries`                |
| `/privacy`     | Privacy       | Privacy and Cookie Policy (lazy-loaded)                   |
| `/terms`       | Terms         | Website Terms and Conditions (lazy-loaded)                |
| `*`            | NotFound      | 404                                                        |

## Backend

Convex, replacing the Supabase setup the original site used. Everything the
site writes goes through `src/lib/submissions.ts`, so no page talks to the
backend directly.

```
convex/
  schema.ts     waitlistSignups + merchantApplications, with their indexes
  waitlist.ts   signUp      — upserts by email, reports duplicates
  merchants.ts  apply       — inserts an application
  email.ts      lookupUnsubscribeToken / unsubscribe
  contact.ts    submit      — contact form enquiries
```

Waitlist rows carry `marketingConsent` and `marketingConsentAt`. Marketing
consent is deliberately separate from joining the waitlist: joining runs on
legitimate interests, marketing needs an explicit opt-in, so the checkbox starts
unticked and the timestamp is stored as evidence. It is only written when the
form actually offered the choice, so the homepage capture cannot silently revoke
a consent given on `/waitlist`.

Working on the backend:

```bash
npx convex dev          # watch mode, pushes functions as you edit
npx convex dev --once   # push once and exit
npx convex dashboard    # open the data browser
```

`npx convex dev` writes `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` into
`.env.local`, which is gitignored. `.env.production` is tracked and holds the
URL the deployed build talks to — that value is public, since Vite inlines it
into the bundle. The **deploy key is a secret** and lives outside the repo, at
`~/.convex-deploy-key` on the VPS.

### Deployments and keys

| | Deployment | Deploy key |
| --- | --- | --- |
| Production (the live site) | `effervescent-quail-296` (eu-west-1) | `~/.convex-deploy-key-prod` |
| Development (local only) | `veracious-viper-240` (eu-west-1) | `~/.convex-deploy-key` |

Both keys are mode 600 and live **outside** the repo. Never `export
CONVEX_DEPLOY_KEY` globally — it silently overrides `CONVEX_DEPLOYMENT`, so a
stray export sends every later CLI call to the wrong deployment without
complaining. Prefix it per command instead:

```bash
CONVEX_DEPLOY_KEY="$(cat ~/.convex-deploy-key-prod)" npx convex deploy
```

`npx convex deploy` pushes the backend; `./deploy/deploy.sh` only builds and
publishes the frontend and never touches Convex. **Backend goes first** — the
other order leaves the new bundle calling functions that do not exist yet.

The client URL cannot be derived from the deployment name: the region is part of
the hostname, and the region-less form resolves but returns 404, so a guess fails
at runtime with no DNS error to warn you. Get it authoritatively:

```bash
CONVEX_DEPLOY_KEY="$(cat ~/.convex-deploy-key-prod)" npx convex env get CONVEX_CLOUD_URL
```

`.env.local` deliberately still points at the dev deployment, so local `npm run
dev` cannot write to production. That also means **changing** `VITE_CONVEX_URL`
in `.env.production` is safe but **deleting** the line is not — the build would
silently fall back to `.env.local` and ship a bundle pointing at dev.

### Waitlist behaviour worth knowing

Re-submitting an address that is already on the list updates that row rather
than creating a second one — latest treatment selection wins, and it clears any
previous opt-out. The user sees "You are already on the list ✨".

Unsubscribe links work off an opaque per-signup token (`?token=…`), never the
address itself. The waitlist confirmation email carries one, in the footer and
as a `List-Unsubscribe` header.

## Email

Two kinds of mail leave the app, and they fail independently.

### To the team — enquiry notifications

Contact enquiries and merchant applications both email the team via Resend —
both are things a human has to answer. Waitlist signups deliberately do not;
they are bulk, and per-signup mail would be noise.

`convex/contact.ts` and `convex/merchants.ts` each schedule their notification
action on insert. Scheduling happens
inside the mutation, so it is atomic with the insert: if the row commits, the
attempt is guaranteed to run. The enquiry is never at risk from a mail failure.

**The send outcome is stored on the enquiry row** — `notifiedAt`,
`notifyAttempts`, `notifyError`. This is the whole point: a swallowed send error
is otherwise indistinguishable from success, so "did anyone actually get told
about this enquiry" would be unanswerable. Any row with no `notifiedAt` is an
enquiry nobody has been told about.

Retries are 1m, 5m, 15m, 1h, 6h — about 7.3 hours of cover, deliberately inside
Resend's 24h idempotency window so a retry cannot double-send (every request
carries an `Idempotency-Key`). Permanent failures (400/401/403/404/422) stop
immediately. An hourly cron (`convex/crons.ts`) sweeps anything still unsent
after 15 minutes, covering the one case self-rescheduling cannot: an action
killed before it could schedule its own retry.

**One failure deliberately costs nothing.** A 403 naming the sending domain, or
a missing environment variable, is a property of the deployment rather than of
the row, so it is recorded without spending the row's attempt budget and
without backing off. This matters more than it sounds: the sweep runs hourly
against a 24-attempt ceiling, which is exactly 24 hours of cover, so without it
every enquiry taken more than a day before the domain verified would already be
dead by the time anyone fixed the DNS. As written, the backlog survives
indefinitely and drains on the first sweep after verification.

### To the sender — confirmations

Every form also emails the person who submitted it, confirming receipt:
waitlist (a separate wording for an address already on the list), contact
enquiry, and merchant application. Templates live in `convex/mailTemplates.ts`.

These are branded HTML with a plain-text alternative, built to email
constraints rather than web ones — tables and inline styles, no images (the
AfterGlow mark is a coloured table cell, so nothing to block), webfonts
declared but never depended on, and every colour stated explicitly so a
force-inverting dark mode has nothing to guess at. Every field that reaches a
template came from a public unauthenticated form, so all of it is escaped.

**They are deliberately not financial promotions.** They confirm an action the
person just took; they do not offer, price, or induce a credit agreement. The
£10 welcome credit that `/waitlist` advertises is absent on purpose.

Confirmation outcomes live in their own fields — `confirmedAt`,
`confirmAttempts`, `confirmError` — never the `notify*` ones. Telling the team
and acknowledging the sender are separate sends that fail for separate reasons,
and one must not overwrite the evidence of the other.

The waitlist is the awkward one, because a re-submission reuses an existing row
and there is therefore no per-submission id to key Resend's idempotency on.
`confirmSends` supplies one: it counts confirmations queued for that row, so a
retry of the same submission dedupes while a genuine second signup sends again.
A successful confirmation also blocks another for an hour, so updating your city
twice does not put two emails in your inbox.

```bash
npm run mail:preview     # renders every variant to .mail-preview/, sends nothing
```

The preview set is chosen for the awkward cases, not the happy path: a signup
with nothing but an address (what the homepage CTA captures), a treatment list
long enough to truncate, and a submission full of markup as a standing check
that the templates escape.

**Deliberately not using `@convex-dev/resend`.** Its durability claim is weaker
than it looks: roughly 7.5 minutes of retry cover, and its failure callback only
fires from the Resend webhook path, so a batch that exhausts retries dies
silently in a component table with nothing to alert on. It would also add six
transitive dependencies and a second copy of every enquiry body to write GDPR
cleanup crons for.

### Environment variables (set on the Convex deployment, never in the repo)

| Variable | Purpose |
| -------- | ------- |
| `RESEND_API_KEY` | Resend API key. **Secret.** Deliberately the *send-only* key, not the full-access one — the runtime never needs to manage domains. |
| `RESEND_FROM` | Sending identity; must be on a verified Resend domain |
| `CONTACT_NOTIFY_TO` | Where contact enquiries land. Doubles as the `Reply-To` on waitlist and contact confirmations |
| `MERCHANT_NOTIFY_TO` | Where merchant applications land, and the `Reply-To` on merchant confirmations; falls back to `CONTACT_NOTIFY_TO` |
| `RESEND_CONFIRM_FROM` | Customer-facing sending identity. Optional; falls back to `RESEND_FROM`. Set separately so the address a customer sees is not the one internal alerts come from |
| `SITE_ORIGIN` | Public origin used to build unsubscribe links. Change at the `.com` cutover, alongside `VITE_SITE_ORIGIN` |

```bash
CONVEX_DEPLOY_KEY="$(cat ~/.convex-deploy-key-prod)" npx convex env set RESEND_API_KEY
```

Never give any of these a `VITE_` prefix — Vite inlines every `VITE_*` variable
into the public client bundle, including from gitignored env files. And note
`.env.production` **is tracked in git**, so it takes public values only.

### ⚠️ Email is not yet reaching anyone

No Resend sending domain is verified, so sends currently fail with
`403 … domain is not verified`, recorded in `notifyError` / `confirmError` as
`waiting on sending domain`. That is the system working as designed — the
submission is stored, no attempt budget is spent, and the hourly sweep keeps it
queued indefinitely.

The domain `notifications.afterglowcredit.com` has been created in Resend
(eu-west-1, matching Convex). What remains is adding its four DNS records **in
GoDaddy, which hosts the `.com` DNS — not Hostinger, which only hosts
`.online`** — and pressing Verify. No code change is needed afterwards: the
hourly sweep drains the backlog.

A subdomain of `.com` is the right choice because the recipients are `@afterglowcredit.com`
mailboxes and that domain publishes `p=quarantine` with relaxed alignment, so a
Resend DKIM signature on a subdomain aligns and passes.

### /book is still front-end only

The booking modal is a design mock — it takes no payment and writes nothing.
`TREATMENTS` in `src/pages/Book.tsx` is empty, so the page shows "COMING SOON",
matching the live site.

## Homepage — "Editorial Bloom"

The homepage is built from variant A of the AfterGlow Design System
(`design/AfterGlow Design System.zip`, source at
`explorations/homepage/VariantA.jsx`). Sections, in order: hero, trust strip,
how-it-works, categories, audiences, FAQ, waitlist CTA.

The design's testimonial section has been removed. Its quote — "Ava R. · London
· Waitlist member" — was placeholder copy from the mockup, and a fabricated
customer testimonial does not belong on a live consumer-credit site.

Three things differ deliberately from the mockup:

**The hero grid follows the spec, not the mockup's render.** The design says
`gridTemplateColumns: "1.05fr .95fr"`. The mockup does not render that way,
because its `<image-slot>` placeholder applies `aspect-ratio: 3/2` internally;
combined with the fixed `height: 540` that forces an 810px intrinsic width,
overflowing the grid and squeezing the text column to 303px — the exact
min-content width of "AFTER" at 92px. That is a placeholder artifact, not the
design, so the built page uses the specified 1.05/0.95 split.

**It is responsive.** The mockup is desktop-only — fixed pixel type and hard
`repeat(3, 1fr)` grids, no media queries. Headings here use `clamp()` and the
grids collapse at `sm`/`md`/`lg`. Verified free of horizontal overflow from
320px to 1920px.

**The trust strip moves.** The design renders it as a static centred row that
clips at both edges. It now drifts continuously and speeds up while the visitor
scrolls past it — which also solves the clipping, since everything comes into
view eventually rather than being permanently cut off on a phone.

See `src/components/Marquee.tsx`. It drifts at 34 px/s and accelerates with
scroll velocity up to 4×, easing back when scrolling stops. Speed is changed via
the Web Animations API `playbackRate` rather than by rewriting an
animation-duration, because the latter restarts the animation and makes the
strip visibly jump. Two identical copies tile seamlessly — spacing lives inside
each item rather than as a gap on the track, so one copy's width is exactly the
distance to translate. It pauses entirely when off screen, and does not animate
at all under `prefers-reduced-motion`.

### Icons

`public/favicon.ico` carries the brand mark at 16/32/48px, and
`public/apple-touch-icon.png` the full stacked wordmark at 180px. Small sizes use
an **A** monogram rather than the wordmark: "AFTER/GLOW" stacked is illegible at
16px, whereas the monogram stays crisp. The previous favicon was Lovable's
default — note the design system zip shipped that same file, so it is not a
source for this.

Regenerating them is a render-and-pack job rather than a design task: the mark is
drawn in HTML with Montserrat, screenshotted at each size with Playwright, and
the PNGs packed into an ICO (the format embeds PNG payloads directly).

### Images

Two real photographs, both imported (not served from `public/`) so Vite
content-hashes them into `/assets/`, which nginx serves immutable:

| File | Source master | Size |
| ---- | ------------- | ---- |
| `src/assets/hero-treatment.webp` | `design/homepage/afterglow-homepage-treatment-banner.png` | 39KB from 148KB |
| `src/assets/founder-louisa.webp` | `design/homepage/Meet the Founder.png` | 52KB from 1.8MB |

The founder photo is encoded at 1036×900 — enough to fill its 320×400 slot on a
2× display without upscaling, and no larger.

**Imported, not served from `public/`.** A file in `public/` keeps its name, so
it falls through to nginx's catch-all `location /`, which sets no `Cache-Control`
at all — and being unhashed, it could never be cache-busted either. Importing it
makes Vite emit a content-hashed file into `/assets/`, which is already served
`immutable` for a year.

The source is landscape (1095×615) and the slot is portrait (~513×540), so about
half the width is cropped. Only the horizontal axis is adjustable: the image
scales to exactly the box height, leaving no vertical overflow to position.
`objectPosition: "35% 50%"` keeps the eye, frond and lips in frame and lands the
price card over her hand rather than her mouth.

Worth knowing if the layout changes: at 1095×615 the source is only just enough
for this slot at 1× and will look soft on a high-DPI screen. A larger original
would be an easy win.

One slot still has no photography — "Client after a treatment" in the audiences
section — and renders as an on-brand blush panel via
`src/components/ImagePlaceholder.tsx` with the brief visible.

## Analytics and consent

Google Analytics 4, property `G-HJBJYG9743`. **One property covers both domains** —
at the move to `.com` we keep this measurement ID and edit the stream URL in the
GA4 admin. Do not create a second property: GA4 properties cannot be merged, and
a second one would strand the entire pre-launch dataset.

```
src/lib/analytics.ts       gtag shim, script loader, trackEvent
src/lib/consent.ts         consent cookie, GA cookie deletion
src/components/ConsentBanner.tsx
src/components/RouteTracker.tsx
```

**Nothing loads until consent.** `initAnalyticsShim()` runs at startup and only
installs the `dataLayer` queue — no request, no cookie. `loadAnalytics()` injects
the script and runs only on Accept. The split exists because deferring
everything to the consent callback would permanently lose the entry pageview,
which for a waitlist site is most of the landing data.

Analytics is inert unless `import.meta.env.PROD` **and** `VITE_GA_MEASUREMENT_ID`
is set. `.env.local` deliberately omits the ID, so `npm run dev` never sends
anything. Note `npm run preview` builds in production mode and **will** send live
events.

To exclude your own devices, run this once per browser on the live site, then
create the matching internal-traffic data filter in GA4:

```js
document.cookie = "ag_internal=1; max-age=31536000; path=/"
```

### Two things that are not obvious

**Enhanced measurement's history-based pageviews must stay off** in the GA4 admin.
`send_page_view: false` only suppresses the pageview from the `config` call; it
does not stop the history listener. That listener also fires synchronously on
`pushState`, before React updates `document.title`, so it reports the previous
page's title against the new page's URL — and it never refreshes
`document.referrer`, so every in-app navigation stays credited to the original
referrer.

**GA4's `form_submit` never fires on this site.** Enhanced measurement skips any
submit where `defaultPrevented` is true, and every React form prevents default.
Verified against the live tag with two otherwise-identical forms. `form_start`
does work, so the funnel is `form_start` → `af_form_submit` (ours, counts
attempts) → `generate_lead` / `merchant_application` (ours, counts successes),
with `af_form_error` covering failures.

### Events

| Event | Meaning |
| ----- | ------- |
| `generate_lead` | New waitlist signup. Key event. Not fired for duplicates, so it matches the Convex row count |
| `merchant_application` | Partner application. Key event. Custom name because B2B and B2C are different funnels and GA4 keys events by name only |
| `af_form_submit` | An attempt, successful or not |
| `contact_enquiry` | A contact form message, with `enquiry_type` |
| `af_form_error` | Attempt rejected, `error_type` is `validation` or `server` |
| `waitlist_duplicate` | Someone already on the list re-submitted |
| `page_not_found` | A 404 route rendered |

Custom parameters are namespaced `af_*` where GA4 has an auto-collected parameter
of the same name — `form_id` in particular means the DOM id in GA4's own events,
so ours is `af_form_id`. Every custom parameter needs registering as an
event-scoped custom dimension in the GA4 admin or it will not appear in reports.

### Legal pages

`src/pages/Privacy.tsx` and `src/pages/Terms.tsx` hold the documents supplied by
AfterGlow's advisers, rendered through the shared furniture in
`src/components/legal/LegalPage.tsx`. Both are lazy-loaded — they are large,
static and rarely opened, and were adding ~47KB to the bundle every visitor
downloads for the homepage.

**Published as drafted.** The only edits were to internal section
cross-references, which pointed at the wrong sections. Nine were corrected; no
wording was altered:

| Where | Was | Now |
| ----- | --- | --- |
| §1, §4 (×2), §5, §11, §13 | "section 17" for contact details | "section 16" |
| §3.2 table | "section 7" for marketing | "section 5" |
| §4, §9 | "section 14" for your rights | "section 13" |

The "PART A: PRIVACY POLICY" heading is not rendered — there is no Part B, and
the page title already says what the document is.

**The cookie table is published verbatim at the client's instruction, and lists
13 cookies the site does not set** — Meta, LinkedIn, TikTok and Google Ads
pixels are not installed, and `_gid`/`_gat` are Universal Analytics cookies that
GA4 does not set. Verified against the live site, which sets exactly three:
`afterglow_cookie_consent`, `_ga` and `_ga_HJBJYG9743`. If those pixels are
never added, the table should be trimmed.

The consent cookie was renamed from `ag_consent` to `afterglow_cookie_consent`
and its life extended to 12 months, because the published policy states both.
The old name is still read so nobody's existing choice is lost.

## Design tokens

The palette lives as HSL custom properties in `src/index.css` and is surfaced to
Tailwind in `tailwind.config.ts`. Four project-specific utilities sit alongside
the standard ones:

- `bg-glow` — radial blush gradient used on hero sections
- `bg-blush` — linear blush gradient used on band sections
- `shadow-soft` / `shadow-card-soft` — the two pink-tinted elevation levels
- `font-display` — Montserrat at 700 with tightened tracking

Body copy is Inter; both faces load from Google Fonts in `index.html`.

## Structure

```
src/
  components/
    layout/     Header, Footer, Layout
    ui/         Button, Card, Input, Label, Textarea, Sheet, Tabs
  lib/
    submissions.ts   ← the only place that talks to a backend
    utils.ts         ← cn() class merger
  pages/        Index, Waitlist, Merchants, Book, Unsubscribe, NotFound
```

Only the seven UI primitives the site actually uses are vendored, rather than the
full shadcn set.

## Deployment

Live at **https://afterglowcredit.online** on a Hostinger VPS (Ubuntu 24.04),
served as static files by nginx with an SPA fallback so client-side routes
resolve on hard refresh.

To deploy the current checkout:

```bash
./deploy/deploy.sh
```

That builds into `dist/`, copies it to a timestamped directory under
`/var/www/afterglow/releases/`, then atomically flips the
`/var/www/afterglow/current` symlink and reloads nginx. The last five releases
are kept, so rolling back is just repointing the symlink:

```bash
sudo ln -sfn /var/www/afterglow/releases/<timestamp> /var/www/afterglow/current.new
sudo mv -Tf /var/www/afterglow/current.new /var/www/afterglow/current
sudo systemctl reload nginx
```

### Moving to afterglowcredit.com

`deploy/cutover-to-com.sh` does the whole server side in one guarded run:
expands the existing certificate to cover all four hostnames, then installs
`deploy/nginx-com.conf`, which makes the apex canonical and 301s www and both
`.online` hostnames to it.

It **refuses to run** until all four names resolve to this server, because
expanding the certificate against a hostname still pointing at the old site
burns a Let's Encrypt failure for nothing. It also checks the MX records still
exist before touching anything.

Three things it deliberately does not do, because they are not server-side:
change `VITE_SITE_ORIGIN` in `.env.production` to the new origin and redeploy,
set `SITE_ORIGIN` on the Convex deployment to match (it builds the unsubscribe
links in outgoing email, so a stale value sends people to the old domain), and
edit the GA4 data stream URL.

`.online` keeps serving over HTTPS rather than being switched off — it was
issued HSTS with a one-year max-age, so browsers that have seen it will refuse
plain HTTP there until 2027, and the redirect needs a valid certificate to be
reachable at all.

### Server config

| Thing | Location |
| ----- | -------- |
| Site config | `/etc/nginx/sites-available/afterglow` |
| Shared headers | `/etc/nginx/snippets/afterglow-headers.conf` |
| Web root | `/var/www/afterglow/current` → `releases/<timestamp>` |
| Certificate | `/etc/letsencrypt/live/afterglowcredit.online/` |

`deploy/nginx.conf` is the pre-TLS starting point; certbot rewrote the installed
copy to add the 443 listeners and the HTTP→HTTPS redirect. Certificates renew
automatically via `certbot.timer`.

Headers are kept in a snippet because nginx's `add_header` does not merge across
levels — a single `add_header` in a `location` block discards everything
inherited from the server block. See the comment in
`deploy/security-headers.conf`.
