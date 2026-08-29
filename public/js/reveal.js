/**
 * Scroll reveals and count-ups.
 *
 * Elements carry `data-reveal` and an optional `--i` for stagger; the observer
 * only adds a class, so all the timing lives in CSS. Reduced-motion visitors
 * get everything revealed immediately.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal() {
  const targets = [
    ...document.querySelectorAll('[data-reveal], [data-reveal-line]'),
  ];
  if (!targets.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * Counts a numeric stat up to its final value once it scrolls in.
 * Values that are not plain numbers (ET, "30 days") are left alone.
 */
export function initCounters() {
  const values = [...document.querySelectorAll('.stat__value')];
  if (!values.length || reduced() || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;

        const el = entry.target;
        observer.unobserve(el);

        const final = el.textContent?.trim() ?? '';
        const match = final.match(/^(\d+)$/);
        if (!match) continue;

        const target = Number(match[1]);
        const duration = 900;
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min(1, (now - start) / duration);
          // Ease-out so it settles rather than stopping dead.
          const eased = 1 - (1 - progress) ** 3;
          el.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = final;
        };

        el.textContent = '0';
        requestAnimationFrame(step);
      }
    },
    { threshold: 0.5 },
  );

  values.forEach((el) => observer.observe(el));
}

/** Fires the hero's load sequence once fonts are ready, so nothing reflows. */
export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) {
    document.body.classList.add('is-ready');
    return;
  }

  const start = () => requestAnimationFrame(() => document.body.classList.add('is-ready'));

  if (document.fonts?.ready) {
    // Never wait more than a moment on the font — the text matters more.
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]).then(start);
  } else {
    start();
  }
}
