import type hbs from 'hbs';

/**
 * Template helpers. Deliberately small — anything that needs real logic
 * belongs in a controller or the content service, not in a view.
 */
export function registerHandlebarsHelpers(engine: typeof hbs): void {
  /** {{#if (eq page 'home')}} */
  engine.registerHelper('eq', (a: unknown, b: unknown) => a === b);

  /** {{#if (startsWith path '/services')}} — for nav active states. */
  engine.registerHelper('startsWith', (value: unknown, prefix: unknown) =>
    typeof value === 'string' && typeof prefix === 'string' && value.startsWith(prefix));

  /** 0-based index to a padded ordinal: 0 → "01" */
  engine.registerHelper('ordinal', (index: unknown) =>
    String((typeof index === 'number' ? index : 0) + 1).padStart(2, '0'));

  /** {{inc @index}} for 1-based numbering and stagger delays. */
  engine.registerHelper('inc', (value: unknown) =>
    (typeof value === 'number' ? value : 0) + 1);

  /** Inline JSON for data attributes consumed by the client scripts. */
  engine.registerHelper('json', (value: unknown) =>
    JSON.stringify(value ?? null).replace(/</g, '\\u003c'));

  /** Splits a headline so each word can be animated on its own. */
  engine.registerHelper('words', (value: unknown): string[] =>
    typeof value === 'string' ? value.split(/\s+/).filter(Boolean) : []);

  /** {{#if (any collection)}} */
  engine.registerHelper('any', (value: unknown) =>
    Array.isArray(value) && value.length > 0);

  /** Limit a list in the template without adding a controller field. */
  engine.registerHelper('take', (value: unknown, count: unknown): unknown[] =>
    Array.isArray(value)
      ? (value as unknown[]).slice(0, typeof count === 'number' ? count : 0)
      : []);
}
