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
| `/privacy`     | Privacy       | Privacy notice; linked from the footer                    |
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
```

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

### ⚠️ This points at a development deployment

`.env.production` currently targets `veracious-viper-240`, which is a Convex
*dev* deployment. Dev deployments are per-developer and can be reset, so before
real launch traffic: create a production deployment, generate a production
deploy key, update `.env.production`, and redeploy.

### Waitlist behaviour worth knowing

Re-submitting an address that is already on the list updates that row rather
than creating a second one — latest treatment selection wins, and it clears any
previous opt-out. The user sees "You are already on the list ✨".

Unsubscribe links work off an opaque per-signup token (`?token=…`), never the
address itself. Nothing currently *sends* those emails; the page and the
backend for them exist and are tested.

### /book is still front-end only

The booking modal is a design mock — it takes no payment and writes nothing.
`TREATMENTS` in `src/pages/Book.tsx` is empty, so the page shows "COMING SOON",
matching the live site.

## Homepage — "Editorial Bloom"

The homepage is built from variant A of the AfterGlow Design System
(`design/AfterGlow Design System.zip`, source at
`explorations/homepage/VariantA.jsx`). Sections, in order: hero, trust strip,
how-it-works, categories, audiences, testimonial, FAQ, waitlist CTA.

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

**The trust strip scrolls on small screens.** The design centres one nowrap row
and lets it clip at both edges, which is fine on a desktop but would hide most
of the row on a phone, so below `md` it scrolls instead.

### Images

The design ships three empty image slots — a hero portrait, a post-treatment
shot, and a round client portrait. No photography was supplied, so these render
as on-brand blush panels via `src/components/ImagePlaceholder.tsx` with the
brief still visible. Swap each for an `<img>` as the shots arrive.

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
| `af_form_error` | Attempt rejected, `error_type` is `validation` or `server` |
| `waitlist_duplicate` | Someone already on the list re-submitted |
| `page_not_found` | A 404 route rendered |

Custom parameters are namespaced `af_*` where GA4 has an auto-collected parameter
of the same name — `form_id` in particular means the DOM id in GA4's own events,
so ours is `af_form_id`. Every custom parameter needs registering as an
event-scoped custom dimension in the GA4 admin or it will not appear in reports.

### Privacy

`src/pages/Privacy.tsx` describes what the site actually collects. **It must be
kept in step with the code** — if a form gains a field, or a third party is
added, that page changes too.

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
