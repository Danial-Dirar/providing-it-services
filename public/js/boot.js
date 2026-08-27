/*
 * Loaded synchronously in <head>.
 *
 * Every pre-animation hidden state in the stylesheet is scoped to `.js`, so if
 * this file is blocked or the module bundle fails, the page still renders with
 * all of its content visible. This is the only script that must run early.
 */
document.documentElement.classList.add('js');
