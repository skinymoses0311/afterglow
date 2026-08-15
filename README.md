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
| `/`            | Index         | Hero, "how it works", split customer/merchant cards       |
| `/waitlist`    | Waitlist      | Signup form with treatment multi-select                   |
| `/merchants`   | Merchants     | Partner application form + benefits grid                  |
| `/book`        | Book          | Category tabs; shows "COMING SOON" until partners are live |
| `/unsubscribe` | Unsubscribe   | Reads `?token=` from the query string                     |
| `*`            | NotFound      | 404                                                        |

## ⚠️ Backend status

The original site wrote form submissions directly to Supabase. That has been
removed — **Convex is the intended replacement and is not wired up yet.**

Everything funnels through `src/lib/submissions.ts`, which currently has
`BACKEND = "none"`. In that mode forms validate and show their success state,
but **submissions are logged to the console and then discarded**. Each function
returns `persisted: false` so callers can tell.

**Do not drive real traffic at the waitlist until Convex is connected**, or
signups will be silently lost. To connect it: add the Convex client, flip
`BACKEND` to `"convex"`, and fill in the four `TODO(convex)` bodies in that file.
Nothing else in the app needs to change.

`/book` is likewise front-end only — the booking modal is a design mock, takes no
payment, and the partner list (`TREATMENTS` in `src/pages/Book.tsx`) is empty,
matching the live site.

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

Built output is static. `dist/` is served by nginx on the VPS, with an SPA
fallback so client-side routes resolve on hard refresh.

```bash
npm ci && npm run build
```
