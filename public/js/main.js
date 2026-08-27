/**
 * Entry point. Every module is defensive about its own markup being absent,
 * so this can run unchanged on every page.
 */

import { initHeader, initDrawer } from './nav.js';
import { initReveal, initCounters, initHero } from './reveal.js';
import { initClocks } from './clock.js';
import { initCoverage } from './coverage.js';
import { initContactForm } from './form.js';

function boot() {
  initHeader();
  initDrawer();
  initReveal();
  initCounters();
  initHero();
  initClocks();
  initCoverage();
  initContactForm();

  // The hero canvas is the heaviest thing here, so it loads on demand and
  // only on pages that actually contain one.
  const meridian = document.querySelector('[data-meridian]');
  if (meridian) {
    import('./meridian.js')
      .then(({ initMeridian }) => initMeridian(meridian))
      .catch(() => {
        /* The hero reads fine without it. */
      });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
