/** Header behaviour: the stuck state on scroll and the mobile drawer. */

export function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  let ticking = false;

  const update = () => {
    header.classList.toggle('is-stuck', window.scrollY > 24);
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
}

export function initDrawer() {
  const burger = document.querySelector('[data-burger]');
  const drawer = document.querySelector('[data-drawer]');
  if (!burger || !drawer) return;

  let lastFocused = null;

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);

    if (open) {
      lastFocused = document.activeElement;
      drawer.querySelector('a')?.focus();
    } else {
      lastFocused instanceof HTMLElement ? lastFocused.focus() : burger.focus();
    }
  };

  burger.addEventListener('click', () => {
    setOpen(burger.getAttribute('aria-expanded') !== 'true');
  });

  drawer.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
    }
  });

  // A resize past the desktop breakpoint should not leave the page locked.
  const desktop = window.matchMedia('(min-width: 64rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
