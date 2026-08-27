# Providing IT Services — corporate website

Server-rendered marketing site for Providing IT Services, a technology services
firm in Banani, Dhaka. Built on NestJS with Handlebars templates, hand-authored
CSS and vanilla ES modules. No client-side framework, no build step for the
front-end.

---

## Running it

```bash
npm install
cp .env.example .env      # already done on this machine
npm run dev               # watch mode, http://localhost:3100
```

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Nest in watch mode; templates and TypeScript both reload |
| `npm run build` | Compiles to `dist/` |
| `npm run prod` | Runs the compiled build (`NODE_ENV=production node dist/main`) |
| `npm run test:e2e` | Route and contact-API tests (25 of them) |
| `npm run lint` | ESLint (flat config) over `src/` and `test/`, with `--fix` |

Port 3000 was already taken on this machine by another dev server, so the
default here is **3100**. Change `PORT` in `.env` if you want something else.

---

## How it is put together

```
src/
  main.ts                       bootstrap: helmet, compression, hbs, static assets
  app.module.ts                 module wiring + global guard/interceptor/filter
  content/content.service.ts    ALL editorial content lives here
  site/site.controller.ts       every page route
  site/seo.controller.ts        robots.txt and sitemap.xml
  contact/                      the one endpoint that accepts input
  common/
    hbs-helpers.ts              template helpers (eq, take, ordinal, json …)
    interceptors/               merges company/nav/canonical into every view model
    filters/                    HTML error pages for browsers, JSON for /api
views/
  layouts/main.hbs              <head>, meta, JSON-LD, script/style tags
  partials/                     header, footer, cta, mark (inline SVG logo)
  pages/                        one template per route
public/
  css/site.css                  the whole design system, ~11.6 KB gzipped
  js/                           boot, nav, reveal, clock, coverage, form, meridian
  img/                          mark.svg, og.jpg, app icons
```

### Changing content

Everything a non-developer would want to edit — service copy, industries, case
studies, open roles, office address, phone, email — is in
`src/content/content.service.ts`. Templates read from it; nothing is hard-coded
in a view. Adding a service to that array creates its detail page, its footer
link, its sitemap entry and its contact-form option automatically.

### The design system

`public/css/site.css` is organised in numbered sections with a token block at
the top. The direction is documented in the file header. In short:

- **Colours** derive from the logo: deep navy grounds, a cyan signal accent,
  porcelain for light sections. One non-brand accent (`--saffron`) is reserved
  for "your time" in the coverage instrument — it is never decorative.
- **Type** is Archivo (expanded width, display), IBM Plex Sans (body) and IBM
  Plex Mono (anything instrument-like: practice codes, clocks, figures). All
  three are self-hosted from `public/fonts/` and declared in
  `public/css/fonts.css` — the site makes no third-party requests at all.
- **Structure** uses a stitched-hairline motif (`.stitch`, `.ticks`, `.mesh-bg`)
  rather than boxes and shadows.

### The signature elements

Two pieces carry the identity and are worth knowing about before editing:

**The Meridian** (`public/js/meridian.js`) — the hero canvas. A hairline globe
oriented so Dhaka sits on the visible hemisphere, with real great-circle routes
(computed by slerp) running to each delivery hub at its real coordinates. The
globe rocks between ±34° rather than spinning, so the origin node never leaves
the front face. Hub list comes from `ContentService.hubs`.

**The coverage instrument** (`public/js/coverage.js`) — the 24-cell band on the
home page. It reads the visitor's own time zone in their browser and shows how
much of *their* working day overlaps Dhaka's 09:00–18:00. Nothing is sent to
the server. Handles half-hour zone offsets (India, Nepal) by sampling the middle
of each hour.

### Robustness notes

- `public/js/boot.js` loads synchronously and adds `.js` to `<html>`. Every
  pre-animation hidden state in the CSS is scoped to `.js`, so if the module
  bundle fails the page still renders fully — nothing is invisible.
- `prefers-reduced-motion` disables the canvas animation (one static frame is
  drawn instead), all transitions and all reveals.
- The contact form posts over `fetch` but keeps its `action` and `method`, so
  the markup degrades to a normal form post if scripts are unavailable.

---

## Security and hardening already in place

- **Helmet** with an explicit CSP that is fully first-party: `default-src 'self'`,
  `script-src 'self'`, `font-src 'self'`, no inline scripts (the JSON-LD block is
  `application/ld+json`, which CSP does not treat as script).
- **Rate limiting** via `@nestjs/throttler` — 240 req/min site-wide, and the
  contact endpoint is tightened to 5 submissions per IP per hour.
- **Validation** with `class-validator`, `whitelist: true` and
  `forbidNonWhitelisted: true`, so unknown fields are rejected rather than
  stored.
- **Honeypot** field on the contact form; filled submissions get a normal-looking
  response and are dropped.
- `robots.txt` serves `Disallow: /` unless `NODE_ENV=production`, so a staging
  deploy cannot be indexed by accident.

---

## Not done yet

See `handout.md` for the full list, the open questions for the client, and where
to pick up next.
