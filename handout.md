# Handout — Providing IT Services website

**Last updated:** 27 August 2026
**Status:** Complete, working site running locally. Not deployed. Content needs
client sign-off before it goes anywhere public.

Read this first if you are picking the project up in a new session. `README.md`
covers how to run it; this file covers *what was decided, what is fake, and what
to do next*.

---

## 1. Start here (30 seconds)

```bash
cd "/Users/muhammaddirar/Development/Providing IT Services"
npm run dev          # → http://localhost:3100
npm run test:e2e     # 25 tests, all passing as of this handout
npm run lint         # 0 errors, 33 warnings (all no-unsafe-* from untyped deps)
```

Port **3100**, not 3000 — port 3000 on this machine is held by another Next.js
dev server. That collision cost half an hour the first time (both processes bind
successfully, one on IPv4 and one on IPv6, so `localhost` silently routes to the
wrong app and you see a nonsense mix of 200s and 404s). If routes behave
strangely, check `lsof -ti tcp:<port>` before anything else.

---

## 2. What was built

A nine-route server-rendered marketing site, plus one API endpoint.

| Route | Notes |
|---|---|
| `/` | Home — hero, stats, practice matrix, coverage instrument, work, process, industries, commitments, CTA |
| `/services` | All six practices + the engagement process |
| `/services/:slug` | Six detail pages, generated from content data |
| `/industries` | Eight sectors + what repeats across them |
| `/work` | Three case studies |
| `/work/:slug` | Three detail pages |
| `/about` | Firm, commitments, process, location, hub clocks |
| `/careers` | Four open roles |
| `/careers/:slug` | Four role detail pages |
| `/contact` | Form → `POST /api/contact` |
| `/privacy`, `/terms` | Drafted, **needs a lawyer** |
| `/robots.txt`, `/sitemap.xml`, `/healthz` | Generated from content |
| 404 / 500 | Branded HTML error page with a full site index |

**Fonts are self-hosted.** `public/fonts/` holds the woff2 subsets (312 KB
total, latin + latin-ext) and `public/css/fonts.css` declares them. Archivo and
IBM Plex Sans turned out to be variable fonts — one file each covers the whole
weight range, and Archivo's `wdth` axis is what the display type depends on. IBM
Plex Mono is still static, so it ships three weights. Nothing on the site now
touches a third-party origin: the CSP is `default-src 'self'` with `font-src
'self'`, and the privacy notice says so truthfully.

**Stack decision:** the brief said NestJS, so this is NestJS end to end —
Handlebars server-side templates, hand-authored CSS, vanilla ES modules. No
React, no Tailwind, no front-end build step. That keeps the whole front end
under ~23 KB gzipped and means the design is fully controlled rather than
inherited from a utility framework. If a future phase needs a client-side app
(a customer portal, say), add it as a separate Next.js project behind the same
domain rather than retrofitting this one.

---

## 3. Design direction — "The Meridian"

Worth understanding before changing anything visual, because the pieces are
connected.

The logo is a globe with a signal radiating from one node. The business is a
Dhaka team whose working day overlaps four continents. Those are the same idea,
so the whole site is built on it: an origin node, arcs leaving it, and a hairline
mesh that behaves like stitching.

**Palette** (from the mark): `--ink #04162a` grounds, `--signal #23b9dd` accent,
`--porcelain #eef2f6` light sections, `--navy #0e3b69` structure. One non-brand
accent, `--saffron #e8a33d`, is reserved exclusively for "your time" in the
coverage instrument. It is functional colour, never decoration — please keep it
that way.

**Type:** Archivo at `font-stretch: 112%` for display (engineered signage feel),
IBM Plex Sans for reading, IBM Plex Mono for anything the site *reads off* rather
than says — practice codes, clocks, coordinates, figures.

**Structural device:** practices are labelled with two-letter codes (WD, DA, ES,
CS, BP, BD) rather than 01/02/03, because the practices are not a sequence. The
process section *is* a sequence, so it is the only place numbering appears.

**The two signature pieces:**

1. **The Meridian** — hero canvas. Real coordinates, real great circles, globe
   rocks ±34° so Dhaka never rotates out of view.
2. **The coverage instrument** — 24-cell band reading the visitor's own time
   zone and showing how many of *their* working hours overlap Dhaka's. It is the
   one thing on the page that talks about the reader instead of the company, and
   it is the strongest sales argument on the site. Don't remove it.

All contrast ratios were checked and pass WCAG AA (the light-mode cyan was
darkened from `#128fb2` to `#0d7089` for exactly this reason — 3.33:1 → 5.05:1).

---

## 4. ⚠️ Content that is placeholder — MUST be fixed before launch

This is the most important section of this document. **Everything below is
plausible invention, not fact.** All of it lives in
`src/content/content.service.ts`.

### Definitely wrong, will embarrass someone

| Item | Current value | Needs |
|---|---|---|
| Phone | `+880 1XXX-XXXXXX` | The real number |
| Address | Level 5, House 32, Road 11, Banani, Dhaka 1213 | The real address |
| Founded | `2019` | The real year |
| Emails | `hello@`, `newbusiness@`, `careers@providingitservices.com` | Confirm the domain and that these mailboxes exist |
| Social links | LinkedIn / GitHub / Facebook slugs are guesses | Real URLs, or delete the rows |
| Google Maps link | Points at "Banani, Dhaka" generally | Real pin |

### Case studies — `caseStudies` array

All three are **invented**: the NBFI reporting platform, the Gazipur garment
manufacturer, the European SaaS support desk. The numbers in them
(11 days → 2, 4 hrs → 15 min, 6 hrs → 41 min, 72%, 600+ operators) are
fabricated.

Two honest options:
- Replace with real engagements. Anonymised is fine — the site already says
  client names stay private until a public reference is agreed in writing.
- If there are no case studies yet, **delete the `/work` route and its home-page
  section entirely** rather than shipping invented ones. Publishing fake
  outcome metrics is the kind of thing that ends a deal when a prospect asks a
  follow-up question. The templates degrade cleanly if `caseStudies` is empty,
  but the routes and nav link need removing by hand.

### Stats strip — `stats` array

`6 practices` and `GMT+6` are true. `4 continents served` and `30-day defect
warranty` are claims the client has to actually stand behind. The warranty in
particular appears in three places and is written as a contractual commitment —
confirm it is one.

### Open roles — `roles` array

Four invented roles. Confirm which are actually open, or empty the array (the
careers page handles an empty list, but the copy around it says "4 positions" via
`{{roles.length}}`, so that stays correct automatically).

### Commitments — `principles` array

These are written as contract terms, not values ("You keep everything", "The
estimate is a commitment"). They are good copy *if the client agrees to them*.
Walk through all four with them before launch — do not soften them into generic
values statements, which would waste the strongest writing on the site.

### Legal pages

`/privacy` and `/terms` are drafted in plain English and are structurally sound,
but **a Bangladeshi lawyer needs to review them**. Both pages say so at the top;
remove that line once reviewed. The privacy notice correctly describes what the
site actually does today (no cookies, no analytics, no third-party requests at
all, time zone read locally and never sent) — if anyone adds analytics or a
third-party embed later, that paragraph has to change with it.

---

## 5. Technical work still open

Ordered by what I would do next.

### 5.1 Contact form has no email transport — highest priority

Right now `ContactService` writes enquiries to `data/enquiries/YYYY-MM-DD.jsonl`
and logs them. That proves the pipe works but **nobody gets notified**. Before
this site is public, add one of:

- **SMTP** via `nodemailer` — simplest. Env vars are already scaffolded and
  commented out in `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS`, `ENQUIRY_TO`). Add the transport inside
  `ContactService.persist()`'s sibling — keep the file write as a fallback so a
  mail outage never loses an enquiry.
- **A transactional API** (Resend, Postmark, SES) — better deliverability from a
  server, and the CSP already permits `connect-src 'self'` only, which does not
  affect server-side calls.
- **A CRM webhook** if they use HubSpot/Zoho.

Also worth adding: an autoresponder to the sender quoting their `PITS-XXXXXX`
reference. The reference is already generated and returned to the browser.

### 5.2 Deployment

Nothing is deployed. Suggested shape for a Bangladeshi client:

- **VPS** (DigitalOcean/Hetzner/local provider) with Node 22, `npm run build`,
  `node dist/main` under **PM2** or a **systemd** unit, **nginx** in front for
  TLS termination and as a reverse proxy.
- Set `NODE_ENV=production` — this switches `robots.txt` from `Disallow: /` to
  allowing crawlers, enables `upgrade-insecure-requests`, turns on 30-day static
  asset caching, and enables `trust proxy: 1` so rate limiting counts real
  client IPs rather than nginx's.
- Set `SITE_URL=https://<real-domain>` — canonical tags, OG URLs, JSON-LD and the
  sitemap all read from it.
- Certbot for TLS.

Docker would also be fine; there is no Dockerfile yet.

### 5.3 Things I would add next

- **Analytics**, if the client wants it. Plausible or Umami are cookieless and
  keep the privacy notice honest. Anything you add needs a CSP `connect-src`
  entry and a line in `/privacy`.
- **Bangla language version.** Likely to come up. The content service is already
  the single source of truth, so the clean route is `ContentService` returning
  per-locale content and a `/bn` route prefix. Worth planning before more copy
  is written.
- **A blog / insights section.** Good for SEO in a competitive category.
  Markdown files + a small content loader would fit the existing architecture.
- **Real photography.** There are currently zero photographs on the site. That
  is a deliberate choice — the illustration system carries it, and stock photos
  of people pointing at laptops would undo the whole direction. But an office
  photo on `/about` and real team faces on `/careers` would help both pages if
  the client can supply them. Insist on real photos, not stock.
- **Unit tests for `coverage.js`.** Its half-hour-offset handling is the
  trickiest logic in the front end and is currently only verified by eye. Jest is
  configured for `src/` only; a browser-module test setup would need adding.

### 5.4 Known small things

- `npm run lint` currently reports 33 warnings, all `no-unsafe-*` from
  `supertest` and Express typings that resolve to `any`. They are set to `warn`
  deliberately in `eslint.config.mjs`; the error count is what matters and it is
  zero. Do not silence them wholesale — a real unsafe access should be able to
  surface there.

- `views/partials/mark.hbs` and `public/img/mark.svg` are the same artwork with
  different element ids. If you change one, change both. The PNG icons
  (`apple-touch-icon.png`, `icon-512.png`) were rasterised from the SVG and would
  need regenerating too.
- The original client logo is preserved untouched at
  `Logo/Gemini_Generated_Image_dxbsswdxbsswdxbs.jpg`. The site does not use it
  directly; `public/img/og.jpg` is a 1200×630 crop of it for social previews,
  and `mark.svg` is a redrawn vector version that works on dark backgrounds and
  at favicon size.
- `.env` is gitignored and already exists locally. The repo has no git history
  yet — `git init` has not been run.

---

## 6. Open questions for the client

Worth getting answers before the next build session:

1. Real contact details, address, founding year, and confirmed domain.
2. Do they have case studies they can publish, even anonymised? If not, `/work`
   should be cut for launch.
3. Do they stand behind the 30-day defect warranty and the four commitments?
4. Which roles are genuinely open?
5. Where will this be hosted, and do they already own
   `providingitservices.com` (or which domain)?
6. Do they want Bangla alongside English?
7. Who receives contact-form enquiries, and do they have a mail service already?

---

## 7. QC that was actually done

So the next session knows what has and has not been verified.

**Verified:**
- All 25 routes return the right status, unknown URLs 404 (25 automated tests,
  all passing; `npm run lint` clean).
- Contact API: valid submission stores + returns a reference; invalid returns
  per-field messages; unknown budget rejected; unknown fields rejected; honeypot
  submissions silently dropped and not stored.
- The form was driven end to end in a real browser (fill, submit, success and
  error states), which is how two genuine bugs were caught and fixed:
  a raw class-validator message ("service must be shorter than or equal to 120
  characters") leaking into the UI, and the budget select's "Prefer not to say"
  option being rejected because `@IsOptional` skips `undefined` but not `''`.
  Both now have regression tests.
- Rendered HTML on every page checked for unrendered `{{…}}`, `undefined` and
  `[object Object]` — clean.
- Heading outline on the home page is properly nested (one h1, no skips).
- Contrast ratios computed for every text/background pair; all pass AA. One
  colour was changed as a result.
- Visual QC by screenshot at **1920, 1440, 1280 and 390 px**, including the
  mobile drawer open, the reduced-motion rendering, and every major section.
  Roughly a dozen layout bugs were found and fixed this way — an empty-grid-cell
  slab in the industries and hub grids, a headline overflowing into five wrapped
  lines, a checklist marker that read as a strikethrough, misaligned bullets,
  an inverted rotation in the globe that put Dhaka on the far side, route arcs
  flying out of frame, and a footer wordmark clipped mid-word.
- `prefers-reduced-motion` path renders everything visible with no animation.
- Response times ~5–10 ms locally; CSS 11.6 KB gzipped, JS ~11 KB gzipped,
  home page HTML 9.5 KB gzipped, fonts 312 KB (cached for 30 days in production).
- Rendering verified identical after moving from Google Fonts to self-hosted
  files, so the variable-font axes really are working.

**Not verified:**
- Never opened in Safari, Firefox or a real iOS/Android device. Screenshots were
  taken through Electron (Chromium) because Chrome and Playwright's browser
  download are both blocked on this network. **Do a real cross-browser pass
  before launch** — particularly `font-stretch` on the variable Archivo, the
  `mask` on the checklist ticks, and `backdrop-filter` on the stuck header, all
  of which have Safari quirks worth confirming.
- No Lighthouse run.
- Keyboard focus styling is implemented (`:focus-visible`, 2 px cyan outline)
  but was not tab-tested by hand.
- No screen-reader pass.

### If you need screenshots again

Chromium is unavailable, but a working Electron-based screenshot harness was
built at:

```
/private/tmp/claude-501/-Users-muhammaddirar-Development-Providing-IT-Services/<session>/scratchpad/qc/
```

That path is session-scoped and will be gone. To rebuild it: `npm i electron` in
a scratch directory (**must run with the sandbox disabled — npm's network is
blocked inside it**), then a small `main.js` that opens one offscreen
`BrowserWindow`, `loadURL`s each page, scrolls, and writes
`webContents.capturePage().toPNG()`. Two gotchas: unset `ELECTRON_RUN_AS_NODE`
(the harness sets it, which makes `require('electron')` return a path string
instead of the API), and **reuse a single window** — creating offscreen windows
in a loop crashes on macOS.

---

## 8. Suggested order for the next session

1. Get the answers in §6 from the client.
2. Replace the placeholder content in §4 — contact details first, then decide
   the fate of `/work`.
3. Wire the contact form to real email (§5.1).
4. Deploy to staging with `NODE_ENV=production` and a real `SITE_URL`.
5. Cross-browser and Lighthouse pass on staging.
6. Legal review of `/privacy` and `/terms`.
7. Launch.
