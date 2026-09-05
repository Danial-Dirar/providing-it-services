# Handout — Providing IT Services website

**Last updated:** 29 August 2026
**Status:** Complete, working site running locally. Configured for Vercel but
not yet deployed. Content needs client sign-off before it goes anywhere public.

**Relocated to New York on 29 August 2026.** The site was originally written for
a Dhaka firm. Everything that carried the old location has moved — office
details, hours, working week, hub roster, industries, all three case studies,
every role, the legal governing law, the JSON-LD, and both live instruments.
Two of those were logic changes rather than copy changes, and are the things
most likely to bite: Eastern time observes daylight saving where UTC+6 did not,
and New York sits 17° further north, which changed the globe's composition.
Both are covered in §3.

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

**Fonts are self-hosted.** `public/fonts/` holds the woff2 subsets (10 files,
292 KB total, latin + latin-ext) and `public/css/fonts.css` declares them. Archivo and
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
New York team whose working day runs from the London afternoon through to the
San Francisco close. Those are the same idea, so the whole site is built on it:
an origin node, arcs leaving it, and a hairline mesh that behaves like
stitching.

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
   rocks ±34° so New York never rotates out of view. The pitch was flattened
   from -16° to -4° when the origin moved: New York is at 40.7°N against the
   old origin's 23.8°N, and the original tilt pushed it out to 84% of the
   globe's radius — pinned against the rim with the lower half empty.
**The hub roster is constrained by the globe, not just by the business.** The
five hubs are San Francisco, Chicago, Toronto, São Paulo and London. The Dhaka
build's roster (London, Dubai, Singapore, Sydney) was carried over at first and
three of the five turned out to sit on the far side of the world from New York —
Dubai and Singapore were visible 0% of the rocking cycle and Sydney 6%, so their
arcs drew but their nodes and labels never did, while the readout still claimed
"Routes active · 5". Anything east of about 25°E cannot be shown from a New York
origin. If someone wants Singapore back on the list, the globe has to change
too, or the node has to be allowed to sit on the back face deliberately.

2. **The coverage instrument** — 24-cell band reading the visitor's own time
   zone and showing how many of *their* working hours overlap New York's. Note
   that Eastern time observes daylight saving where the previous origin did
   not, so the office offset is now read live from `America/New_York` rather
   than hardcoded — see `public/js/clock.js`. It is the
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
| Founded | `2019` | The real year |
| Emails | `dailyjugandhar@gmail.com` for all three of general, new business and careers | A mailbox on the company domain once it exists — a Gmail address reads as a sole trader, not a services firm |
| Social links | LinkedIn / GitHub / Facebook slugs are guesses | Real URLs, or delete the rows |

Phone, address and the Maps pin were supplied by the client on 5 September 2026
and are now real: `+1 (347) 740-2467`, 4315 12th Avenue, Brooklyn, NY 11219. The
office moved from the placeholder Lower Manhattan address to Brooklyn at the
same time, so page copy, the four job-posting locations and the footer strap all
say Brooklyn now.

### Case studies — `caseStudies` array

All three are **invented**: the specialty-lender reporting platform, the
tri-state 3PL operator, the US SaaS support desk. The numbers in them
(11 days → 2, 4 hrs → 15 min, 6 hrs → 41 min, 72%, 300+ floor staff) are
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

`6 practices` and `ET` are true. `3 continents served` and `30-day defect
warranty` are claims the client has to actually stand behind. The warranty in
particular appears in three places and is written as a contractual commitment —
confirm it is one. The continent count is tied to the hub roster (San Francisco,
Chicago, Toronto, São Paulo, London) — if that roster changes, change the stat
with it.

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
but **a New York attorney needs to review them**. Both pages say so at the top;
remove that line once reviewed. The privacy notice correctly describes what the
site actually does today (no cookies, no analytics, no third-party requests at
all, time zone read locally and never sent) — if anyone adds analytics or a
third-party embed later, that paragraph has to change with it.

---

## 5. Technical work still open

Ordered by what I would do next.

### 5.1 Contact form has no email transport — highest priority

Right now `ContactService` writes enquiries to `data/enquiries/YYYY-MM-DD.jsonl`
and logs them. That proves the pipe works but **nobody gets notified**.

**On Vercel the file write is disabled** (read-only filesystem), so an enquiry
exists only as a `ENQUIRY {...}` line in the function log — which Hobby retains
for about an hour. Until a transport is wired, the deployed form loses enquiries
after that window. This is the blocker between "deployed" and "public". Add one
of:

- **SMTP** via `nodemailer` — simplest. Env vars are already scaffolded and
  commented out in `.env.example` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS`, `ENQUIRY_TO`). Add the transport alongside
  `ContactService.persist()`, and keep both the log line and the file write as
  fallbacks so a mail outage never loses an enquiry.
- **A transactional API** (Resend, Postmark, SES) — better deliverability from a
  server, and the CSP already permits `connect-src 'self'` only, which does not
  affect server-side calls. Resend is the least friction on Vercel: it installs
  from the Vercel Marketplace and injects `RESEND_API_KEY` itself. This is the
  recommended route.
- **A CRM webhook** if they use HubSpot/Zoho.

Also worth adding: an autoresponder to the sender quoting their `PITS-XXXXXX`
reference. The reference is already generated and returned to the browser.

### 5.2 Deployment — Vercel (wired up, not yet deployed)

The repo is configured for Vercel. Everything below already exists in the tree;
what is left is running the deploy.

**How it is put together**

- `api/index.js` is the serverless entrypoint. It is deliberately plain
  CommonJS: `npm run build` (tsc, via `nest build`) compiles `src/` to `dist/`
  with `emitDecoratorMetadata` intact, which NestJS DI needs. Vercel's own
  TypeScript path uses esbuild, which drops that metadata — so the entrypoint
  requires the already-compiled `dist/serverless.js` rather than any `.ts`.
- `src/create-app.ts` holds all app configuration. `src/main.ts` calls it then
  `listen()`s (local, VPS, Docker); `src/serverless.ts` calls it then `init()`s
  and caches the Express handler per warm instance. Both paths are configured
  identically — there is no "Vercel-only" middleware.
- `vercel.json` serves `public/` from the CDN (`outputDirectory: "public"`) and
  rewrites `/assets/*` onto it, so CSS, JS, fonts and images never invoke a
  function. Everything else falls through to `api/index`. Long cache headers are
  set per asset type; fonts are `immutable` for a year.
- `src/common/site-url.ts` centralises two things that NODE_ENV alone gets wrong
  on Vercel: `isProductionEnv()` reads `VERCEL_ENV` (Vercel sets
  `NODE_ENV=production` on previews too, which would otherwise let `robots.txt`
  invite crawlers onto a branch preview), and `resolveSiteUrl()` falls back to
  `VERCEL_URL` so preview canonicals point at themselves.
- The cache-busting `buildId` uses `VERCEL_GIT_COMMIT_SHA` when present, so it
  is stable across the instances of a single deploy rather than per cold start.

**Env vars to set:**

| Var | Where | Value | When |
|---|---|---|---|
| `SITE_URL` | Production only | `https://<real-domain>` | Once the domain is attached. Leave unset on Preview so previews self-canonicalise. |
| `ALLOW_INDEXING` | Production only | `true` | **At launch, not before** — see below. |

Everything else (`NODE_ENV`, `VERCEL`, `VERCEL_ENV`, `VERCEL_URL`,
`VERCEL_GIT_COMMIT_SHA`) is supplied by the platform.

**Indexing is opt-in.** Vercel deploys the default branch straight to
Production, so a first deploy would otherwise have gone live with `robots.txt`
saying `Allow: /` while the site still carries invented case studies.
`isIndexable()` in `src/common/site-url.ts` therefore
requires `ALLOW_INDEXING=true` on top of production; until it is set, robots.txt
says `Disallow: /` and every response carries `X-Robots-Tag: noindex, nofollow`.
Turning it on is the last step of launch, after §4 is resolved.

**Verified locally** by running `api/index.js` against a bare `http` server with
`VERCEL=1 VERCEL_ENV=production NODE_ENV=production` set: all routes 200,
`/nope` 404s, `/assets/*` serves, `POST /api/contact` returns 200 with a
reference on a read-only filesystem, canonicals use `SITE_URL`, and no
`localhost:3100` leaks into the HTML. Both indexing states were checked:
closed by default, and open (`Allow: /`, no `X-Robots-Tag`, real sitemap URL)
with `ALLOW_INDEXING=true`.

**Caveats that come with serverless**

- `ThrottlerModule` uses in-memory storage, so the 5-per-hour contact limit is
  per warm instance rather than global. The honeypot and validation still hold.
  If abuse shows up, move the throttler to Upstash Redis via the Vercel
  Marketplace.
- Cold starts are roughly 300–600 ms for the Nest boot. Warm requests are single
  digit ms. Fine for a marketing site.
- The `Logo/` directory (1.9 MB source JPEG) is in git but excluded from the
  deploy by `.vercelignore`.

**If Vercel is ever swapped for a VPS**, nothing needs undoing: `npm run build`
then `node dist/main` still works, with PM2 or a systemd unit and nginx in front
for TLS. Set `NODE_ENV=production` and `SITE_URL` yourself in that case. Docker
would also be fine; there is no Dockerfile yet.

### 5.3 Things I would add next

- **Analytics**, if the client wants it. Plausible or Umami are cookieless and
  keep the privacy notice honest. Anything you add needs a CSP `connect-src`
  entry and a line in `/privacy`.
- **Spanish language version.** Plausible for a New York services firm. The
  content service is already the single source of truth, so the clean route is
  `ContentService` returning per-locale content and an `/es` route prefix.
  Worth planning before more copy is written.
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
- `.env` is gitignored and already exists locally.
- The repo is on GitHub at `Danial-Dirar/providing-it-services`, `main` branch.
  Vercel deploys from it on push, so **`git push` is the deploy trigger** —
  check what is unpushed before assuming the live site matches the working tree.
- `Logo/` (1.9 MB) is committed but excluded from the deploy by `.vercelignore`.

---

## 6. Open questions for the client

Worth getting answers before the next build session:

1. Founding year, and a confirmed domain — contact details and address are
   now real (see §4). A mailbox on that domain to replace the Gmail address.
2. Do they have case studies they can publish, even anonymised? If not, `/work`
   should be cut for launch.
3. Do they stand behind the 30-day defect warranty and the four commitments?
4. Which roles are genuinely open?
5. Which domain, and do they already own it? Hosting is settled — Vercel, see
   §5.2 — but the domain decides `SITE_URL`, the email addresses and the
   social links.
6. Do they want Spanish alongside English?
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
  an inverted rotation in the globe that put the origin on the far side, route arcs
  flying out of frame, and a footer wordmark clipped mid-word.
- `prefers-reduced-motion` path renders everything visible with no animation.
- Response times ~5–10 ms locally; CSS 11.6 KB gzipped, JS ~11 KB gzipped,
  home page HTML 9.5 KB gzipped, fonts 292 KB. On Vercel the fonts are served
  from the CDN as `immutable` for a year and the rest of `/assets` for a day —
  see the `headers` block in `vercel.json`. The 30-day `maxAge` on Express only
  applies if the app is ever run on a plain Node server instead.
- Rendering verified identical after moving from Google Fonts to self-hosted
  files, so the variable-font axes really are working.

**Not verified:**
- **Nothing has been re-checked visually since the move to New York.** The QC
  in this section was done against the Dhaka build. The hero globe in
  particular changed shape — new origin latitude, new hub set, flatter pitch —
  and was tuned numerically (origin stays on the front face at 82% of radius,
  all five hubs visible 61–100% of the cycle, no arc leaves the canvas) rather
  than by eye. Take screenshots before showing anyone.
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

1. **Deploy to Vercel** and check the preview URL end to end (§5.2). Nothing
   below is blocked by it, and having a real URL makes every other step easier
   to check with the client.
2. Wire the contact form to real email (§5.1) — Resend via the Vercel
   Marketplace. Until this is done the deployed form loses enquiries, so do not
   share the URL outside the team.
3. Get the answers in §6 from the client.
4. Replace the placeholder content in §4 — contact details first, then decide
   the fate of `/work`.
5. Add the custom domain in Vercel, then set `SITE_URL` on Production to that
   domain and redeploy so canonicals, OG tags, JSON-LD and the sitemap are right.
6. Cross-browser and Lighthouse pass against the deployed URL.
7. Legal review of `/privacy` and `/terms`.
8. Launch — and only now set `ALLOW_INDEXING=true` on Production and redeploy,
   which is what actually opens the site to search engines.
