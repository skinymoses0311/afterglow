# Homepage redesign — drop files here

Put the new homepage design in this folder and it will be picked up from here.

## What to drop

Anything works, but the more structured the file, the more exactly the build can
match it:

| Format | How well it translates |
| ------ | ---------------------- |
| **HTML file** (a Claude artifact saved via *Download* / *Copy as HTML*) | Best — exact colours, spacing, type scale and structure can be read straight out of it |
| **React / JSX** | Best — maps almost directly onto the existing components |
| **SVG** | Good — vector, so exact geometry and colour values survive |
| **PNG / JPG screenshot** | Workable — the layout gets rebuilt by eye, so expect small differences and a round of tweaks |
| **Figma link** | Only if the file is public or shared, otherwise it cannot be opened from here |

Multiple files are fine — e.g. a desktop and a mobile version, or a full page
plus a detail shot. Name them so the intent is obvious (`desktop.html`,
`mobile.png`, `hero-detail.png`).

## Worth noting alongside the files

If any of these apply, add them to this file or drop a `notes.md` next to the
design:

- Whether it replaces the whole homepage or only certain sections
- Whether the existing header and footer stay as they are
- Whether the palette changes, or the current blush theme carries over
- Any copy changes (the current copy is carried over verbatim from
  afterglowcredit.com)

## What happens next

The homepage lives in [`src/pages/Index.tsx`](../../src/pages/Index.tsx), and the
design tokens it draws on are in [`src/index.css`](../../src/index.css) and
[`tailwind.config.ts`](../../tailwind.config.ts). Only `/` changes — the other
routes keep the current design unless you say otherwise.
